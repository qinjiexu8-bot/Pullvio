import json
import unittest
from pathlib import Path

from pullvio_worker.domain import (
    YtDlpPolicy,
    WorkerError,
    classify_yt_dlp_failure,
    derive_audio_command,
    derive_thumbnail_command,
    download_command,
    metadata_command,
    normalize_video_command,
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

    def test_parses_v2_process_queue_message(self):
        message = parse_queue_message(json.dumps({
            "schemaVersion": 2,
            "action": "process",
            "jobId": JOB_ID,
        }))
        self.assertEqual(message.job_id, JOB_ID)
        self.assertEqual(message.schema_version, 2)
        self.assertEqual(message.action, "process")

    def test_rejects_unknown_queue_schema(self):
        with self.assertRaises(WorkerError):
            parse_queue_message(json.dumps({"schemaVersion": 3, "jobId": JOB_ID}))

    def test_rejects_unknown_v2_queue_action(self):
        with self.assertRaises(WorkerError):
            parse_queue_message(json.dumps({
                "schemaVersion": 2,
                "action": "delete",
                "jobId": JOB_ID,
            }))

    def test_worker_repeats_source_allowlist(self):
        self.assertEqual(
            normalize_source_url("https://youtu.be/abc#fragment", "youtu.be"),
            "https://youtu.be/abc",
        )
        with self.assertRaises(WorkerError):
            normalize_source_url("https://youtube.com.evil.example/abc", "youtube.com.evil.example")
        with self.assertRaises(WorkerError):
            normalize_source_url(
                "https://www.tiktok.com/@owner/video/123",
                "www.tiktok.com",
                "vimeo",
            )

        self.assertEqual(
            normalize_source_url("https://vimeo.com/777912896", "vimeo.com"),
            "https://vimeo.com/777912896",
        )
        self.assertEqual(
            normalize_source_url(
                "https://soundcloud.com/scottbuckley/simplicity-cc-by",
                "soundcloud.com",
            ),
            "https://soundcloud.com/scottbuckley/simplicity-cc-by",
        )
        self.assertEqual(
            normalize_source_url(
                "https://www.bilibili.com/video/BV1Fb4111732/?spm_id_from=333.337",
                "www.bilibili.com",
            ),
            "https://www.bilibili.com/video/BV1Fb4111732/?spm_id_from=333.337",
        )
        verified_sources = [
            ("https://www.instagram.com/reel/ABC_123/", "www.instagram.com"),
            ("https://www.facebook.com/reel/123456789", "www.facebook.com"),
            ("https://www.pinterest.com/pin/664281013778109217/", "www.pinterest.com"),
            ("https://clips.twitch.tv/FaintLightGullWholeWheat", "clips.twitch.tv"),
            ("https://www.dailymotion.com/video/x5kesuj", "www.dailymotion.com"),
            ("https://streamable.com/dnd1", "streamable.com"),
            ("https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYYWtidGhudGZpAX1TKn0JAX1TKnXJAAAAAA", "www.snapchat.com"),
            ("https://ok.ru/video/5754458544", "ok.ru"),
            ("https://imgur.com/A61SaA1", "imgur.com"),
            ("https://www.loom.com/share/43d05f362f734614a2e81b4694a3a523", "www.loom.com"),
            ("https://www.dropbox.com/scl/fi/r2kd2skcy5ylbbta5y1pz/DJI_0003.MP4?dl=0", "www.dropbox.com"),
        ]
        for source_url, expected_host in verified_sources:
            with self.subTest(source_url=source_url):
                self.assertEqual(normalize_source_url(source_url, expected_host), source_url)
        with self.assertRaises(WorkerError):
            normalize_source_url("https://vimeo.com/channels/creativecommons", "vimeo.com")
        with self.assertRaises(WorkerError):
            normalize_source_url("https://soundcloud.com/artist/sets/playlist", "soundcloud.com")
        with self.assertRaises(WorkerError):
            normalize_source_url("https://www.bilibili.com/bangumi/play/ep123", "www.bilibili.com")
        rejected_sources = [
            ("https://www.instagram.com/creator/", "www.instagram.com"),
            ("https://www.facebook.com/creator/", "www.facebook.com"),
            ("https://www.pinterest.com/user/board/", "www.pinterest.com"),
            ("https://www.twitch.tv/videos/6528877", "www.twitch.tv"),
            ("https://www.dailymotion.com/playlist/x123", "www.dailymotion.com"),
            ("https://streamable.com/e/dnd1", "streamable.com"),
            ("https://www.snapchat.com/add/example", "www.snapchat.com"),
            ("https://ok.ru/creator/video", "ok.ru"),
            ("https://imgur.com/a/A61SaA1", "imgur.com"),
            ("https://www.loom.com/edit/43d05f362f734614a2e81b4694a3a523", "www.loom.com"),
            ("https://www.dropbox.com/sh/folder/share", "www.dropbox.com"),
        ]
        for source_url, expected_host in rejected_sources:
            with self.subTest(source_url=source_url):
                with self.assertRaises(WorkerError):
                    normalize_source_url(source_url, expected_host)

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
        self.assertIn("--write-thumbnail", command)
        self.assertIn("--convert-thumbnails", command)
        self.assertEqual(command[-1], "https://youtu.be/abc")

    def test_soundcloud_is_audio_only(self):
        source_url = "https://soundcloud.com/scottbuckley/simplicity-cc-by"
        command = download_command(
            source_url,
            "audio",
            "best",
            "/work/artifact.%(ext)s",
            2_147_483_648,
            self.policy,
        )
        self.assertIn("--extract-audio", command)
        with self.assertRaises(WorkerError):
            download_command(
                source_url,
                "video",
                "best",
                "/work/artifact.%(ext)s",
                2_147_483_648,
                self.policy,
            )

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
        disposition = safe_content_disposition(JOB_ID, "video", Path('/work/evil\".mp4'))
        self.assertEqual(disposition, f'attachment; filename="pullvio-{JOB_ID}-video.mp4"')

    def test_builds_audio_derivative_command_without_a_shell(self):
        command = derive_audio_command(Path("/work/video.mp4"), Path("/work/audio.mp3"))
        self.assertEqual(command[0], "ffmpeg")
        self.assertIn("0:a:0", command)
        self.assertEqual(command[-1], "/work/audio.mp3")

    def test_builds_thumbnail_derivative_command_without_a_shell(self):
        command = derive_thumbnail_command(Path("/work/video.mp4"), Path("/work/cover.jpg"))
        self.assertEqual(command[0], "ffmpeg")
        self.assertIn("-frames:v", command)
        self.assertEqual(command[-1], "/work/cover.jpg")

    def test_builds_video_normalization_command_without_a_shell(self):
        command = normalize_video_command(Path("/work/provider-result"), Path("/work/video.mp4"))
        self.assertEqual(command[0], "ffmpeg")
        self.assertIn("+faststart", command)
        self.assertEqual(command[-1], "/work/video.mp4")

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

    def test_dailymotion_commands_use_browser_impersonation(self):
        command = metadata_command(
            "https://www.dailymotion.com/video/x89eyek",
            self.policy,
        )
        self.assertIn("--impersonate", command)
        self.assertIn("firefox", command)

    def test_bilibili_commands_only_receive_the_bilibili_proxy(self):
        proxy_policy = YtDlpPolicy(
            pot_provider_url="http://pot-provider:4416",
            youtube_proxy="socks5://youtube-proxy.example:1080",
            bilibili_proxy="socks5h://bilibili-proxy.example:1080",
        )
        command = metadata_command(
            "https://www.bilibili.com/video/BV1Fb4111732/",
            proxy_policy,
        )
        self.assertIn("--proxy", command)
        self.assertIn("socks5h://bilibili-proxy.example:1080", command)
        self.assertNotIn("socks5://youtube-proxy.example:1080", command)
        self.assertIn("--sleep-requests", command)

    def test_bilibili_proxy_rejects_paths_and_queries(self):
        for invalid in [
            "https://proxy.example.com/path",
            "socks5://proxy.example.com:1080?token=secret",
        ]:
            with self.subTest(proxy=invalid):
                with self.assertRaises(ValueError):
                    YtDlpPolicy(
                        pot_provider_url="http://pot-provider:4416",
                        bilibili_proxy=invalid,
                    )

    def test_classifies_bilibili_412_as_a_network_block(self):
        error = classify_yt_dlp_failure("ERROR: HTTP Error 412: Precondition Failed")
        self.assertEqual(error.code, "SOURCE_BLOCKED")
        self.assertFalse(error.retryable)


if __name__ == "__main__":
    unittest.main()
