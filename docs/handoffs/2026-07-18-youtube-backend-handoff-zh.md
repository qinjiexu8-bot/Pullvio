# Pullvio 后端与 YouTube 阻塞问题交接文档

**整理日期：** 2026-07-18  
**项目仓库：** `qinjiexu8-bot/Pullvio`  
**当前状态：** 后端主链路已经完成并部署，媒体任务总开关已于 2026-07-18 显式开启
**核心问题：** YouTube 在解析阶段拒绝 AWS 数据中心出口，并非 FFmpeg、S3 或前端故障

> 重要：本文不包含任何私钥、Token、数据库密码或代理凭据。需要的访问权限必须通过安全渠道单独交接。

## 一、先看结论

Pullvio 的下载后端已经具备完整的异步任务处理能力：

- Vercel 上的提交、查询、取消和签名下载 API；
- Clerk 登录身份和 Supabase 任务数据；
- 匿名用户 24 小时滚动五次、登录用户正常交互使用的额度控制；
- AWS SQS 队列与死信队列；
- EC2 上的 yt-dlp、FFmpeg Worker；
- 私有 S3 存储；
- CloudFront 短时签名 URL 下载；
- 前端排队、处理中、完成、失败、取消和重试状态；
- 超时、重试、租约、心跳、清理、日志与告警。

当前不是“后端没做完”，而是“Source Egress / 来源站出口”没有通过上线门槛：

- TikTok：当前 EC2 网络能够解析公开视频，底层基本可用；
- YouTube：当前 AWS 出口会立即出现 `LOGIN_REQUIRED` / `Sign in to confirm you are not a bot`；
- 生产数据库总开关 `media_runtime_config.accepting_jobs` 已开启；
- YouTube 独立开关 `media_platform_config.youtube.accepting_jobs` 已关闭，请求会在创建任务和发送 SQS 消息前被拒绝；
- Vimeo 授权测试视频已完成 API、SQS、Worker、FFmpeg、S3、CloudFront 全链路；
- TikTok、Vimeo 和 SoundCloud 保持开放，YouTube 不能宣称已可用。

建议：

1. 只做一次隔离的 `WPC + Chromium` 测试；
2. 如果仍然是相同机器人验证，停止继续调整 AWS IP 和 yt-dlp 客户端；
3. 将 YouTube Worker 拆到一个 YouTube 可接受的 ISP/商业宽带出口节点；
4. AWS 继续承担 API、SQS、S3、CloudFront 和非 YouTube 平台处理。

## 二、当前系统结构

```text
用户浏览器
    │
    │ JSON，不传输媒体文件
    ▼
Vercel / Next.js API ───── Clerk + Supabase
    │
    │ SQS 消息只包含任务 ID
    ▼
Amazon SQS + DLQ
    │
    ▼
EC2 Media Worker
    ├── yt-dlp
    ├── FFmpeg
    └── BgUtils PO Token Provider
    │
    ▼
私有 S3 Bucket
    │
    ▼
CloudFront OAC + 签名 URL
    │
    ▼
用户浏览器下载
```

公网控制接口：

- `POST https://pullvio.com/api/media/jobs`
- `GET https://pullvio.com/api/media/jobs/{jobId}`
- `DELETE https://pullvio.com/api/media/jobs/{jobId}`

成品文件域名：

- `https://media.pullvio.com`

EC2 不对公网提供业务 HTTP API，也不需要 `api.pullvio.com`。媒体文件不会经过 Vercel。

## 三、主要 AWS 资源

