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
    "instagram.com": "instagram",
    "www.instagram.com": "instagram",
    "m.instagram.com": "instagram",
    "facebook.com": "facebook",
    "www.facebook.com": "facebook",
    "m.facebook.com": "facebook",
    "web.facebook.com": "facebook",
    "fb.watch": "facebook",
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
    "bilibili.com": "bilibili",
    "www.bilibili.com": "bilibili",
    "pinterest.com": "pinterest",
    "www.pinterest.com": "pinterest",
    "clips.twitch.tv": "twitch",
    "twitch.tv": "twitch",
    "www.twitch.tv": "twitch",
    "dailymotion.com": "dailymotion",
    "www.dailymotion.com": "dailymotion",
    "dai.ly": "dailymotion",
    "streamable.com": "streamable",
    "www.streamable.com": "streamable",
    "snapchat.com": "snapchat",
    "www.snapchat.com": "snapchat",
    "ok.ru": "okru",
    "www.ok.ru": "okru",
    "m.ok.ru": "okru",
    "imgur.com": "imgur",
    "www.imgur.com": "imgur",
    "i.imgur.com": "imgur",
    "loom.com": "loom",
    "www.loom.com": "loom",
    "dropbox.com": "dropbox",
    "www.dropbox.com": "dropbox",
}
UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


class WorkerError(RuntimeError):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        provider_http_status: int | None = None,
        provider_outcome_known: bool | None = None,
        safe_diagnostic: dict[str, object] | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.provider_http_status = provider_http_status
        self.provider_outcome_known = provider_outcome_known
        self.safe_diagnostic = dict(safe_diagnostic or {})


@dataclass(frozen=True)
class QueueMessage:
    job_id: str
    schema_version: int = 1
    action: str = "process"


@dataclass(frozen=True)
class YtDlpPolicy:
    pot_provider_url: str
    youtube_player_client: str = "mweb"
    sleep_requests_seconds: float = 1.0
    sleep_interval_seconds: int = 8
    max_sleep_interval_seconds: int = 15
    youtube_proxy: str | None = None
    bilibili_proxy: str | None = None

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
            _validate_proxy_url(self.youtube_proxy, "YouTube")
        if self.bilibili_proxy is not None:
            _validate_proxy_url(self.bilibili_proxy, "Bilibili")


def _validate_proxy_url(value: str, label: str):
    try:
        parsed_proxy = urlsplit(value)
        if parsed_proxy.scheme not in {"http", "https", "socks5", "socks5h"}:
            raise ValueError(f"{label} proxy uses an unsupported scheme")
        if not parsed_proxy.hostname:
            raise ValueError(f"{label} proxy must include a host")
        if parsed_proxy.path not in {"", "/"} or parsed_proxy.query or parsed_proxy.fragment:
            raise ValueError(f"{label} proxy must not include a path, query, or fragment")
    except Exception as exc:
        raise ValueError(f"{label} proxy URL is invalid") from exc


def parse_queue_message(body: str) -> QueueMessage:
    try:
        value = json.loads(body)
    except json.JSONDecodeError as exc:
        raise WorkerError("INVALID_MESSAGE", "SQS body is not JSON") from exc
    if not isinstance(value, dict) or value.get("schemaVersion") not in {1, 2}:
        raise WorkerError("INVALID_MESSAGE", "Unsupported SQS message schema")
    schema_version = value["schemaVersion"]
    action = "process" if schema_version == 1 else value.get("action")
    if action != "process":
        raise WorkerError("INVALID_MESSAGE", "Unsupported SQS message action")
    job_id = value.get("jobId")
    if not isinstance(job_id, str) or not UUID_PATTERN.fullmatch(job_id):
        raise WorkerError("INVALID_MESSAGE", "SQS job ID is invalid")
    return QueueMessage(
        job_id=job_id.lower(),
        schema_version=schema_version,
        action=action,
    )


