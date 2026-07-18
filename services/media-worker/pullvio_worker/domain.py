from __future__ import annotations

import json
import mimetypes
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


ALLOWED_HOSTS = {
    "youtube.com": "youtube",
    "www.youtube.com": "youtube",
    "m.youtube.com": "youtube",
    "music.youtube.com": "youtube",
    "youtu.be": "youtube",
    "tiktok.com": "tiktok",
    "www.tiktok.com": "tiktok",
    "m.tiktok.com": "tiktok",
    "vm.tiktok.com": "tiktok",
    "vt.tiktok.com": "tiktok",
    "vimeo.com": "vimeo",
    "www.vimeo.com": "vimeo",
    "player.vimeo.com": "vimeo",
    "soundcloud.com": "soundcloud",
    "www.soundcloud.com": "soundcloud",
    "m.soundcloud.com": "soundcloud",
    "on.soundcloud.com": "soundcloud",
}
UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


class WorkerError(RuntimeError):
    def __init__(self, code: str, message: str, *, retryable: bool = False):
        super().__init__(message)
        self.code = code
        self.retryable = retryable


@dataclass(frozen=True)
class QueueMessage:
    job_id: str
    schema_version: int = 1


@dataclass(frozen=True)
class YtDlpPolicy:
    pot_provider_url: str
    youtube_player_client: str = "mweb"
    sleep_requests_seconds: float = 1.0
    sleep_interval_seconds: int = 8
    max_sleep_interval_seconds: int = 15
    youtube_proxy: str | None = None

    def __post_init__(self):
        provider = urlsplit(self.pot_provider_url)
        if (
            provider.scheme != "http"
            or provider.hostname not in {"pot-provider", "localhost", "127.0.0.1"}
            or provider.port != 4416
            or provider.path not in {"", "/"}
            or provider.query
            or provider.fragment
            or provider.username
            or provider.password
        ):
            raise ValueError("PO Token provider must be the private local service on port 4416")
        if self.youtube_player_client != "mweb":
            raise ValueError("Only the reviewed mweb YouTube client is allowed")
        if not 0.5 <= self.sleep_requests_seconds <= 10:
            raise ValueError("Request pacing must be between 0.5 and 10 seconds")
        if not 1 <= self.sleep_interval_seconds <= self.max_sleep_interval_seconds <= 60:
            raise ValueError("Download pacing is invalid")
        if self.youtube_proxy is not None:
            try:
                parsed_proxy = urlsplit(self.youtube_proxy)
                if parsed_proxy.scheme not in {"http", "https", "socks5", "socks5h"}:
                    raise ValueError("YouTube proxy scheme must be http, https, socks5, or socks5h")
                if not parsed_proxy.netloc:
                    raise ValueError("YouTube proxy must have a valid network location (host:port)")
            except Exception as exc:
                raise ValueError("YouTube proxy URL is invalid") from exc


def parse_queue_message(body: str) -> QueueMessage:
    try:
        value = json.loads(body)
    except json.JSONDecodeError as exc:
        raise WorkerError("INVALID_MESSAGE", "SQS body is not JSON") from exc
    if not isinstance(value, dict) or value.get("schemaVersion") != 1:
        raise WorkerError("INVALID_MESSAGE", "Unsupported SQS message schema")
    job_id = value.get("jobId")
    if not isinstance(job_id, str) or not UUID_PATTERN.fullmatch(job_id):
        raise WorkerError("INVALID_MESSAGE", "SQS job ID is invalid")
    return QueueMessage(job_id=job_id.lower())


def normalize_source_url(value: str, expected_host: str) -> str:
    try:
        parsed = urlsplit(value)
    except ValueError as exc:
        raise WorkerError("INVALID_SOURCE", "Source URL could not be parsed") from exc
    host = (parsed.hostname or "").lower().rstrip(".")
    if (
        parsed.scheme != "https"
        or parsed.username
        or parsed.password
        or parsed.port
        or host not in ALLOWED_HOSTS
        or host != expected_host
    ):
        raise WorkerError("INVALID_SOURCE", "Source URL failed the worker allowlist")
    segments = [segment for segment in parsed.path.split("/") if segment]
    platform = ALLOWED_HOSTS[host]
    if platform == "vimeo":
        is_public_video = (
            len(segments) == 2 and segments[0] == "video" and segments[1].isdigit()
            if host == "player.vimeo.com"
            else len(segments) == 1 and segments[0].isdigit()
        )
        if not is_public_video:
            raise WorkerError("INVALID_SOURCE", "Vimeo URL is not a single public video")
    if platform == "soundcloud":
        is_short_link = host == "on.soundcloud.com" and len(segments) == 1
        is_public_track = len(segments) == 2 and segments[0] not in {
            "discover", "popular", "search", "sets", "stream", "you"
        }
        if not is_short_link and not is_public_track:
            raise WorkerError("INVALID_SOURCE", "SoundCloud URL is not a single public track")
    return urlunsplit(("https", host, parsed.path, parsed.query, ""))


