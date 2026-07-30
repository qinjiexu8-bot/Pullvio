# 2026-07-30 “下载的视频没有声音”文章质检记录

执行规范：[Pullvio 内容生产与发布质检规范 1.0](../content-quality-standard.md)

内容设计：[“下载的视频没有声音”三语文章设计](../../plans/2026-07-30-downloaded-video-no-sound-content-design.md)

## 选题与关键词

| 语言 | 标题 | 主要长尾词 | 信息量 |
|---|---|---|---|
| English | Why does my downloaded video have no sound? | downloaded video has no sound | 约 974 词 |
| 简体中文 | 下载的视频没有声音，应该怎么排查？ | 下载的视频没有声音 | 约 2,014 个可见字符 |
| Español | ¿Por qué mi video descargado no tiene sonido? | video descargado sin sonido | 约 824 词 |

三种语言均解决“下载完成后文件无声”这一问题，不扩展为平台下载器或格式百科。

## 非机械翻译检查

- 英文从 file / playback path 的二分诊断切入，围绕可重复验证步骤组织。
- 中文从“先不要重新下载”切入，以设备、播放器、音轨、Pullvio 对照测试和停止条件为主。
- 西班牙文用 archivo / pista / códec / salida 划分问题，采用当地常见的 `video sin sonido` 表达。
- 三种语言事实、支持边界和最终建议一致，但开头、段落顺序、过渡句和局部解释并非逐句对应。

## 事实与一手判断

- 核对 Pullvio 当前产品代码：YouTube 提供 Video 与 Audio 模式；其他当前平台使用可用来源视频。
- 明确一次有信息量的 Audio 对照测试，反对连续重复请求。
- 使用 MDN Web Docs 说明 MP4 是容器而非音轨保证。
- 使用 FFmpeg 官方 `ffprobe` 文档说明 `-select_streams a` 的音频流检查方法。
- 使用 YouTube Help 支撑 H.264 / AAC-LC 的常见兼容组合与跨设备音频差异。
- 未声称转码能够恢复不存在的音轨、静音来源或被压缩删除的信息。

## 图片取舍

本篇不使用图片。现有 Pullvio 工具截图只能展示输入框和模式按钮，不能说明文件内部是否存在音轨。文章改用可重复的双播放器测试、Pullvio Audio 对照和 `ffprobe` 命令，信息价值高于装饰性截图。

这符合 2026-07-30 明确后的规则：一手证据必需，图片按需使用。

## SEO 与页面边界

- 主关键词自然出现在 title、H1、首段和正文问题中。
- 每种语言包含 6 个实质 H2、3 个上下文内链和 3 个官方外链。
- 与 `why-4k-video-needs-separate-audio` 的架构解释形成上下游关系，不重复其搜索意图。
- 与平台工具页的交易词分离，不创建多个平台名替换页。
- 不加入已经被正文回答的模板化 FAQ。

## 安全与授权

- 明确私人账号、会员内容、付费来源、DRM 和地区限制不是编解码器问题。
- 不鼓励导入 Cookie、会话或绕过访问控制。
- 建议自己的作品使用母版或官方导出，他人内容向权利人获取授权。
- 未包含用户链接、任务 ID、密钥、邮箱或下载记录。

## 自动门禁

- 文章状态：`approved`
- 审核日期：2026-07-30
- 审核人：Pullvio Editorial
- 规范版本：1.0
- 定向测试：`lib/blog-posts-platform-help.test.ts`、`lib/blog-editorial.test.ts`、`lib/sitemap.test.ts` 共 9 项通过。
- 全量验证：15 个测试文件、98 项测试全部通过；TypeScript、ESLint 与生产构建通过。
- 本地生产链接巡检：121 个站内 URL、3 次正常重定向，无 404、断链或失效锚点。
- 三个本地化 URL 均返回 HTTP 200，canonical 与 `BlogPosting` 结构化数据存在。
- sitemap 从 102 个 URL 增至 105 个 URL，三种语言的新文章 URL 均存在且唯一。
- 真实浏览器检查：英文桌面首屏与中文 390 × 844 移动端首屏布局正常，标题、摘要、作者信息和正文可读。

## 结论

英文、简体中文和西班牙文版本通过单一意图、事实、一手产品判断、自然本地化、SEO、安全、反模板化与技术发布质检，可以发布。
