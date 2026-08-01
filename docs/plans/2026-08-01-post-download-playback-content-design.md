# Post-download playback diagnostics content design

Date: 2026-08-01

## Goal

Publish two problem-led long-tail articles, each with independently written
English, Simplified Chinese, and Spanish editions:

1. subtitles visible online are missing from a downloaded video;
2. a downloaded video plays but ends before the source does.

The articles address file behavior after a completed task. They do not compete
with Pullvio's platform downloader pages for transactional queries and do not
repeat the existing unplayable-file, blurry-video, or silent-video guides.

## Keyword and intent map

| Slug | English | 简体中文 | Español | Intent |
|---|---|---|---|---|
| `subtitles-missing-from-downloaded-video` | subtitles missing from downloaded video | 下载的视频没有字幕 | video descargado sin subtítulos | Distinguish burned-in captions, embedded tracks, and separate timed-text files |
| `downloaded-video-ends-early` | downloaded video ends early | 下载的视频提前结束 | video descargado termina antes de tiempo | Distinguish a short source, incomplete browser transfer, expired result, and damaged duration metadata |

## Evidence and product boundary

- Pullvio's current public result offers video, YouTube audio, and provider
  cover data when available. It does not currently return caption files.
- Captions shown by a web player may be a separate timed-text resource rather
  than pixels or a subtitle stream inside the media file.
- A Pullvio task reaching Ready and a browser finishing the resulting file
  transfer are separate events because provider result links are temporary.
- MDN documents WebVTT as timed text associated with media through a separate
  track.
- YouTube Help documents caption file formats and the creator workflow for
  downloading a video's caption track.
- MDN documents HTTP range requests and `Content-Length`; FFmpeg documents
  `ffprobe` for inspecting duration, size, and streams.
- YouTube Help documents that live streams longer than 12 hours may not be
  archived, which is a source-boundary example rather than a downloader defect.

No screenshot is planned. Pullvio's input and Ready states cannot prove whether
a source has a caption resource or whether the final bytes reached the user's
device. File inspection, player menus, browser download status, and official
format documentation are stronger evidence.

## Localization approach

- English starts with the media-layer distinction and a short evidence tree.
- Chinese starts with checking whether CC text is part of the picture, then
  uses familiar player and Downloads-folder steps.
- Spanish distinguishes `subtítulos incrustados`, `pista interna`, and
  `archivo externo`, and uses a separate transfer/source diagnosis for early
  endings.

Facts, safety boundaries, and Pullvio behavior remain consistent across all
three editions without sentence-by-sentence translation.

## Publication gate

Both articles remain absent from the public blog and sitemap until all six
language editions pass Pullvio Content Quality Standard 1.0, the editorial
approval record is complete, and tests, lint, type checking, production build,
link inspection, canonical/hreflang, structured data, desktop, and mobile
checks pass.
