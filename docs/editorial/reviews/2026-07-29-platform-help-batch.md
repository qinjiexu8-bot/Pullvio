# 2026-07-29 平台问题词文章批次质检记录

执行规范：[Pullvio 内容生产与发布质检规范 1.0](../content-quality-standard.md)

## 批次范围

| Slug | 单一问题 | 主要长尾词 | 对应工具页 | 结论 |
|---|---|---|---|---|
| `youtube-video-download-not-working` | YouTube 任务为什么失败 | youtube video download not working | `/youtube-video-downloader` | 通过 |
| `youtube-shorts-link-and-quality` | Shorts 应复制哪个链接 | which YouTube Shorts link to copy | `/youtube-video-downloader` | 通过 |
| `instagram-reel-link-not-working` | Reel 链接为什么无效 | Instagram Reel link not working | `/instagram-video-downloader` | 通过 |
| `facebook-private-video-download` | 私人视频为什么不能下载 | private Facebook video download | `/facebook-video-downloader` | 通过 |
| `copy-snapchat-spotlight-link` | 如何取得 Spotlight 直链 | copy Snapchat Spotlight link | `/snapchat-video-downloader` | 通过 |
| `okru-video-download-failed` | OK.ru 任务为什么失败 | OK.ru video download failed | `/okru-video-downloader` | 通过 |

## 一手证据检查

- 2026-07-29 从 Pullvio 当前生产页面采集 YouTube、Instagram、Facebook、Snapchat 与 OK.ru 工具首屏。
- 截图显示当前平台文案、公开链接输入框、支持格式和真实界面边界。
- 截图未包含账号、邮箱、任务 ID、访问令牌、用户链接或下载记录。
- 五张 WebP 均为 1265 × 712，单张约 37–40 KB，界面文字可辨认。
- YouTube 的两篇文章共用同一张产品截图，但图注分别解释“失败排查”和“Shorts 链接”两个不同问题。

## 内容与事实检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| 一篇只解决一个问题 | 通过 | 标题均为具体问句，没有泛化为平台终极指南 |
| 首段直接回答 | 通过 | 每篇在首段给出判断或操作 |
| 无虚构体验 | 通过 | 未写虚构下载成功率、用户案例或个人经历 |
| Pullvio 一手判断 | 通过 | 说明公开链接、登录态、格式、画质和上游阶段的真实边界 |
| 不支持边界 | 通过 | 明确排除私人内容、登录墙、过期来源和访问控制 |
| 无模板化扩写 | 通过 | 六篇采用不同的问题路径；无通用时代背景或营销开场 |
| 外部事实来源 | 通过 | YouTube 隐私设置引用 Google 官方帮助；Facebook 结论与 Meta 公开受众规则一致 |

## SEO 与关键词冲突检查

- 平台工具页继续承接 `[platform] video downloader` 交易词。
- 文章承接 `not working`、`private`、`copy link`、`failed` 等问题词。
- 未新增 `youtube-shorts-downloader` 等近似交易落地页，避免 doorway page 与关键词互抢。
- 每篇包含 1–4 个上下文内链，并指向对应工具页。
- 所有标题、description 与正文问题一致；没有无依据的“最快”“100%”“绝对无水印”。
- 文章图片均具有描述性 alt 和解释性图注。

## 三语检查

- 英文、简体中文与西班牙文均为独立自然表达，而非逐句机械直译。
- 三种语言的支持范围、隐私边界和操作结论一致。
- 菜单名称和设备表达符合各语言常见写法。
- 自动质检曾发现 Instagram 中文、Facebook 中文、Snapchat 英文与 OK.ru 中文信息量不足，已补充具体排错判断后重新通过。

## 自动门禁

`lib/blog-editorial.ts` 要求文章同时满足：

- `status: approved`
- 当前规范版本 `1.0`
- 审核日期
- 审核人
- 完整审核结论

缺少任意一项的文章不会进入公开 `blogPosts`，因此不会出现在 Blog、首页、结构化数据或 sitemap。

对应测试：

- `lib/blog-editorial.test.ts`
- `lib/blog-posts-platform-help.test.ts`
- `lib/sitemap.test.ts`

## 发布前技术验证

- `npm test`：15 个测试文件、98 项测试全部通过。
- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `npm run build`：通过，80 个静态页面生成完成。
- 本地生产构建链接巡检：118 个站内 URL、3 次正常重定向，无 404、断链或失效锚点。
- 新增 6 篇文章的英文、简体中文和西班牙文页面均返回 HTTP 200。
- sitemap 由 84 个 URL 增至 102 个 URL；新增的 18 个文章本地化 URL 全部存在且唯一。
- 已在真实浏览器中检查英文与中文文章首屏，导航、标题、摘要、作者审核信息和正文均正常显示。

## 最终结论

六篇文章通过内容、事实、一手证据、截图、长尾意图、内链、本地化、安全、反模板化与技术发布质检，可以发布。