def _source_policy_arguments(source_url: str, policy: YtDlpPolicy) -> list[str]:
    host = (urlsplit(source_url).hostname or "").lower().rstrip(".")
    if ALLOWED_HOSTS.get(host) != "youtube":
        return []
    args = [
        "--extractor-args",
        f"youtube:player_client={policy.youtube_player_client}",
        "--extractor-args",
        f"youtubepot-bgutilhttp:base_url={policy.pot_provider_url}",
        "--sleep-requests",
        str(policy.sleep_requests_seconds),
        "--sleep-interval",
        str(policy.sleep_interval_seconds),
        "--max-sleep-interval",
        str(policy.max_sleep_interval_seconds),
    ]
    if policy.youtube_proxy:
        args += ["--proxy", policy.youtube_proxy]
    return args


def metadata_command(source_url: str, policy: YtDlpPolicy) -> list[str]:
    return [
        "yt-dlp",
        "--dump-single-json",
        "--skip-download",
        "--no-playlist",
        "--no-warnings",
        "--socket-timeout",
        "20",
        "--retries",
        "2",
        *_source_policy_arguments(source_url, policy),
        source_url,
    ]


def download_command(
    source_url: str,
    media_kind: str,
    requested_quality: str,
    output_template: str,
    max_output_bytes: int,
    policy: YtDlpPolicy,
) -> list[str]:
    host = (urlsplit(source_url).hostname or "").lower().rstrip(".")
    if ALLOWED_HOSTS.get(host) == "soundcloud" and media_kind != "audio":
        raise WorkerError("INVALID_OPTIONS", "SoundCloud is supported in audio mode only")
    base = [
        "yt-dlp",
        "--no-playlist",
        "--no-warnings",
        "--restrict-filenames",
        "--socket-timeout",
        "20",
        "--retries",
        "2",
        "--max-filesize",
        str(max_output_bytes),
        "--output",
        output_template,
        *_source_policy_arguments(source_url, policy),
    ]
    if media_kind == "audio":
        return base + ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0", source_url]
    if media_kind != "video":
        raise WorkerError("INVALID_OPTIONS", "Unsupported media kind")

    height = requested_quality.removesuffix("p")
    if requested_quality == "best":
        selector = "bestvideo*+bestaudio/best"
    elif height.isdigit() and int(height) in {480, 720, 1080, 1440, 2160}:
        selector = f"bestvideo*[height<={height}]+bestaudio/best[height<={height}]"
    else:
        raise WorkerError("INVALID_OPTIONS", "Unsupported media quality")
    return base + ["--format", selector, "--merge-output-format", "mp4", source_url]


def classify_yt_dlp_failure(stderr: str, returncode: int = 1) -> WorkerError:
    normalized = stderr.casefold()
    if "sign in to confirm" in normalized or "not a bot" in normalized:
        return WorkerError(
            "SOURCE_BLOCKED",
            "The source rejected this worker network",
            retryable=False,
        )
    if "http error 429" in normalized or "too many requests" in normalized:
        return WorkerError(
            "SOURCE_RATE_LIMITED",
            "The source rate-limited this worker network",
            retryable=False,
        )
    if returncode in {1, 2}:
        return WorkerError("SOURCE_UNAVAILABLE", "The source could not be processed", retryable=False)
    return WorkerError("PROCESSING_ERROR", "The media command failed", retryable=True)


def safe_content_disposition(job_id: str, artifact: Path) -> str:
    extension = artifact.suffix.lower()
    if extension not in {".mp4", ".mp3"}:
        raise WorkerError("INVALID_OUTPUT", "Unexpected output extension")
    return f'attachment; filename="pullvio-{job_id}{extension}"'


def content_type_for(artifact: Path) -> str:
    if artifact.suffix.lower() == ".mp4":
        return "video/mp4"
    if artifact.suffix.lower() == ".mp3":
        return "audio/mpeg"
    return mimetypes.guess_type(artifact.name)[0] or "application/octet-stream"
