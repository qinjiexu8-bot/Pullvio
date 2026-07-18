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
from dataclasses import dataclass
from pathlib import Path

import boto3

from .clients import SupabaseRpcClient, load_supabase_credentials
from .domain import (
    WorkerError,
    YtDlpPolicy,
    classify_yt_dlp_failure,
    content_type_for,
    download_command,
    metadata_command,
    normalize_source_url,
    parse_queue_message,
    safe_content_disposition,
)


logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(message)s")
LOGGER = logging.getLogger("pullvio.worker")
STOP = False


@dataclass(frozen=True)
class Config:
    region: str
    queue_url: str
    bucket: str
    secret_arn: str
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
        self.config = config
        credentials = load_supabase_credentials(config.secret_arn, config.region)
        self.database = SupabaseRpcClient(credentials)
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
        uploaded_key: str | None = None
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

            source_url = normalize_source_url(claim["source_url"], claim["source_host"])
            with tempfile.TemporaryDirectory(prefix=f"{job_id}-", dir=self.config.temp_root) as workdir:
                self._wait_for_source_slot()
                metadata = self._probe(job_id, receipt, source_url)
                duration = int(metadata.get("duration") or 0)
                if duration <= 0 or duration > self.config.max_duration_seconds:
                    raise WorkerError("DURATION_LIMIT", "Media duration is outside the supported range")

                artifact = self._download(job_id, receipt, claim, source_url, Path(workdir))
                size = artifact.stat().st_size
                if size <= 0 or size > self.config.max_output_bytes:
                    raise WorkerError("OUTPUT_SIZE_LIMIT", "Output exceeds the supported size")

                digest = self._sha256(artifact)
                content_type = content_type_for(artifact)
                disposition = safe_content_disposition(job_id, artifact)
                uploaded_key = f"outputs/{job_id}/{uuid.uuid4().hex}{artifact.suffix.lower()}"
                self.s3.upload_file(
                    str(artifact),
                    self.config.bucket,
                    uploaded_key,
                    ExtraArgs={
                        "ContentType": content_type,
                        "ContentDisposition": disposition,
                        "ServerSideEncryption": "AES256",
                        "Metadata": {"job-id": job_id},
                    },
                )

                completed = self.database.rpc(
                    "complete_media_job",
                    {
                        "p_job_id": job_id,
                        "p_worker_id": self.config.worker_id,
                        "p_storage_bucket": self.config.bucket,
                        "p_storage_path": uploaded_key,
                        "p_content_type": content_type,
                        "p_content_disposition": disposition,
                        "p_checksum_sha256": digest,
                        "p_title": str(metadata.get("title") or "Untitled media")[:500],
                        "p_thumbnail_url": metadata.get("thumbnail"),
                        "p_duration_seconds": duration,
                        "p_file_size_bytes": size,
                        "p_processing_seconds": int(time.monotonic() - started),
                        "p_artifact_expires_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 6 * 3600)),
                    },
                )
                if completed is not True:
                    self.s3.delete_object(Bucket=self.config.bucket, Key=uploaded_key)
                    uploaded_key = None
                    raise WorkerError("COMMIT_CONFLICT", "Job could not be committed", retryable=True)

            self._delete(receipt)
            LOGGER.info("job_ready job_id=%s", job_id)
        except WorkerError as exc:
            self._handle_failure(job_id, receipt, exc, int(time.monotonic() - started), uploaded_key)
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
                uploaded_key,
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

    def _download(self, job_id: str, receipt: str, claim: dict, source_url: str, workdir: Path) -> Path:
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
        if len(outputs) != 1:
            raise WorkerError("OUTPUT_MISSING", "Expected one completed media output", retryable=True)
        return outputs[0]

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
                should_cancel = self.database.rpc(
                    "media_job_should_cancel",
                    {"p_job_id": job_id, "p_worker_id": self.config.worker_id},
                )
                if should_cancel is True:
                    self._stop_process(process)
                    raise WorkerError("CANCELED", "Job was canceled")
                self.database.rpc(
                    "heartbeat_media_job",
                    {
                        "p_job_id": job_id,
                        "p_worker_id": self.config.worker_id,
                        "p_lease_seconds": self.config.lease_seconds,
                    },
                )
                self.sqs.change_message_visibility(
                    QueueUrl=self.config.queue_url,
                    ReceiptHandle=receipt,
                    VisibilityTimeout=self.config.lease_seconds,
                )
                next_heartbeat = time.monotonic() + 30

        if process.returncode != 0:
            raise classify_yt_dlp_failure(stderr, process.returncode)
        return stdout

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

    def _handle_failure(self, job_id: str, receipt: str, error: WorkerError, seconds: int, uploaded_key: str | None):
        if uploaded_key:
            try:
                self.s3.delete_object(Bucket=self.config.bucket, Key=uploaded_key)
            except Exception:
                LOGGER.exception("artifact_cleanup_failed job_id=%s", job_id)
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