def normalize_source_url(value: str, expected_host: str, expected_platform: str | None = None) -> str:
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
    if expected_platform is not None and platform != expected_platform:
        raise WorkerError("INVALID_SOURCE", "Source platform failed the worker allowlist")
    if platform == "instagram":
        shortcode = segments[1] if len(segments) > 1 else ""
        is_video_post = (
            len(segments) == 2
            and segments[0] in {"p", "reel", "reels", "tv"}
            and re.fullmatch(r"[A-Za-z0-9_-]+", shortcode) is not None
        )
        is_public_story = (
            len(segments) == 3
            and segments[0] == "stories"
            and re.fullmatch(r"[A-Za-z0-9._]+", segments[1]) is not None
            and segments[2].isdigit()
        )
        if not is_video_post and not is_public_story:
            raise WorkerError("INVALID_SOURCE", "Instagram URL is not a direct public video")
    if platform == "facebook":
        is_token = lambda value: value is not None and re.fullmatch(r"[A-Za-z0-9._-]+", value) is not None
        query = dict(item.split("=", 1) for item in parsed.query.split("&") if "=" in item)
        is_short_link = host == "fb.watch" and len(segments) == 1 and is_token(segments[0])
        is_watch = len(segments) == 1 and segments[0] in {"watch", "video.php"} and is_token(query.get("v"))
        is_reel = len(segments) == 2 and segments[0] in {"reel", "reels", "videos"} and is_token(segments[1])
        is_profile_video = len(segments) == 3 and segments[1] == "videos" and is_token(segments[0]) and is_token(segments[2])
        is_shared_video = len(segments) == 3 and segments[0] == "share" and segments[1] in {"v", "r"} and is_token(segments[2])
        if not any((is_short_link, is_watch, is_reel, is_profile_video, is_shared_video)):
            raise WorkerError("INVALID_SOURCE", "Facebook URL is not a direct public video")
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
    if platform == "bilibili":
        video_id = segments[1] if len(segments) == 2 else ""
        is_public_video = (
            len(segments) == 2
            and segments[0] == "video"
            and (
                re.fullmatch(r"BV[0-9A-Za-z]{10}", video_id) is not None
                or re.fullmatch(r"av\d+", video_id, re.IGNORECASE) is not None
            )
        )
        if not is_public_video:
            raise WorkerError("INVALID_SOURCE", "Bilibili URL is not a single public video")
    if platform == "pinterest":
        if len(segments) != 2 or segments[0] != "pin" or not segments[1].isdigit():
            raise WorkerError("INVALID_SOURCE", "Pinterest URL is not a single public video Pin")
    if platform == "twitch":
        is_clip_host = host == "clips.twitch.tv" and len(segments) == 1 and re.fullmatch(r"[\w-]+", segments[0])
        is_channel_clip = (
            len(segments) == 3
            and segments[1] == "clip"
            and re.fullmatch(r"[\w-]+", segments[0])
            and re.fullmatch(r"[\w-]+", segments[2])
        )
        if not is_clip_host and not is_channel_clip:
            raise WorkerError("INVALID_SOURCE", "Twitch URL is not a single public clip")
    if platform == "dailymotion":
        is_short_link = host == "dai.ly" and len(segments) == 1 and re.fullmatch(r"[\w-]+", segments[0])
        is_video_page = (
            len(segments) == 2
            and segments[0] == "video"
            and re.fullmatch(r"[\w-]+", segments[1])
        )
        if not is_short_link and not is_video_page:
            raise WorkerError("INVALID_SOURCE", "Dailymotion URL is not a single public video")
    if platform == "streamable":
        if len(segments) != 1 or re.fullmatch(r"[A-Za-z0-9]+", segments[0]) is None:
            raise WorkerError("INVALID_SOURCE", "Streamable URL is not a single public video")
    if platform == "snapchat":
        is_spotlight = len(segments) == 2 and segments[0] == "spotlight" and re.fullmatch(r"[\w-]+", segments[1]) is not None
        is_public_story = (
            len(segments) == 3
            and segments[0] == "add"
            and re.fullmatch(r"[\w.-]+", segments[1]) is not None
            and re.fullmatch(r"[\w-]+", segments[2]) is not None
        )
        if not is_spotlight and not is_public_story:
            raise WorkerError("INVALID_SOURCE", "Snapchat URL is not a direct public Spotlight or Story")
    if platform == "okru":
        if len(segments) != 2 or segments[0] not in {"video", "videoembed"} or not segments[1].isdigit():
            raise WorkerError("INVALID_SOURCE", "OK.ru URL is not a direct public video")
    if platform == "imgur":
        if len(segments) != 1 or re.fullmatch(r"[A-Za-z0-9]{5,12}(?:\.(?:mp4|gifv))?", segments[0]) is None:
            raise WorkerError("INVALID_SOURCE", "Imgur URL is not a single public video or GIFV")
    if platform == "loom":
        if len(segments) != 2 or segments[0] != "share" or re.fullmatch(r"[a-f0-9]{32}", segments[1], re.IGNORECASE) is None:
            raise WorkerError("INVALID_SOURCE", "Loom URL is not a public share")
    if platform == "dropbox":
        is_legacy_share = (
            len(segments) >= 2
            and segments[0] == "s"
            and re.fullmatch(r"[\w-]+", segments[1]) is not None
        )
        is_file_share = (
            len(segments) >= 3
            and segments[0] == "scl"
            and segments[1] == "fi"
            and re.fullmatch(r"[\w-]+", segments[2]) is not None
        )
        if not is_legacy_share and not is_file_share:
            raise WorkerError("INVALID_SOURCE", "Dropbox URL is not a public file share")
    return urlunsplit(("https", host, parsed.path, parsed.query, ""))


