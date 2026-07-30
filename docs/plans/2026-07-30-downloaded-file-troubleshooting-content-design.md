# Downloaded-file troubleshooting content design

Date: 2026-07-30

## Goal

Publish two problem-led long-tail articles, each with independently written
English, Simplified Chinese, and Spanish editions:

1. a downloaded video looks blurry;
2. a downloaded MP4 will not play.

Both topics come from verifiable search-result patterns and solve a file-level
problem after a download. They do not compete with Pullvio's platform
downloader pages for transactional queries.

## Keyword and intent map

| Slug | English | 简体中文 | Español | Intent |
|---|---|---|---|---|
| `downloaded-video-is-blurry` | downloaded video is blurry | 下载后的视频很模糊 | video descargado se ve borroso | Diagnose actual quality, scaling, source limits, and processing |
| `downloaded-mp4-wont-play` | downloaded MP4 won't play | 下载的 MP4 视频打不开 | video MP4 descargado no se reproduce | Diagnose incomplete files, codecs, containers, and player compatibility |

## Evidence and product boundary

- Pullvio currently exposes a quality selector only for YouTube. Other
  supported social sources return the available source video.
- Pullvio does not upscale a low-resolution source or promise that a selected
  ceiling exists upstream.
- Completed Pullvio jobs use temporary provider links. A link that expires
  before saving is different from a fully downloaded local file that fails to
  play.
- YouTube Help documents standard pixel dimensions and delayed high-resolution
  processing.
- MDN Web Docs documents the difference between containers and codecs, the
  quality/size trade-off, and broadly compatible H.264/AAC in MP4.
- Apple Support documents HEVC compatibility differences and conversion to
  H.264 for broader compatibility.

No screenshot is planned. The interface cannot prove pixel dimensions, bitrate,
codec, file completeness, or player support. Reproducible comparisons,
file-property checks, and `ffprobe` commands provide stronger evidence.

## Localization approach

- English follows a short decision tree and treats “HD” as a measurable file
  property rather than a marketing label.
- Chinese starts with stopping repeated downloads and uses familiar Windows,
  macOS, mobile, and full-screen playback observations.
- Spanish separates archivo, contenedor, códec and reproductor, using natural
  troubleshooting language rather than mirroring English sentence order.

Facts, safety boundaries, and Pullvio behavior remain consistent across all
three editions.

## Publication gate

Both articles remain absent from the public blog and sitemap until all six
language editions pass Pullvio Content Quality Standard 1.0, the editorial
approval record is complete, and tests, lint, type checking, build, link
inspection, canonical/hreflang, and structured-data checks pass.
