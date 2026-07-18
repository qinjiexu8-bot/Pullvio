import json
import unittest
from pathlib import Path

from pullvio_worker.domain import (
    YtDlpPolicy,
    WorkerError,
    classify_yt_dlp_failure,
    download_command,
    metadata_command,
    normalize_source_url,
    parse_queue_message,
    safe_content_disposition,
)


JOB_ID = "7a3fc784-77f1-48f3-a601-718a0357bf49"


class DomainTests(unittest.TestCase):
    def setUp(self):
        self.policy = YtDlpPolicy(
            pot_provider_url="http://pot-provider:4416",
            youtube_player_client="mweb",
            sleep_requests_seconds=1.0,
            sleep_interval_seconds=8,
            max_sleep_interval_seconds=15,
        )

    def test_parses_identifier_only_queue_message(self):
        message = parse_queue_message(json.dumps({"schemaVersion": 1, "jobId": JOB_ID}))
        self.assertEqual(message.job_id, JOB_ID)

    def test_rejects_unknown_queue_schema(self):
        with self.assertRaises(WorkerError):
            parse_queue_message(json.dumps({"schemaVersion": 2, "jobId": JOB_ID}))

    def test_worker_repeats_source_allowlist(self):
        self.assertEqual(
            normalize_source_url("https://youtu.be/abc#fragment", "youtu.be"),
            "https://youtu.be/abc",
        )
        with self.assertRaises(WorkerError):
            normalize_source_url("https://youtube.com.evil.example/abc", "youtube.com.evil.example")

    def test_builds_video_command_as_an_argument_array(self):
        command = download_command(
            "https://youtu.be/abc",
            "video",
            "1080p",
            "/work/artifact.%(ext)s",
            2_147_483_648,
            self.policy,
        )
        self.assertIsInstance(command, list)
        self.assertIn("bestvideo*[height<=1080]+bestaudio/best[height<=1080]", command)
        self.assertIn("youtube:player_client=mweb", command)
        self.assertIn("youtubepot-bgutilhttp:base_url=http://pot-provider:4416", command)
        self.assertEqual(command[-1], "https://youtu.be/abc")

    def test_youtube_metadata_command_uses_provider_and_request_pacing(self):
        command = metadata_command("https://www.youtube.com/watch?v=abc", self.policy)

        self.assertIn("youtube:player_client=mweb", command)
        self.assertIn("--sleep-requests", command)
        self.assertIn("--sleep-interval", command)
        self.assertIn("--max-sleep-interval", command)

    def test_non_youtube_command_does_not_receive_youtube_provider_arguments(self):
        command = metadata_command("https://www.tiktok.com/@owner/video/123", self.policy)

        self.assertFalse(any("youtubepot" in argument for argument in command))
        self.assertFalse(any("player_client" in argument for argument in command))

    def test_classifies_source_challenges_without_retrying_them(self):
        error = classify_yt_dlp_failure(
            "ERROR: Sign in to confirm you're not a bot. Use --cookies-from-browser"
        )

        self.assertEqual(error.code, "SOURCE_BLOCKED")
        self.assertFalse(error.retryable)

    def test_classifies_rate_limits_without_immediate_retry(self):
        error = classify_yt_dlp_failure("ERROR: HTTP Error 429: Too Many Requests")

        self.assertEqual(error.code, "SOURCE_RATE_LIMITED")
        self.assertFalse(error.retryable)

    def test_content_disposition_never_uses_source_title(self):
        disposition = safe_content_disposition(JOB_ID, Path('/work/evil\".mp4'))
        self.assertEqual(disposition, f'attachment; filename="pullvio-{JOB_ID}.mp4"')

    def test_youtube_policy_validates_proxy_url(self):
        # Valid proxies should not raise ValueError
        for valid in ["http://127.0.0.1:1080", "https://proxy.example.com", "socks5://localhost:8080", "socks5h://127.0.0.1:9050"]:
            with self.subTest(proxy=valid):
                policy = YtDlpPolicy(
                    pot_provider_url="http://pot-provider:4416",
                    youtube_proxy=valid,
                )
                self.assertEqual(policy.youtube_proxy, valid)

        # Invalid proxies should raise ValueError
        for invalid in ["ftp://127.0.0.1:1080", "http://", "socks5://", "not-a-url"]:
            with self.subTest(proxy=invalid):
                with self.assertRaises(ValueError):
                    YtDlpPolicy(
                        pot_provider_url="http://pot-provider:4416",
                        youtube_proxy=invalid,
                    )

    def test_commands_receive_proxy_argument_when_configured(self):
        proxy_policy = YtDlpPolicy(
            pot_provider_url="http://pot-provider:4416",
            youtube_proxy="socks5://localhost:1080",
        )
        # Check metadata command
        meta_cmd = metadata_command("https://www.youtube.com/watch?v=abc", proxy_policy)
        self.assertIn("--proxy", meta_cmd)
        self.assertIn("socks5://localhost:1080", meta_cmd)

        # Check download command
        dl_cmd = download_command(
            "https://youtu.be/abc",
            "video",
            "1080p",
            "/work/artifact.%(ext)s",
            2_147_483_648,
            proxy_policy,
        )
        self.assertIn("--proxy", dl_cmd)
        self.assertIn("socks5://localhost:1080", dl_cmd)

    def test_tiktok_command_does_not_receive_proxy_argument(self):
        proxy_policy = YtDlpPolicy(
            pot_provider_url="http://pot-provider:4416",
            youtube_proxy="socks5://localhost:1080",
        )
        meta_cmd = metadata_command("https://www.tiktok.com/@owner/video/123", proxy_policy)
        self.assertNotIn("--proxy", meta_cmd)
        self.assertNotIn("socks5://localhost:1080", meta_cmd)


if __name__ == "__main__":
    unittest.main()
