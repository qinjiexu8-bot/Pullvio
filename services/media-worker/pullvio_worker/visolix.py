from __future__ import annotations

import ipaddress
import socket
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlsplit

import requests

from .domain import WorkerError


VISOLIX_API_BASE = "https://developers.visolix.com/api"
ALLOWED_VIDEO_FORMATS = {"360", "480", "720", "1080", "1440", "2160"}
VISOLIX_PLATFORMS = {"youtube", "instagram", "facebook", "snapchat", "okru"}


@dataclass(frozen=True)
class VisolixSubmission:
    provider_job_id: str
    info: dict[str, Any]


@dataclass(frozen=True)
class VisolixProgress:
    progress: int
    download_url: str | None
    info: dict[str, Any]

    @property
    def completed(self) -> bool:
        return self.download_url is not None


class VisolixClient:
    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = VISOLIX_API_BASE,
        session: requests.Session | None = None,
    ):
        if not api_key or len(api_key) > 500:
            raise RuntimeError("Visolix API secret is malformed")
        parsed = urlsplit(base_url)
        if parsed.scheme != "https" or not parsed.hostname:
            raise RuntimeError("Visolix API base URL must use HTTPS")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._session = session or requests.Session()
        self._session.trust_env = False

    def submit(
        self,
        source_url: str,
        platform: str,
        provider_format: str | None = None,
    ) -> VisolixSubmission:
        if platform not in VISOLIX_PLATFORMS:
            raise WorkerError("INVALID_OPTIONS", "Unsupported media provider platform")
        if platform == "youtube" and provider_format not in ALLOWED_VIDEO_FORMATS:
            raise WorkerError("INVALID_OPTIONS", "Unsupported YouTube video quality")
        if platform != "youtube" and provider_format is not None:
            raise WorkerError("INVALID_OPTIONS", "Only YouTube accepts a provider format")
        headers = {
            "X-API-KEY": self._api_key,
            "X-PLATFORM": platform,
            "URL": source_url,
            "User-Agent": "pullvio-media-worker/1",
        }
        if provider_format is not None:
            headers["X-FORMAT"] = provider_format
        try:
            response = self._session.get(
                f"{self._base_url}/download",
                headers=headers,
                timeout=(5, 30),
            )
        except requests.RequestException as exc:
            raise WorkerError(
                "PROVIDER_SUBMISSION_AMBIGUOUS",
                "Media provider submission outcome is unknown",
                retryable=False,
            ) from exc
        _raise_for_provider_status(response.status_code)
        payload = _json_object(response)
        provider_job_id = payload.get("id")
        if payload.get("success") not in {True, 1} or not isinstance(provider_job_id, str):
            raise WorkerError(
                "PROVIDER_RESPONSE_INVALID",
                "Media provider returned an invalid submission response",
                retryable=True,
            )
        return VisolixSubmission(
            provider_job_id=provider_job_id[:500],
            info=_safe_provider_info(payload.get("info")),
        )

    def progress(self, provider_job_id: str) -> VisolixProgress:
        if not provider_job_id or len(provider_job_id) > 500:
            raise WorkerError("PROVIDER_STATE_INVALID", "Media provider job ID is invalid")
        try:
            response = self._session.get(
                f"{self._base_url}/progress",
                params={"id": provider_job_id},
                headers={
                    "X-API-KEY": self._api_key,
                    "User-Agent": "pullvio-media-worker/1",
                },
                timeout=(5, 30),
            )
        except requests.RequestException as exc:
            raise WorkerError(
                "PROVIDER_UNAVAILABLE",
                "Media provider progress is temporarily unavailable",
                retryable=True,
            ) from exc
        _raise_for_provider_status(response.status_code)
        payload = _json_object(response)
        raw_progress = payload.get("progress", 0)
        if not isinstance(raw_progress, int) or not 0 <= raw_progress <= 1000:
            raise WorkerError(
                "PROVIDER_RESPONSE_INVALID",
                "Media provider returned invalid progress",
                retryable=True,
            )
        download_url = payload.get("download_url")
        # Visolix returns an empty string while a job is still processing. Treat
        # that as an absent result instead of validating it as a completed URL.
        if download_url == "":
            download_url = None
        if download_url is not None and not isinstance(download_url, str):
            raise WorkerError(
                "PROVIDER_RESPONSE_INVALID",
                "Media provider returned an invalid result URL",
                retryable=True,
            )
        if download_url is not None:
            _validate_public_https_url(download_url)
        return VisolixProgress(
            progress=raw_progress,
            download_url=download_url,
            info=_safe_provider_info(payload.get("info")),
        )


def provider_format_for(platform: str, requested_quality: str) -> str:
    if platform != "youtube":
        if platform not in VISOLIX_PLATFORMS:
            raise WorkerError("INVALID_OPTIONS", "Unsupported media provider platform")
        return "source"
    normalized = requested_quality.removesuffix("p")
    if normalized == "best":
        return "1080"
    if normalized not in ALLOWED_VIDEO_FORMATS:
        raise WorkerError("INVALID_OPTIONS", "Unsupported YouTube video quality")
    return normalized