| 项目 | 当前值 |
| --- | --- |
| Region | `us-east-1` |
| EC2 Instance ID | `i-0e0fe842a01633b73` |
| EC2 规格 | `c7g.large` / ARM64 |
| 当前 Elastic IP | `3.212.192.122` |
| Security Group | `sg-0f1cc5ccd45ab4c14` / `pullvio-worker-sg` |
| SQS | `pullvio-media-jobs` |
| SQS DLQ | `pullvio-media-jobs-dlq` |
| S3 Bucket | `pullvio` |
| CloudFront Distribution | `E3TZ7LPQNNJJDM` |
| 下载域名 | `media.pullvio.com` |
| CloudWatch Log Group | `/pullvio/worker` |
| SNS Topic | `pullvio-infrastructure-alerts` |
| EC2 部署目录 | `/opt/pullvio/media-worker` |
| systemd 服务 | `pullvio-media-worker` |

CloudFront 当前使用 Free 方案。S3 已开启 Block Public Access。此前已经验证：

- S3 直连：`403`；
- 未签名 CloudFront：`403`；
- 有效签名 CloudFront：`200`，字节数正确。

## 四、已经实现的关键功能

### 1. “支持平台”的三个口径

交接时必须区分以下三件事：

1. **引擎可识别：** 当前 EC2 镜像里的 yt-dlp 包含对应 Extractor；
2. **Pullvio 已接入：** API、数据库类型、Worker 二次校验和错误文案已经允许该平台；
3. **线上可用：** 已通过 EC2 和完整链路验证，而且生产总开关已经开放。

yt-dlp 包含某个平台的 Extractor，不等于 Pullvio 已经支持该平台。当前准确矩阵如下：

| 平台 | yt-dlp 引擎可识别 | Pullvio 后端已接入 | EC2 当前结果 | 当前前端可用 |
| --- | --- | --- | --- | --- |
| TikTok 国际版 | 是 | 是 | 公开示例解析成功 | 是，仍需持续监控成功率 |
| YouTube | 是 | 是 | AWS 网络被 YouTube 拒绝 | 否 |
| Bilibili / 哔哩哔哩 | 是，`BiliBili` / `BiliIntl` | 否 | 美国 AWS 出口返回 HTTP 412 | 否 |
| 抖音 / Douyin | 是，`Douyin` | 否 | 要求新鲜 Cookie，当前安全模型不接受 | 否 |
| Vimeo | 是 | 是 | CC BY 单视频全链路成功 | 是 |
| Instagram | 是，部分子 Extractor 当前损坏 | 否 | 未测试 | 否 |
| Facebook | 是 | 否 | 未测试 | 否 |
| X / Twitter | 是 | 否 | 官方样本链路返回服务端错误 | 否 |
| SoundCloud | 是 | 是，仅 Audio | CC BY 单曲解析成功 | 是，仅 Audio |
| Reddit | 是 | 否 | 要求账号 Cookie | 否 |

因此，严格按产品口径：

- **已完成后端代码接入：YouTube、TikTok、Vimeo 和 SoundCloud；**
- **当前底层实测可解析：TikTok、Vimeo 和 SoundCloud；**
- **当前线上已开放 Vimeo、TikTok 和 SoundCloud 任务；Vimeo 已通过完整下载验证；**
- **Bilibili、抖音、Reddit 和 X/Twitter 已做低频元数据测试，但未达到接入门槛。**

### 2. 当前产品白名单

API 和 Worker 都会重复校验域名，目前只允许：

YouTube：

- `youtube.com`
- `www.youtube.com`
- `m.youtube.com`
- `music.youtube.com`
- `youtu.be`

TikTok：

- `tiktok.com`
- `www.tiktok.com`
- `m.tiktok.com`
- `vm.tiktok.com`
- `vt.tiktok.com`

Vimeo 单视频：

- `vimeo.com`
- `www.vimeo.com`
- `player.vimeo.com`

SoundCloud 单曲（仅 Audio / MP3）：

- `soundcloud.com`
- `www.soundcloud.com`
- `m.soundcloud.com`
- `on.soundcloud.com`

其他网站目前不会进入处理流程。Vimeo 频道、合集和非单视频页面，以及 SoundCloud 播放列表、主页和搜索页也会被拒绝。URL 必须是 HTTPS，不能包含用户名、密码、自定义端口，也不能指向内网、保留地址或 AWS Metadata。

