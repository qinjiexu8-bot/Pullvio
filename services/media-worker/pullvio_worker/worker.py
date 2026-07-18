from __future__ import annotations

import hashlib
import json
import logging
import os
import signal
import socket
import subprocess
import tempfile
import time
import uuid
from dataclasses import dataclass, replace
from pathlib import Path

import boto3

from .clients import (
    SupabaseRpcClient,
    load_proxy_url,
    load_feishu_webhook_url,
    send_feishu_provider_alert,
    load_supabase_credentials,
    load_visolix_api_key,
)
from .domain import (
    WorkerError,
    YtDlpPolicy,
    classify_yt_dlp_failure,
    content_type_for,
    derive_audio_command,
    derive_thumbnail_command,
    download_command,
    metadata_command,
    normalize_source_url,
    normalize_video_command,
    parse_queue_message,
    safe_content_disposition,
)
from .visolix import VisolixClient, download_provider_result, provider_format_for


logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(message)s")
LOGGER = logging.getLogger("pullvio.worker")
STOP = False
VISOLIX_SOURCE_PLATFORMS = {"youtube", "instagram", "facebook", "snapchat", "okru"}


@dataclass(frozen=True)
class Config:
    region: str
    queue_url: str
    bucket: str
    secret_arn: str
    bilibili_proxy_secret_arn: str | None
    visolix_secret_arn: str | None
    feishu_secret_arn: str | None
    worker_id: str
    temp_root: str
    max_duration_seconds: int
    max_output_bytes: int
    command_timeout_seconds: int
    lease_seconds: int
    source_min_interval_seconds: float
    yt_dlp_policy: YtDlpPolicy

    @classmethod
    def from_environment(cls) -> "Config":
        required = {
            "PULLVIO_SQS_QUEUE_URL": os.getenv("PULLVIO_SQS_QUEUE_URL"),
            "PULLVIO_SUPABASE_SECRET_ARN": os.getenv("PULLVIO_SUPABASE_SECRET_ARN"),
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError(f"Missing worker configuration: {', '.join(missing)}")
        worker_id = os.getenv("PULLVIO_WORKER_ID") or f"{socket.gethostname()}-{os.getpid()}"
        return cls(
            region=os.getenv("AWS_REGION", "us-east-1"),
            queue_url=required["PULLVIO_SQS_QUEUE_URL"] or "",
            bucket=os.getenv("PULLVIO_S3_BUCKET", "pullvio"),
            secret_arn=required["PULLVIO_SUPABASE_SECRET_ARN"] or "",
            bilibili_proxy_secret_arn=os.getenv("PULLVIO_BILIBILI_PROXY_SECRET_ARN") or None,
            visolix_secret_arn=os.getenv("PULLVIO_VISOLIX_SECRET_ARN") or None,
            feishu_secret_arn=os.getenv("PULLVIO_FEISHU_SECRET_ARN") or None,
            worker_id=worker_id[:200],
            temp_root=os.getenv("PULLVIO_TMP_ROOT", "/work"),
            max_duration_seconds=int(os.getenv("PULLVIO_MAX_DURATION_SECONDS", "7200")),
            max_output_bytes=int(os.getenv("PULLVIO_MAX_OUTPUT_BYTES", "2147483648")),
            command_timeout_seconds=int(os.getenv("PULLVIO_COMMAND_TIMEOUT_SECONDS", "1800")),
            lease_seconds=int(os.getenv("PULLVIO_LEASE_SECONDS", "180")),
            source_min_interval_seconds=float(
                os.getenv("PULLVIO_SOURCE_MIN_INTERVAL_SECONDS", "10")
            ),
            yt_dlp_policy=YtDlpPolicy(
                pot_provider_url=os.getenv(
                    "PULLVIO_POT_PROVIDER_URL", "http://pot-provider:4416"
                ),
                youtube_player_client=os.getenv(
                    "PULLVIO_YOUTUBE_PLAYER_CLIENT", "mweb"
                ),
                sleep_requests_seconds=float(
                    os.getenv("PULLVIO_YTDLP_SLEEP_REQUESTS_SECONDS", "1")
                ),
                sleep_interval_seconds=int(
                    os.getenv("PULLVIO_YTDLP_SLEEP_INTERVAL_SECONDS", "8")
                ),
                max_sleep_interval_seconds=int(
                    os.getenv("PULLVIO_YTDLP_MAX_SLEEP_INTERVAL_SECONDS", "15")
                ),
                youtube_proxy=os.getenv("PULLVIO_YOUTUBE_PROXY"),
            ),
        )


class MediaWorker:
    def __init__(self, config: Config):
        if config.bilibili_proxy_secret_arn:
            proxy_url = load_proxy_url(config.bilibili_proxy_secret_arn, config.region)
            config = replace(
                config,
                yt_dlp_policy=replace(config.yt_dlp_policy, bilibili_proxy=proxy_url),
            )
        self.config = config
        credentials = load_supabase_credentials(config.secret_arn, config.region)
        self.database = SupabaseRpcClient(credentials)
        self.visolix = (
            VisolixClient(load_visolix_api_key(config.visolix_secret_arn, config.region))
            if config.visolix_secret_arn
            else None
        )
        self.feishu_webhook_url = (
            load_feishu_webhook_url(config.feishu_secret_arn, config.region)
            if config.feishu_secret_arn
            else None
        )
        self.sqs = boto3.client("sqs", region_name=config.region)
        self.s3 = boto3.client("s3", region_name=config.region)
        self._last_source_started_at = 0.0
        self._monotonic = time.monotonic
        self._sleep = time.sleep

    def run(self):
        LOGGER.info("worker_started worker_id=%s", self.config.worker_id)
        while not STOP:
            response = self.sqs.receive_message(
                QueueUrl=self.config.queue_url,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=20,
                VisibilityTimeout=self.config.lease_seconds,
                MessageAttributeNames=["All"],
            )
            for message in response.get("Messages", []):
                self.handle_message(message)
            self._deliver_pending_alert()
        LOGGER.info("worker_stopped worker_id=%s", self.config.worker_id)

    def handle_message(self, message: dict):
        receipt = message.get("ReceiptHandle")
        try:
            queue_message = parse_queue_message(message.get("Body", ""))
        except WorkerError as exc:
            LOGGER.warning("invalid_queue_message code=%s", exc.code)
            if receipt:
                self._delete(receipt)
            return

        job_id = queue_message.job_id
        started = time.monotonic()
        uploaded_keys: list[str] = []
        claimed = False
        try:
            claim_rows = self.database.rpc(
                "claim_media_job",
                {
                    "p_job_id": job_id,
                    "p_worker_id": self.config.worker_id,
                    "p_lease_seconds": self.config.lease_seconds,
                },
            )
            claim = claim_rows[0] if claim_rows else {"result_code": "NOT_FOUND"}
            decision = claim.get("result_code")
            if decision in {"NOT_FOUND", "TERMINAL", "CANCELED"}:
                self._delete(receipt)
                return
            if decision != "CLAIMED":
                return
            claimed = True

            source_url = normalize_source_url(
                claim["source_url"],
                claim["source_host"],
                claim["source_platform"],
            )
            with tempfile.TemporaryDirectory(prefix=f"{job_id}-", dir=self.config.temp_root) as workdir:
                self._wait_for_source_slot()
                if claim["source_platform"] in VISOLIX_SOURCE_PLATFORMS:
                    metadata, artifacts = self._download_provider_artifacts(
                        job_id, receipt, claim, source_url, Path(workdir)
                    )
                    duration = int(metadata.get("duration") or 0)
                else:
                    metadata = self._probe(job_id, receipt, source_url)
                    duration = int(metadata.get("duration") or 0)
                    allows_unknown_duration = claim["source_platform"] in {"imgur", "dropbox"}
                    if duration > self.config.max_duration_seconds or (duration <= 0 and not allows_unknown_duration):
                        raise WorkerError("DURATION_LIMIT", "Media duration is outside the supported range")
                    artifacts = self._download_artifacts(job_id, receipt, claim, source_url, Path(workdir))
                committed_artifacts = []
                for artifact_kind, artifact in artifacts.items():
                    size = artifact.stat().st_size
                    if size <= 0 or size > self.config.max_output_bytes:
                        raise WorkerError("OUTPUT_SIZE_LIMIT", "Output exceeds the supported size")
                    digest = self._sha256(artifact)
                    content_type = content_type_for(artifact)
                    disposition = safe_content_disposition(job_id, artifact_kind, artifact)
                    uploaded_key = f"outputs/{job_id}/{uuid.uuid4().hex}{artifact.suffix.lower()}"
                    self.s3.upload_file(
                        str(artifact), self.config.bucket, uploaded_key,
                        ExtraArgs={
                            "ContentType": content_type,
                            "ContentDisposition": disposition,
                            "ServerSideEncryption": "AES256",
                            "Metadata": {"job-id": job_id, "artifact-kind": artifact_kind},
                        },
                    )
                    uploaded_keys.append(uploaded_key)
                    committed_artifacts.append({
                        "kind": artifact_kind,
                        "storageBucket": self.config.bucket,
                        "storagePath": uploaded_key,
                        "contentType": content_type,
                        "contentDisposition": disposition,
                        "checksumSha256": digest,
                        "fileSizeBytes": size,
                    })

                completed = self.database.rpc(
                    "complete_media_job_v2",
                    {
                        "p_job_id": job_id,
                        "p_worker_id": self.config.worker_id,
                        "p_artifacts": committed_artifacts,
                        "p_title": str(metadata.get("title") or "Untitled media")[:500],
                        "p_thumbnail_url": metadata.get("thumbnail"),
                        "p_duration_seconds": duration,
                        "p_processing_seconds": int(time.monotonic() - started),
                    },
                )
                if completed is not True:
                    self._delete_uploaded_artifacts(job_id, uploaded_keys)
                    uploaded_keys = []
                    raise WorkerError("COMMIT_CONFLICT", "Job could not be committed", retryable=True)

            self._delete(receipt)
            LOGGER.info("job_ready job_id=%s", job_id)
        except WorkerError as exc:
            self._handle_failure(job_id, receipt, exc, int(time.monotonic() - started), uploaded_keys)
        except Exception:
            LOGGER.exception("job_unexpected_error job_id=%s", job_id)
            if not claimed:
                if receipt:
                    self.sqs.change_message_visibility(
                        QueueUrl=self.config.queue_url,
                        ReceiptHandle=receipt,
                        VisibilityTimeout=15,
                    )
                return
            self._handle_failure(
                job_id,
                receipt,
                WorkerError("PROCESSING_ERROR", "Unexpected processing error", retryable=True),
                int(time.monotonic() - started),
                uploaded_keys,
            )

    def _probe(self, job_id: str, receipt: str, source_url: str) -> dict:
        output = self._run(
            job_id,
            receipt,
            metadata_command(source_url, self.config.yt_dlp_policy),
            timeout=120,
        )
        try:
            value = json.loads(output)
        except json.JSONDecodeError as exc:
            raise WorkerError("METADATA_ERROR", "Metadata response was invalid", retryable=True) from exc
        if not isinstance(value, dict):
            raise WorkerError("METADATA_ERROR", "Metadata response was invalid", retryable=True)
        return value

    def _download_provider_artifacts(
        self,
        job_id: str,
        receipt: str,
        claim: dict,
        source_url: str,
        workdir: Path,
    ) -> tuple[dict, dict[str, Path]]:
        if self.visolix is None:
            raise WorkerError(
                "PROVIDER_NOT_CONFIGURED",
                "Media provider is not configured",
                retryable=False,
            )
        platform = claim["source_platform"]
        provider_format = provider_format_for(platform, claim["requested_quality"])
        rows = self.database.rpc(
            "begin_media_provider_run",
            {
                "p_job_id": job_id,
                "p_worker_id": self.config.worker_id,
                "p_provider_format": provider_format,
            },
        )
        run = rows[0] if rows else {"result_code": "INVALID_JOB"}
        decision = run.get("result_code")
        run_id = run.get("provider_run_id")
        provider_job_id = run.get("provider_job_id")
        if decision == "SUBMIT":
            started = self.database.rpc(
                "mark_media_provider_submission_started",
                {"p_run_id": run_id, "p_worker_id": self.config.worker_id},
            )
            if started is not True:
                raise WorkerError("PROVIDER_STATE_CONFLICT", "Provider submission state changed", retryable=True)
            submission = self.visolix.submit(
                source_url,
                platform,
                provider_format if platform == "youtube" else None,
            )
            recorded = self.database.rpc(
                "record_media_provider_submission",
                {
                    "p_run_id": run_id,
                    "p_worker_id": self.config.worker_id,
                    "p_provider_job_id": submission.provider_job_id,
                    "p_provider_info": submission.info,
                },
            )
            if recorded is not True:
                raise WorkerError(
                    "PROVIDER_SUBMISSION_AMBIGUOUS",
                    "Provider accepted the job but local state could not be committed",
                    retryable=False,
                )
            provider_job_id = submission.provider_job_id
            metadata = submission.info
        elif decision == "RESUME" and provider_job_id:
            metadata = {}
        elif decision == "AMBIGUOUS":
            raise WorkerError(
                "PROVIDER_SUBMISSION_AMBIGUOUS",
                "Provider submission outcome is unknown; automatic resubmission is disabled",
                retryable=False,
            )
        else:
            raise WorkerError("PROVIDER_STATE_CONFLICT", "Provider run is not processable", retryable=False)

        deadline = time.monotonic() + self.config.command_timeout_seconds
        while True:
            if STOP or time.monotonic() >= deadline:
                raise WorkerError("PROCESSING_TIMEOUT", "Media provider exceeded its time limit", retryable=True)
            progress = self.visolix.progress(provider_job_id)
            metadata = {**metadata, **progress.info}
            recorded = self.database.rpc(
                "record_media_provider_progress",
                {
                    "p_run_id": run_id,
                    "p_worker_id": self.config.worker_id,
                    "p_progress": progress.progress,
                    "p_result_url": progress.download_url,
                    "p_provider_info": metadata,
                    "p_next_poll_seconds": 5,
                },
            )
            if recorded is not True:
                raise WorkerError("PROVIDER_STATE_CONFLICT", "Provider progress could not be committed")
            if progress.completed and progress.download_url:
                break
            self._heartbeat(job_id, receipt)
            self._sleep(5)

        duration = int(metadata.get("duration") or 0)
        if duration > self.config.max_duration_seconds:
            raise WorkerError("DURATION_LIMIT", "Media duration is outside the supported range")

        provider_result = workdir / "provider-result"
        download_provider_result(
            progress.download_url,
            provider_result,
            self.config.max_output_bytes,
        )
        video = workdir / "artifact-video.mp4"
        self._run(
            job_id,
            receipt,
            normalize_video_command(provider_result, video),
            timeout=min(self.config.command_timeout_seconds, 600),
        )
        provider_result.unlink(missing_ok=True)
        artifacts: dict[str, Path] = {"video": video}
        audio = workdir / "artifact-audio.mp3"
        self._run(
            job_id,
            receipt,
            derive_audio_command(video, audio),
            timeout=min(self.config.command_timeout_seconds, 600),
        )
        artifacts["audio"] = audio
        cover = workdir / "artifact-cover.jpg"
        try:
            self._run(
                job_id,
                receipt,
                derive_thumbnail_command(video, cover),
                timeout=min(self.config.command_timeout_seconds, 180),
            )
            if cover.is_file() and cover.stat().st_size > 0:
                artifacts["thumbnail"] = cover
        except WorkerError as exc:
            LOGGER.warning("optional_thumbnail_derivative_failed job_id=%s code=%s", job_id, exc.code)
            cover.unlink(missing_ok=True)
        return metadata, artifacts

    def _download_artifacts(self, job_id: str, receipt: str, claim: dict, source_url: str, workdir: Path) -> dict[str, Path]:
        template = str(workdir / "artifact.%(ext)s")
        command = download_command(
            source_url,
            claim["media_kind"],
            claim["requested_quality"],
            template,
            self.config.max_output_bytes,
            self.config.yt_dlp_policy,
        )
        self._run(job_id, receipt, command, timeout=self.config.command_timeout_seconds)
        outputs = [
            path for path in workdir.iterdir()
            if path.is_file() and path.suffix.lower() in {".mp4", ".mp3"}
        ]
        expected_extension = ".mp3" if claim["media_kind"] == "audio" else ".mp4"
        primary = [path for path in outputs if path.suffix.lower() == expected_extension]
        if len(primary) != 1:
            raise WorkerError("OUTPUT_MISSING", "Expected one completed media output", retryable=True)
        artifacts = {claim["media_kind"]: primary[0]}
        thumbnails = [path for path in workdir.iterdir() if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg"}]
        if thumbnails:
            thumbnail = thumbnails[0]
            if thumbnail.suffix.lower() == ".jpeg":
                normalized = workdir / "artifact-cover.jpg"
                thumbnail.rename(normalized)
                thumbnail = normalized
            artifacts["thumbnail"] = thumbnail
        if claim["media_kind"] == "video":
            derived_audio = workdir / "artifact-audio.mp3"
            try:
                self._run(job_id, receipt, derive_audio_command(primary[0], derived_audio), timeout=min(self.config.command_timeout_seconds, 600))
                if derived_audio.is_file() and derived_audio.stat().st_size > 0:
                    artifacts["audio"] = derived_audio
            except WorkerError as exc:
                LOGGER.warning("optional_audio_derivative_failed job_id=%s code=%s", job_id, exc.code)
                derived_audio.unlink(missing_ok=True)
        return artifacts

    def _run(self, job_id: str, receipt: str, command: list[str], timeout: int) -> str:
        process = subprocess.Popen(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=False,
        )
        deadline = time.monotonic() + timeout
        next_heartbeat = time.monotonic() + 30
        while True:
            try:
                stdout, stderr = process.communicate(timeout=1)
                break
            except subprocess.TimeoutExpired:
                pass
            if STOP or time.monotonic() >= deadline:
                self._stop_process(process)
                raise WorkerError("PROCESSING_TIMEOUT", "Media command exceeded its time limit", retryable=True)
            if time.monotonic() >= next_heartbeat:
                try:
                    self._heartbeat(job_id, receipt)
                except WorkerError:
                    self._stop_process(process)
                    raise
                next_heartbeat = time.monotonic() + 30

        if process.returncode != 0:
            raise classify_yt_dlp_failure(stderr, process.returncode)
        return stdout

    def _heartbeat(self, job_id: str, receipt: str):
        should_cancel = self.database.rpc(
            "media_job_should_cancel",
            {"p_job_id": job_id, "p_worker_id": self.config.worker_id},
        )
        if should_cancel is True:
            raise WorkerError("CANCELED", "Job was canceled")
        renewed = self.database.rpc(
            "heartbeat_media_job",
            {
                "p_job_id": job_id,
                "p_worker_id": self.config.worker_id,
                "p_lease_seconds": self.config.lease_seconds,
            },
        )
        if renewed is not True:
            raise WorkerError("LEASE_LOST", "Media job lease could not be renewed", retryable=True)
        self.sqs.change_message_visibility(
            QueueUrl=self.config.queue_url,
            ReceiptHandle=receipt,
            VisibilityTimeout=self.config.lease_seconds,
        )

    @staticmethod
    def _stop_process(process: subprocess.Popen[str]):
        process.terminate()
        try:
            process.communicate(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.communicate()

    def _wait_for_source_slot(self):
        interval = max(float(self.config.source_min_interval_seconds), 0.0)
        now = self._monotonic()
        remaining = interval - (now - self._last_source_started_at)
        if remaining > 0:
            LOGGER.info("source_pacing_wait seconds=%.1f", remaining)
            self._sleep(remaining)
            now = self._monotonic()
        self._last_source_started_at = now

    def _delete_uploaded_artifacts(self, job_id: str, uploaded_keys: list[str]):
        for uploaded_key in uploaded_keys:
            try:
                self.s3.delete_object(Bucket=self.config.bucket, Key=uploaded_key)
            except Exception:
                LOGGER.exception("artifact_cleanup_failed job_id=%s key=%s", job_id, uploaded_key)

    def _handle_failure(self, job_id: str, receipt: str, error: WorkerError, seconds: int, uploaded_keys: list[str]):
        self._delete_uploaded_artifacts(job_id, uploaded_keys)
        if error.code == "PROVIDER_BALANCE_EXHAUSTED":
            handled = self.database.rpc(
                "fail_media_provider_balance",
                {"p_job_id": job_id, "p_worker_id": self.config.worker_id},
            )
            LOGGER.error("media_provider_balance_exhausted job_id=%s handled=%s", job_id, handled)
            if handled is True:
                self._deliver_pending_alert()
                self._delete(receipt)
                return
        result = self.database.rpc(
            "fail_media_job",
            {
                "p_job_id": job_id,
                "p_worker_id": self.config.worker_id,
                "p_failure_code": error.code,
                "p_retryable": error.retryable,
                "p_processing_seconds": max(seconds, 0),
            },
        )
        LOGGER.warning("job_failed job_id=%s code=%s result=%s", job_id, error.code, result)
        if result in {"FAILED", "CANCELED", "NOT_OWNED"}:
            self._delete(receipt)
        elif result == "RETRY":
            self.sqs.change_message_visibility(
                QueueUrl=self.config.queue_url,
                ReceiptHandle=receipt,
                VisibilityTimeout=5,
            )

    def _delete(self, receipt: str):
        self.sqs.delete_message(QueueUrl=self.config.queue_url, ReceiptHandle=receipt)

    def _deliver_pending_alert(self):
        if not self.feishu_webhook_url:
            return
        try:
            rows = self.database.rpc("claim_media_alert", {})
            if not rows:
                return
            alert = rows[0]
            send_feishu_provider_alert(
                self.feishu_webhook_url,
                alert["alert_type"],
                alert.get("payload") or {},
            )
            self.database.rpc(
                "complete_media_alert",
                {"p_alert_id": alert["alert_id"], "p_success": True, "p_error": None},
            )
        except Exception as exc:
            LOGGER.warning("media_alert_delivery_failed error=%s", type(exc).__name__)
            if "alert" in locals():
                try:
                    self.database.rpc(
                        "complete_media_alert",
                        {
                            "p_alert_id": alert["alert_id"],
                            "p_success": False,
                            "p_error": type(exc).__name__,
                        },
                    )
                except Exception:
                    LOGGER.exception("media_alert_state_update_failed")

    @staticmethod
    def _sha256(path: Path) -> str:
        digest = hashlib.sha256()
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest()


def _stop(_signum, _frame):
    global STOP
    STOP = True


def main():
    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)
    MediaWorker(Config.from_environment()).run()


if __name__ == "__main__":
    main()