def provider_progress_percent(progress: int) -> int:
    if progress not in range(0, 1001):
        raise WorkerError("PROVIDER_RESPONSE_INVALID", "Media provider returned invalid progress", retryable=True)
    return min(70, 5 + round(progress * 65 / 1000))


def download_provider_result(
    url: str,
    destination: Path,
    max_output_bytes: int,
    *,
    session: requests.Session | None = None,
    max_redirects: int = 3,
) -> int:
    if max_output_bytes <= 0:
        raise ValueError("Maximum output size must be positive")
    client = session or requests.Session()
    client.trust_env = False
    current_url = url

    for redirect_count in range(max_redirects + 1):
        _validate_public_https_url(current_url)
        response = client.get(
            current_url,
            stream=True,
            allow_redirects=False,
            timeout=(10, 120),
            headers={"User-Agent": "pullvio-media-worker/1"},
        )
        if response.status_code in {301, 302, 303, 307, 308}:
            location = response.headers.get("Location")
            response.close()
            if not location or redirect_count >= max_redirects:
                raise WorkerError(
                    "PROVIDER_DOWNLOAD_FAILED",
                    "Media provider result redirected unexpectedly",
                    retryable=True,
                )
            current_url = urljoin(current_url, location)
            continue
        if response.status_code >= 400:
            status = response.status_code
            response.close()
            raise WorkerError(
                "PROVIDER_DOWNLOAD_FAILED",
                f"Media provider result returned HTTP {status}",
                retryable=status in {408, 425, 429} or status >= 500,
            )

        content_length = response.headers.get("Content-Length")
        if content_length and content_length.isdigit() and int(content_length) > max_output_bytes:
            response.close()
            raise WorkerError("OUTPUT_SIZE_LIMIT", "Output exceeds the supported size")

        total = 0
        try:
            with destination.open("wb") as output:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if not chunk:
                        continue
                    total += len(chunk)
                    if total > max_output_bytes:
                        raise WorkerError("OUTPUT_SIZE_LIMIT", "Output exceeds the supported size")
                    output.write(chunk)
        except Exception:
            destination.unlink(missing_ok=True)
            raise
        finally:
            response.close()
        if total <= 0:
            destination.unlink(missing_ok=True)
            raise WorkerError(
                "PROVIDER_DOWNLOAD_FAILED",
                "Media provider returned an empty file",
                retryable=True,
            )
        return total

    raise WorkerError(
        "PROVIDER_DOWNLOAD_FAILED",
        "Media provider result could not be downloaded",
        retryable=True,
    )


def _raise_for_provider_status(status_code: int):
    if status_code < 400:
        return
    if status_code == 402:
        raise WorkerError(
            "PROVIDER_BALANCE_EXHAUSTED",
            "Media downloads are temporarily unavailable",
            retryable=False,
        )
    if status_code in {401, 403}:
        raise WorkerError(
            "PROVIDER_AUTH_ERROR",
            "Media provider authentication failed",
            retryable=False,
        )
    raise WorkerError(
        "PROVIDER_UNAVAILABLE",
        f"Media provider returned HTTP {status_code}",
        retryable=status_code in {408, 425, 429} or status_code >= 500,
    )


def _json_object(response: requests.Response) -> dict[str, Any]:
    try:
        value = response.json()
    except (ValueError, requests.JSONDecodeError) as exc:
        raise WorkerError(
            "PROVIDER_RESPONSE_INVALID",
            "Media provider returned invalid JSON",
            retryable=True,
        ) from exc
    if not isinstance(value, dict):
        raise WorkerError(
            "PROVIDER_RESPONSE_INVALID",
            "Media provider returned invalid JSON",
            retryable=True,
        )
    return value


def _safe_provider_info(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        return {}
    safe: dict[str, Any] = {}
    for key in ("title", "duration", "thumbnail"):
        item = value.get(key)
        if isinstance(item, (str, int, float, bool)) and len(str(item)) <= 2048:
            safe[key] = item
    return safe


def _validate_public_https_url(value: str):
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as exc:
        raise WorkerError("PROVIDER_RESULT_UNSAFE", "Provider result URL is invalid") from exc
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or port not in {None, 443}
        or len(value) > 4096
    ):
        raise WorkerError("PROVIDER_RESULT_UNSAFE", "Provider result URL is not allowed")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise WorkerError(
            "PROVIDER_RESULT_UNAVAILABLE",
            "Provider result host could not be resolved",
            retryable=True,
        ) from exc
    if not addresses:
        raise WorkerError("PROVIDER_RESULT_UNSAFE", "Provider result host has no address")
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise WorkerError("PROVIDER_RESULT_UNSAFE", "Provider result resolved to a private address")