### 3. 使用额度

- 匿名用户：滚动 24 小时内五个成功任务；
- 登录用户：不显示固定日限额，但受公平使用、并发和防滥用规则约束；
- 匿名并发：一个任务；
- 登录并发：两个任务；
- 使用 Idempotency Key 防止重复提交；
- 提交突发和重复失败会限速。

### 4. 任务生命周期

已经包含：

- queued；
- processing；
- ready；
- failed；
- canceled；
- 租约与心跳；
- SQS Visibility 延长；
- 安全重试和 DLQ；
- 用户取消；
- 临时文件清理；
- S3 上传和 CloudFront 签名。

### 5. 生产总开关

当前 `media_runtime_config.accepting_jobs = true`，由用户在 2026-07-18 显式决定开放。紧急停止接单时，将其改为 `false`；有效请求随后应返回：

```json
{
  "error": {
    "code": "SERVICE_DISABLED",
    "message": "Media processing is not accepting new jobs yet."
  }
}
```

HTTP Status：`503`。

### 6. 平台独立开关

`media_platform_config` 控制单个平台是否接单。当前生产值为：

- `youtube = false`
- `tiktok = true`
- `vimeo = true`
- `soundcloud = true`

关闭的平台返回 `SOURCE_DISABLED`（HTTP `503`），不会创建下载记录、消耗额度或发送 SQS 消息。未来只有在授权的 YouTube ISP/代理全链路测试通过后，才可把 `youtube` 改为 `true`。

## 五、已经完成的安全措施

- AWS 凭据来自 EC2 Instance Profile，不在代码和 Compose 中保存 Access Key；
- Worker 的 Supabase 后端密钥保存在 AWS Secrets Manager：`pullvio/supabase/worker`；
- Vercel 通过 OIDC 获取短期 AWS 权限，只允许向指定 SQS 发送消息；
- SSH 密码登录和 Root 登录已关闭；
- 22 端口只允许管理员当前公网 IP `/32`；
- 不允许把 SSH 开放成 `0.0.0.0/0`；
- Worker 和 Provider 容器只读、非 Root、Drop Capabilities、启用 `no-new-privileges`；
- PO Token Provider 不发布宿主机端口；
- Provider 没有 AWS、Supabase、Clerk、YouTube Cookie 等凭据；
- iptables 阻止 Provider 访问 `169.254.0.0/16`；
- 用户输入不会拼接到 Shell 命令中；
- 不记录原始 IP 作为永久用户身份；
- S3 全私有，文件通过短时 CloudFront 签名 URL 返回。

## 六、TikTok 当前结果

2026-07-18 在 EC2 Worker 内使用 TikTok 官方开发文档中的公开视频示例进行元数据测试：

```text
https://www.tiktok.com/@scout2015/video/6718335390845095173
```

结果：

- yt-dlp 解析成功；
- 返回有效 MP4 格式；
- 音视频都存在；
- 可识别到 720x1280；
- 使用 Worker 当前 MP4 格式选择器进行 `--simulate` 成功。

这说明 TikTok 不存在当前 YouTube 同类的 AWS 出口阻塞。但正式开放前，仍需要在隔离开关下完成一次：

```text
浏览器提交 → SQS → Worker → S3 → CloudFront → 浏览器下载
```

的授权内容全链路验证。

## 七、YouTube 问题与证据

测试使用 Blender 的 Big Buck Bunny 公开视频：

```text
https://www.youtube.com/watch?v=aqz-KE-bpKQ
```

| 测试项目 | 结果 |
| --- | --- |
| 原 AWS EIP `3.212.192.122` | `LOGIN_REQUIRED` |
| 新 EIP `54.167.31.14` | 同样立即 `LOGIN_REQUIRED` |
| yt-dlp + Deno + 当前 EJS | `LOGIN_REQUIRED` |
| `mweb` + BgUtils GVS PO Token | `LOGIN_REQUIRED` |
| `web_safari` | `LOGIN_REQUIRED` |
| `web_embedded` | `LOGIN_REQUIRED` |
| `android_vr` | `LOGIN_REQUIRED` |

