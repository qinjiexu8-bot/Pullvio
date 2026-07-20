import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import requests

from pullvio_worker.domain import WorkerError
from pullvio_worker.visolix import (
    VisolixClient,
    download_provider_result,
    provider_format_for,
    provider_progress_percent,
)


class FakeResponse:
    def __init__(self, status_code=200, payload=None, headers=None, chunks=None):
        self.status_code = status_code
        self._payload = payload
        self.headers = headers or {}
        self._chunks = chunks or []
        self.closed = False

    def json(self):
        if isinstance(self._payload, Exception):
            raise self._payload
        return self._payload

    def iter_content(self, chunk_size):
        del chunk_size
        yield from self._chunks

    def close(self):
        self.closed = True


class FakeSession:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []
        self.trust_env = True

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


PUBLIC_DNS = [(2, 1, 6, "", ("93.184.216.34", 443))]
PRIVATE_DNS = [(2, 1, 6, "", ("127.0.0.1", 443))]


class VisolixTests(unittest.TestCase):
    def test_maps_provider_progress_into_the_fetching_segment(self):
        self.assertEqual(provider_progress_percent(0), 5)
        self.assertEqual(provider_progress_percent(500), 37)
        self.assertEqual(provider_progress_percent(1000), 70)
        with self.assertRaises(WorkerError):
            provider_progress_percent(1001)

    def test_maps_best_to_default_1080(self):
        self.assertEqual(provider_format_for("youtube", "best"), "1080")
        self.assertEqual(provider_format_for("youtube", "2160p"), "2160")
        self.assertEqual(provider_format_for("instagram", "best"), "source")

    def test_submits_youtube_without_exposing_key_in_url(self):
        session = FakeSession([FakeResponse(payload={
            "success": 1,
            "id": "provider-123",
            "info": {"title": "Example", "secret": "discard"},
        })])
        result = VisolixClient("test-key", session=session).submit(
            "https://www.youtube.com/watch?v=abc",
            "youtube",
            "1080",
        )
        self.assertEqual(result.provider_job_id, "provider-123")
        url, options = session.calls[0]
        self.assertNotIn("test-key", url)
        self.assertEqual(options["headers"]["X-API-KEY"], "test-key")
        self.assertEqual(options["headers"]["X-PLATFORM"], "youtube")
        self.assertEqual(options["headers"]["X-FORMAT"], "1080")
        self.assertEqual(result.info, {"title": "Example"})

    def test_submits_social_platform_without_youtube_format_header(self):
        session = FakeSession([FakeResponse(payload={"success": 1, "id": "provider-social", "info": {}})])
        VisolixClient("test-key", session=session).submit(
            "https://www.instagram.com/reel/ABC123/",
            "instagram",
        )
        _, options = session.calls[0]
        self.assertEqual(options["headers"]["X-PLATFORM"], "instagram")
        self.assertNotIn("X-FORMAT", options["headers"])

    def test_maps_402_to_balance_exhausted(self):
        client = VisolixClient("test-key", session=FakeSession([FakeResponse(status_code=402)]))
        with self.assertRaises(WorkerError) as caught:
            client.submit("https://youtu.be/abc", "youtube", "1080")
        self.assertEqual(caught.exception.code, "PROVIDER_BALANCE_EXHAUSTED")
        self.assertFalse(caught.exception.retryable)

    def test_submission_network_error_is_not_automatically_resubmitted(self):
        session = FakeSession([requests.Timeout("unknown provider outcome")])
        with self.assertRaises(WorkerError) as caught:
            VisolixClient("test-key", session=session).submit("https://youtu.be/abc", "youtube", "1080")
        self.assertEqual(caught.exception.code, "PROVIDER_SUBMISSION_AMBIGUOUS")
        self.assertFalse(caught.exception.retryable)

    def test_invalid_submission_response_keeps_bounded_safe_diagnostics(self):
        session = FakeSession([FakeResponse(
            payload={
                "success": 1,
                "id": None,
                "message": "Could not process https://ok.ru/video/123 with test-key",
                "download_url": "https://private.example/result.mp4",
            },
            headers={"Content-Type": "application/json; charset=utf-8"},
        )])

        with self.assertRaises(WorkerError) as caught:
            VisolixClient("test-key", session=session).submit(
                "https://ok.ru/video/123",
                "okru",
            )

        error = caught.exception
        self.assertEqual(error.code, "PROVIDER_RESPONSE_INVALID")
        self.assertFalse(error.retryable)
        self.assertFalse(error.provider_outcome_known)
        self.assertEqual(error.provider_http_status, 200)
        serialized = json.dumps(error.safe_diagnostic)
        self.assertIn("application/json", serialized)
        self.assertIn("[redacted-url]", serialized)
        self.assertNotIn("test-key", serialized)
        self.assertNotIn("private.example", serialized)

    def test_explicit_provider_rejection_is_known_and_terminal(self):
        session = FakeSession([FakeResponse(
            payload={"success": 0, "message": "Unsupported public video"},
            headers={"Content-Type": "application/json"},
        )])

        with self.assertRaises(WorkerError) as caught:
            VisolixClient("test-key", session=session).submit(
                "https://ok.ru/video/123",
                "okru",
            )

        self.assertEqual(caught.exception.code, "PROVIDER_REJECTED")
        self.assertTrue(caught.exception.provider_outcome_known)
        self.assertFalse(caught.exception.retryable)

    @patch("pullvio_worker.visolix.socket.getaddrinfo", return_value=PUBLIC_DNS)
    def test_polls_completed_result(self, _resolver):
        session = FakeSession([FakeResponse(payload={
            "success": 1,
            "progress": 1000,
            "download_url": "https://cdn.example.com/result.mp4",
        })])
        result = VisolixClient("test-key", session=session).progress("provider-123")
        self.assertTrue(result.completed)
        self.assertEqual(result.progress, 1000)

    def test_empty_download_url_means_processing(self):
        session = FakeSession([FakeResponse(payload={
            "success": 1,
            "progress": 0,
            "download_url": "",
        })])
        result = VisolixClient("test-key", session=session).progress("provider-123")
        self.assertFalse(result.completed)
        self.assertIsNone(result.download_url)

    @patch("pullvio_worker.visolix.socket.getaddrinfo", return_value=PRIVATE_DNS)
    def test_rejects_private_provider_result(self, _resolver):
        session = FakeSession([FakeResponse(payload={
            "success": 1,
            "progress": 1000,
            "download_url": "https://localhost/result.mp4",
        })])
        with self.assertRaises(WorkerError) as caught:
            VisolixClient("test-key", session=session).progress("provider-123")
        self.assertEqual(caught.exception.code, "PROVIDER_RESULT_UNSAFE")

    @patch("pullvio_worker.visolix.socket.getaddrinfo", return_value=PUBLIC_DNS)
    def test_downloads_result_with_size_limit(self, _resolver):
        session = FakeSession([FakeResponse(
            headers={"Content-Length": "6"},
            chunks=[b"abc", b"def"],
        )])
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "video.mp4"
            size = download_provider_result(
                "https://cdn.example.com/result.mp4",
                destination,
                10,
                session=session,
            )
            self.assertEqual(size, 6)
            self.assertEqual(destination.read_bytes(), b"abcdef")

    @patch("pullvio_worker.visolix.socket.getaddrinfo", return_value=PUBLIC_DNS)
    def test_removes_partial_file_when_size_limit_is_exceeded(self, _resolver):
        session = FakeSession([FakeResponse(chunks=[b"1234", b"5678"])])
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "video.mp4"
            with self.assertRaises(WorkerError) as caught:
                download_provider_result(
                    "https://cdn.example.com/result.mp4",
                    destination,
                    5,
                    session=session,
                )
            self.assertEqual(caught.exception.code, "OUTPUT_SIZE_LIMIT")
            self.assertFalse(destination.exists())


if __name__ == "__main__":
    unittest.main()