def _source_policy_arguments(source_url: str, policy: YtDlpPolicy) -> list[str]:
    host = (urlsplit(source_url).hostname or "").lower().rstrip(".")
    platform = ALLOWED_HOSTS.get(host)
    if platform == "bilibili":
        args = [
            "--sleep-requests", str(policy.sleep_requests_seconds),
            "--sleep-interval", str(policy.sleep_interval_seconds),
            "--max-sleep-interval", str(policy.max_sleep_interval_seconds),
        ]
        if policy.bilibili_proxy:
            args += ["--proxy", policy.bilibili_proxy]
        return args
    if platform == "dailymotion":
        return ["--impersonate", "firefox"]
    if platform != "youtube":
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
        "--write-thumbnail",
        "--convert-thumbnails",
        "jpg",
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
    return base + ["--format", selector, "--merge-output-format", "mp4", "--remux-video", "mp4", source_url]


def derive_audio_command(video: Path, output: Path) -> list[str]:
    return [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(video), "-map", "0:a:0", "-vn",
        "-codec:a", "libmp3lame", "-q:a", "0", "-y", str(output),
    ]


def derive_thumbnail_command(video: Path, output: Path) -> list[str]:
    return [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-ss", "0", "-i", str(video), "-frames:v", "1",
        "-vf", "scale='min(1280,iw)':-2", "-q:v", "3", "-y", str(output),
    ]


def normalize_video_command(source: Path, output: Path) -> list[str]:
    return [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(source), "-map", "0:v:0", "-map", "0:a:0?",
        "-c", "copy", "-movflags", "+faststart", "-y", str(output),
    ]


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
    if "http error 412" in normalized or "precondition failed" in normalized:
        return WorkerError(
            "SOURCE_BLOCKED",
            "The source rejected this worker network",
            retryable=False,
        )
    if returncode in {1, 2}:
        return WorkerError("SOURCE_UNAVAILABLE", "The source could not be processed", retryable=False)
    return WorkerError("PROCESSING_ERROR", "The media command failed", retryable=True)


def safe_content_disposition(job_id: str, artifact_kind: str, artifact: Path) -> str:
    extension = artifact.suffix.lower()
    expected = {"video": ".mp4", "audio": ".mp3", "thumbnail": ".jpg"}
    if expected.get(artifact_kind) != extension:
        raise WorkerError("INVALID_OUTPUT", "Unexpected output extension")
    label = "cover" if artifact_kind == "thumbnail" else artifact_kind
    return f'attachment; filename="pullvio-{job_id}-{label}{extension}"'


def content_type_for(artifact: Path) -> str:
    if artifact.suffix.lower() == ".mp4":
        return "video/mp4"
    if artifact.suffix.lower() == ".mp3":
        return "audio/mpeg"
    if artifact.suffix.lower() == ".jpg":
        return "image/jpeg"
    return mimetypes.guess_type(artifact.name)[0] or "application/octet-stream"