新 EIP 只执行了一次低频元数据测试，之后已经切回原 EIP 并释放测试 EIP，没有继续轮换。

结论：

- 不是某一个 EIP 的历史污染；
- 不是 FFmpeg 问题，因为尚未进入下载/合并阶段；
- 不是 S3、CloudFront 或 Vercel 问题；
- 不是只缺少 EJS；
- 不是只缺少 BgUtils PO Token；
- 不是只需要换一个 yt-dlp Player Client；
- 高概率是 YouTube 对 AWS 数据中心网段、ASN 或此类非官方客户端流量的整体拒绝。

## 七之一、Bilibili 与抖音验证结果

2026-07-18 在生产总开关保持关闭的前提下，对两个公开标准链接各执行了一次低频元数据探测。测试没有创建 Pullvio 下载任务，没有下载媒体文件，也没有写入 S3。

### Bilibili

测试链接：

```text
https://www.bilibili.com/video/BV1Fb4111732/
```

EC2 上的 yt-dlp 能识别 `BiliBili` Extractor，但在获取网页阶段返回：

```text
HTTP Error 412: Precondition Failed
```

因此未能取得媒体格式，也没有达到加入 API 与 Worker 白名单的标准。当前结果更接近数据中心出口或站点风控拒绝，不代表所有网络环境均无法解析。

### 抖音

测试链接：

```text
https://www.douyin.com/video/7619578317012035689
```

EC2 上的 yt-dlp 能识别 `Douyin` Extractor，但返回：

```text
Fresh cookies (not necessarily logged in) are needed
```

Pullvio 当前明确不接收用户浏览器 Cookie、登录态 Cookie 或第三方平台账号凭据，因此不能直接按这个条件上线。若以后研究隔离的一次性访客会话，需要重新完成安全、隐私与平台政策评审。

结论：Bilibili 与抖音当前均不属于 Pullvio 已支持平台，不应在前端或 SEO 页面中宣称可下载。

## 七之二、Vimeo、SoundCloud、Reddit 与 X/Twitter 验证结果

2026-07-18 使用公开样本做了低频、仅元数据验证，没有创建下载任务或写入 S3：

- Vimeo：CC BY 单视频 `https://vimeo.com/777912896` 成功解析到 1080p，已按“单视频 URL”范围接入；
- SoundCloud：CC BY 单曲 `https://soundcloud.com/scottbuckley/simplicity-cc-by` 成功解析，已按“单曲且仅 Audio / MP3”范围接入；
- Reddit：公开帖子仍要求账号 Cookie，与当前无第三方登录态安全模型冲突，未接入；
- X/Twitter：两个官方公开样本分别出现无视频和服务端域名错误，未达到稳定接入门槛。

数据库平台约束已经扩展，Vercel API 已发布，EC2 Worker 镜像 `pullvio/media-worker:2026-07-18` 已部署且运行正常，生产接单总开关已经开启。

首次 Vimeo 完整测试发现 Worker 等待子进程退出后才读取 stdout/stderr；大型元数据 JSON 会填满系统管道并造成超时。Worker 已改为在保留心跳、取消和超时检查的同时持续排空两个管道。修复后，720p CC BY 测试视频在约 11 秒内完成，生成 16,249,144 字节 MP4；CloudFront 签名地址返回 `200 video/mp4`，同一对象的 S3 直连返回 `403`。

## 八、对开源项目和竞品的调研结论

### yt-dlp

yt-dlp 当前推荐 `mweb + PO Token Provider`。Pullvio 已经按该建议实施。PO Token 用来完成来源证明和 GVS 验证，但不保证解除已经发生的 IP/网络拒绝。

参考：<https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide>

### BgUtils

当前 Provider 工作正常，yt-dlp Verbose 日志可以发现：

```text
bgutil:http-1.3.1 (external)
```

但项目本身不承诺绕过已封锁 IP，我们的两个 AWS EIP 都没有因此恢复。

参考：<https://github.com/Brainicism/bgutil-ytdlp-pot-provider>

### WPC Provider

`yt-dlp-getpot-wpc` 会启动 Chromium，用 YouTube WebPoClient 生成 GVS 和 Player PO Token。这是目前唯一尚未测试、且值得做一次隔离验证的纯代码方案。

限制：

- 实验性质；
- 需要 Chromium；
- 增加内存和攻击面；
- 最终仍然从相同 AWS IP 访问 YouTube；
- 如果是 ASN 级拒绝，仍然会失败。

参考：<https://github.com/coletdjnz/yt-dlp-getpot-wpc>

### Cobalt

Cobalt 不是只靠 YouTube.js：它同时提供 Session Generator、Cookie、标准 HTTP/HTTPS Proxy 和 IPv6 `FREEBIND_CIDR` 地址池配置。这证明它也需要会话和可用出口。

检查交接当天 Cobalt 官方 API 公布的服务列表时，列表中已经没有 YouTube，虽然源代码仍保留 YouTube 支持。

参考：

- <https://github.com/imputnet/cobalt/blob/main/docs/api-env-variables.md>
- <https://api.cobalt.tools/>

Cobalt 官方文档也明确表示，托管 API 不是供其他项目直接依赖的公共后端。不能直接把官方 Cobalt API 接到 Pullvio。

### Invidious / Piped

两者都公开遇到过 YouTube 封禁数据中心、VPN 或实例出口。Invidious 的建议是让 Companion 使用另一个被接受的 Proxy；Piped 有使用不同 IPv4 或 IPv6 地址池暂时恢复的案例。

参考：

- <https://docs.invidious.io/youtube-errors-explained/>
- <https://github.com/TeamPiped/Piped/issues/3060>

### TubePull

TubePull 公开说明它会读取 YouTube 格式、从 YouTube CDN 拉取媒体，并在服务器合并高质量音视频；同时用订阅费用维持服务器和监控。但它没有公开具体出口、Session、Proxy 或节点结构。

因此只能判断它不只是运行一个默认配置的云服务器，不能确认它具体使用了住宅代理、ISP 节点还是其他私有技术。

参考：<https://tubepull.com/youtube/>

## 九、已经排除或不建议的方向

### 不要继续轮换 AWS EIP

新 EIP 已经验证失败。继续购买/释放 IP 只会产生费用和不稳定操作，不能作为商业方案。

### 不要建立 YouTube Cookie/账号池

- 有封号风险；
- Cookie 容易轮换和失效；
- 账号凭据安全风险高；
- 不适合公开 SaaS；
- 项目当前安全约束明确禁止浏览器 Cookie 和来源账号。

### 不要仅仅切换到 Cobalt、Invidious 或 Piped

在同一个 AWS 出口上切换解析库，不能改变出口网络信誉。

### 不要把官方 YouTube API 当作下载方案

官方 API 不提供通用视频文件下载能力。YouTube API Developer Policies 对未经书面允许下载、缓存或存储音视频有明确限制。

参考：<https://developers.google.com/youtube/terms/developer-policies>

### 不建议随机住宅 IP

一个任务中的页面、Visitor Data、PO Token、媒体 URL 和分片下载可能需要保持同一出口和请求上下文。随机换 IP 容易在 `googlevideo.com` 阶段返回 `403`。

### 不建议把 IPv6 轮换当作长期基础

技术上可能暂时有效，但容易再次被封，运维复杂，也无法形成稳定 SLA。

## 十、推荐方案

### 目标架构：独立 YouTube ISP Edge Worker

```text
Vercel API
    │
    ▼
AWS SQS
    ├──────── TikTok / 默认 EC2 Worker
    │
    └──────── YouTube ISP Edge Worker
                    │
                    │ 同一 Sticky 出口完成全部 YouTube 请求
                    ▼
                 S3 上传
                    │
                    ▼
              CloudFront 下载
```

YouTube 单个任务必须保持同一出口：

1. 获取网页和播放器配置；
2. 创建 Visitor/Session 上下文；
3. 生成 PO Token；
4. 获取 `googlevideo.com` 地址；
5. 下载所有音视频分片；
6. FFmpeg 合并；
7. 上传 S3。

不能在一个 IP 上生成媒体 URL，再让 AWS 或另一个 IP 下载文件。

Edge Worker 可以考虑：

1. 明确允许该用途的商业宽带/ISP 网络 Linux 主机；
2. 明确允许商业媒体流量的 ISP 出口托管服务；
3. 前期用 Sticky ISP/住宅出口做小规模验证；
4. 成功后再部署可持续的固定 ISP Edge 节点。

住宅 Proxy 如果按 GB 计费，不适合作为大流量长期方案，因为完整视频流量必须经过该出口。

## 十一、建议接手后的执行顺序

### 阶段 A：WPC 最后一次无代理测试

构建一次性 ARM64 测试镜像：

- 当前 yt-dlp；
- Chromium；
- `yt-dlp-getpot-wpc`；
- 无 YouTube 登录 Cookie；
- 不接入生产队列；
- 只做少量授权内容元数据测试。

判断规则：

- 如果能稳定获取元数据和媒体 URL，再做一个受限的全链路测试；
- 如果仍然出现相同机器人验证，停止 AWS 上的 Client/Token 实验，进入阶段 B。

### 阶段 B：Sticky ISP 出口 Pilot

测试 20–50 个拥有授权的公开视频，包括普通视频和 Shorts。

最低验收条件：

- 首次元数据成功率至少 95%；
- 完整文件成功率至少 95%；
- 全任务同一出口；
- 不使用账号 Cookie；
- 不支持私有、付费、会员、DRM、直播和登录限制内容；
- 记录每 GB 和每成功任务成本；
- 连续出现 Bot Challenge 或 429 时自动熔断；
- 出口供应商 AUP 允许业务用途；
- 上线前完成法律和产品政策评估。

### 阶段 C：拆分生产 Worker

- 为 YouTube 增加独立 Queue 或 SQS Routing Attribute；
- TikTok 继续使用 AWS Worker；
- YouTube Edge Worker 独立扩容和关闭；
- 保留当前 API 和数据库状态机，不改前端协议；
- 增加平台级成功率、队列等待、出口风控、成本告警；
- 先内部人员，再小范围 Allowlist，最后才考虑公开。

## 十二、接手所需权限

通过安全渠道分别提供：

1. GitHub 仓库权限；
2. AWS IAM/Console 权限；
3. EC2 SSH 私钥；
4. Vercel 项目权限；
5. Supabase 项目权限或有限 CLI Token；
6. 需要修改登录时再提供 Clerk 项目权限。

不要通过仓库、Issue、普通聊天或本文档传递：

- PEM 私钥；
- Supabase Service Role Secret；
- Clerk Secret Key；
- Vercel Secret；
- AWS Access Key；
- Proxy 用户名和密码；
- YouTube Cookie。

## 十三、常用运维命令

如果维护人员公网 IP 发生变化，先按运维手册修改 Security Group 的 SSH `/32`，不要开放全网。

```bash
ssh -i ~/.ssh/pullvio-01.pem ubuntu@3.212.192.122

sudo systemctl status pullvio-media-worker --no-pager
sudo docker ps --filter name=pullvio
sudo docker logs --tail 200 pullvio-media-worker
sudo docker logs --tail 100 pullvio-pot-provider

sudo sh -c 'cd /opt/pullvio/media-worker && docker compose config --quiet'
```

本地验证：

```bash
npm test
npm run typecheck
npm run lint
npm run build

PYTHONPATH=services/media-worker \
  python3 -m unittest discover -s services/media-worker/tests -v

python3 -m compileall -q \
  services/media-worker/pullvio_worker \
  services/media-worker/tests
```

预期健康状态：

- `pullvio-media-worker`：Running；
- `pullvio-pot-provider`：Running；
- Provider 只显示容器内 `4416/tcp`，不能出现 `0.0.0.0:4416`；
- 空闲期间 SQS Visible / In-flight 应回到 0；
- 有效 Vimeo 请求应进入队列；紧急关闭后 API 应返回 `503 SERVICE_DISABLED`；
- Provider 无法访问 `169.254.169.254`；
- EC2 出口仍为 `3.212.192.122`。

## 十四、关键代码位置

| 功能 | 文件 |
| --- | --- |
| 提交 API | `app/api/media/jobs/route.ts` |
| 状态和取消 API | `app/api/media/jobs/[jobId]/route.ts` |
| 前端任务状态机 | `app/components/media-studio.tsx` |
| URL 和平台白名单 | `lib/media/source-url.ts` |
| API 请求协议 | `lib/media/contracts.ts` |
| SQS Producer | `lib/media/queue.ts` |
| Supabase Repository | `lib/media/repository.ts` |
| Worker 主逻辑 | `services/media-worker/pullvio_worker/worker.py` |
| yt-dlp 命令和安全策略 | `services/media-worker/pullvio_worker/domain.py` |
| Docker Compose | `services/media-worker/compose.yaml` |
| systemd Unit | `services/media-worker/pullvio-media-worker.service` |
| Worker 测试 | `services/media-worker/tests/` |
| 数据库控制面迁移 | `supabase/migrations/202607170001_create_media_job_control_plane.sql` |
| Worker 生命周期迁移 | `supabase/migrations/202607170002_create_media_worker_lifecycle.sql` |
| Claim 修复迁移 | `supabase/migrations/202607170003_fix_media_job_claim.sql` |
| 后端实施记录 | `docs/plans/2026-07-17-media-backend-control-plane-implementation.md` |
| EC2 运维手册 | `docs/runbooks/ec2-worker-maintenance.md` |
| 英文详细交接 | `docs/handoffs/2026-07-18-youtube-backend-handoff.md` |

注意：早期 AWS 设计文档顶部的“未实施”快照已经过时。当前状态应以后端实施记录和本文档为准。

## 十五、正式开放前检查表

- [ ] WPC 隔离实验完成并记录结论；
- [ ] 选择的出口符合供应商 AUP；
- [ ] 完成 YouTube 条款与产品法律风险评估；
- [ ] 没有保存维护人员或用户的 YouTube Cookie；
- [ ] 一个授权 YouTube 任务完成全链路；
- [ ] 多视频 Pilot 达到成功率门槛；
- [ ] 元数据、Token 和媒体分片使用同一 Sticky 出口；
- [x] S3 仍为私有；
- [x] CloudFront 签名下载验证通过；
- [ ] 成本、带宽、429 和 Source Block 告警有效；
- [ ] 连续风控自动熔断；
- [ ] 并发、时长、文件大小限制已经确认；
- [ ] Worker 临时文件和 S3 生命周期清理有效；
- [ ] Tests、Typecheck、Lint、Build 全部通过；
- [ ] 先内部/Allowlist 灰度；
- [x] 已由用户显式决定开启 `accepting_jobs`；YouTube 风险与阻塞仍需单独处理。

## 十六、最终建议

接手人员可以选择：

1. 先做一次 WPC/Chromium 隔离实验；或
2. 直接开始 ISP Edge Pilot。

推荐先做一次 WPC，因为成本低，而且它是 yt-dlp 当前列出的另一个 Featured Provider。但如果失败，不要继续轮换 AWS IP、添加账号 Cookie、反复试 Player Client，直接转向 ISP Edge。

长期推荐结构是：

```text
AWS 负责控制面、SQS、S3、CloudFront、TikTok
ISP Edge Worker 只负责 YouTube 获取与处理
```

这是当前证据下成功率、可维护性、成本和安全边界最均衡的方案。
