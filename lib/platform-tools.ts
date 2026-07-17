import type { Locale } from "./i18n";

export const platformSlugs = ["youtube-video-downloader", "tiktok-video-downloader"] as const;
export type PlatformSlug = (typeof platformSlugs)[number];

type PlatformCopy = {
  title: string;
  description: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  accent: string;
  intro: string;
  placeholder: string;
  benefits: string[];
  howEyebrow: string;
  howTitle: string;
  steps: [string, string][];
  formatsEyebrow: string;
  formatsTitle: string;
  formatsIntro: string;
  formats: [string, string, string][];
  boundariesEyebrow: string;
  boundariesTitle: string;
  worksTitle: string;
  worksCopy: string;
  limitsTitle: string;
  limitsCopy: string;
  responsibleTitle: string;
  responsibleCopy: string;
  guideEyebrow: string;
  guideTitle: string;
  guideCopy: string;
  guideCta: string;
  relatedEyebrow: string;
  relatedTitle: string;
  relatedCopy: string;
  relatedCta: string;
  faqEyebrow: string;
  faqTitle: string;
  faqIntro: string;
  faqs: [string, string][];
};

type PlatformDefinition = {
  platform: "YouTube" | "TikTok";
  guideSlug: string;
  relatedSlug: PlatformSlug;
  copy: Record<Locale, PlatformCopy>;
};

export const platformTools: Record<PlatformSlug, PlatformDefinition> = {
  "youtube-video-downloader": {
    platform: "YouTube",
    guideSlug: "save-youtube-videos",
    relatedSlug: "tiktok-video-downloader",
    copy: {
      en: {
        title: "YouTube Video Downloader – MP4, MP3 & 4K | Pullvio",
        description: "Download permitted YouTube videos online as MP4 or MP3 in HD and up to 4K when available. Works on iPhone, Android, Mac, and Windows with no installation.",
        keywords: ["youtube video downloader", "download youtube video", "youtube to mp4", "youtube to mp3", "youtube downloader online", "youtube downloader 4k"],
        eyebrow: "YOUTUBE VIDEO DOWNLOADER",
        h1: "Download YouTube videos online.",
        accent: "Save permitted videos as MP4 or MP3 in HD and 4K.",
        intro: "Use Pullvio as a free YouTube video downloader for public videos you created or are authorized to save. Paste a YouTube link, choose MP4 video or MP3 audio, and select the highest source quality available on iPhone, Android, Mac, or Windows.",
        placeholder: "Paste a public YouTube video link",
        benefits: ["YouTube to MP4 and MP3", "HD and up to 4K when the source provides it", "No app on iPhone, Android, Mac, or Windows"],
        howEyebrow: "HOW TO DOWNLOAD YOUTUBE VIDEOS",
        howTitle: "From a YouTube URL to a useful file in three steps.",
        steps: [["Copy the public video URL", "Open the YouTube video you have permission to save and copy its full link from the address bar or Share menu."], ["Paste and choose a format", "Add the URL above, then choose MP4 video or MP3 audio and an available source resolution."], ["Save it to your device", "After processing, download the file through your browser and move it into your own organized media folder."]],
        formatsEyebrow: "FORMAT & QUALITY",
        formatsTitle: "Choose the format that matches the job.",
        formatsIntro: "YouTube source files can vary by upload, device, region, and video. Pullvio presents only the formats and resolutions that can be prepared from the source—it does not manufacture detail that is not there.",
        formats: [["MP4", "Video with picture and sound", "A practical choice for playback, offline reference, editing, and personal archives."], ["MP3", "Audio without the video track", "Useful for authorized interviews, lectures, podcasts, or your own music when the picture is unnecessary."], ["HD / 4K", "Resolution based on the source", "1080p works well for everyday viewing. Higher resolutions appear only when the source genuinely provides them."]],
        boundariesEyebrow: "WHAT PULLVIO HANDLES",
        boundariesTitle: "Built for public links—not access-control workarounds.",
        worksTitle: "Good fit: accessible, authorized videos",
        worksCopy: "Use public YouTube watch URLs for your own uploads, licensed material, public-domain works, and other videos you have a legal right to save.",
        limitsTitle: "May not work: restricted sources",
        limitsCopy: "Private videos, members-only content, rentals, DRM-protected media, age or region restrictions, active live streams, deleted videos, and links requiring a signed-in session may be unavailable.",
        responsibleTitle: "Your permission still matters",
        responsibleCopy: "A public URL is not automatically a license to download or republish. Check the creator’s permission, the applicable license, YouTube’s terms, and local law before saving or reusing a video.",
        guideEyebrow: "YOUTUBE GUIDE",
        guideTitle: "Want the responsible-use details first?",
        guideCopy: "Read our practical guide to ownership, licenses, public-domain media, platform restrictions, and safer personal archiving before you save a YouTube video.",
        guideCta: "Read the YouTube guide",
        relatedEyebrow: "ANOTHER PLATFORM",
        relatedTitle: "Need to save a public TikTok clip?",
        relatedCopy: "Use the dedicated TikTok tool page for short-form public links and platform-specific guidance.",
        relatedCta: "Open TikTok downloader",
        faqEyebrow: "YOUTUBE DOWNLOADER FAQ",
        faqTitle: "Common YouTube download questions.",
        faqIntro: "Clear answers about formats, quality, devices, restrictions, and responsible use.",
        faqs: [["Is the Pullvio YouTube video downloader free?", "Yes. You can complete five downloads without signing in. A free account has no fixed download cap, but fair-use, security, and source-availability limits still apply."], ["Can I convert a YouTube video to MP4?", "Choose Video mode to prepare an MP4 file with picture and sound. Available resolution depends on the original upload and what the source currently makes available."], ["Can I extract MP3 audio from YouTube?", "Choose Audio mode to prepare an MP3 when you have permission to use the audio. This is useful when the visual track is unnecessary."], ["Can I download YouTube videos in HD or 4K?", "Pullvio shows the genuine resolutions available from the source, including 720p, 1080p, 2K, or 4K when provided. It does not turn a lower-resolution upload into artificial 4K."], ["Does it work with private, members-only, or live videos?", "Not reliably. Content that needs a login, payment, membership, special access, active live delivery, or DRM is outside the intended public-link workflow."], ["Can I use the YouTube downloader on iPhone or Android?", "Yes. Pullvio runs in a modern mobile browser without an app or extension. Your finished file normally appears in the browser download list or the device’s Downloads or Files area."], ["Is downloading a YouTube video legal?", "It depends on ownership, permission, license terms, platform rules, and local law. Only save content you created, content with an appropriate license, public-domain works, or media you are otherwise authorized to download."]],
      },
      "zh-cn": {
        title: "YouTube 视频下载器 - 在线下载 MP4、MP3 与 4K | Pullvio",
        description: "使用 Pullvio 在线下载您有权保存的 YouTube 视频，可选择 MP4、MP3、HD 及来源提供时的 4K 画质。支持 iPhone、Android、Mac 和 Windows 浏览器。",
        keywords: ["YouTube视频下载", "YouTube下载器", "YouTube转MP4", "YouTube转MP3", "油管视频下载"],
        eyebrow: "YOUTUBE 视频下载器",
        h1: "在线下载 YouTube 视频。",
        accent: "将获得授权的视频保存为 HD、4K MP4 或 MP3。",
        intro: "Pullvio 是面向公开视频的免费 YouTube 视频下载器。粘贴您自己创作或已获得保存授权的 YouTube 链接，选择 MP4 视频或 MP3 音频，并在 iPhone、Android、Mac 或 Windows 上使用来源实际提供的最高画质。",
        placeholder: "粘贴公开的 YouTube 视频链接",
        benefits: ["YouTube 转 MP4 与 MP3", "来源提供时支持 HD、2K 与 4K", "iPhone、Android、Mac 与 Windows 无需安装"],
        howEyebrow: "如何下载 YOUTUBE 视频",
        howTitle: "三个步骤，把 YouTube 链接变成实用文件。",
        steps: [["复制公开视频网址", "打开您有权保存的 YouTube 视频，从地址栏或分享菜单复制完整链接。"], ["粘贴并选择格式", "将链接粘贴到上方，选择 MP4 视频或 MP3 音频，再选择来源实际提供的画质。"], ["保存到您的设备", "处理完成后通过浏览器下载，并将文件移动到您自己的媒体文件夹中。"]],
        formatsEyebrow: "格式与画质",
        formatsTitle: "根据用途选择正确格式。",
        formatsIntro: "YouTube 可用源文件会受上传内容、设备、地区与视频状态影响。Pullvio 只展示能够从来源准备的格式与分辨率，不会把低画质素材虚假放大。",
        formats: [["MP4", "同时保留画面和声音", "适合播放、离线参考、剪辑和个人归档，是兼容性更广的日常选择。"], ["MP3", "仅保留音频", "适合您有权使用的访谈、课程、播客或原创音乐，无需存储多余画面。"], ["HD / 4K", "以真实来源分辨率为准", "1080p 适合日常观看；只有来源确实提供时，才会显示更高分辨率。"]],
        boundariesEyebrow: "PULLVIO 可以处理什么",
        boundariesTitle: "面向公开链接，不用于绕过访问控制。",
        worksTitle: "适合：公开且获得授权的视频",
        worksCopy: "可处理您自己的上传、公共领域作品、符合许可条件的素材，以及您通过其他方式拥有合法保存权利的公开 YouTube 视频链接。",
        limitsTitle: "可能不可用：受限制来源",
        limitsCopy: "私人视频、会员专享、租赁内容、DRM、年龄或地区限制、仍在直播的内容、已删除视频，以及必须登录才能访问的链接可能无法处理。",
        responsibleTitle: "公开链接不等于下载许可",
        responsibleCopy: "保存或再次使用视频前，请确认创作者许可、内容授权、YouTube 条款以及您所在地的法律。",
        guideEyebrow: "YOUTUBE 使用指南",
        guideTitle: "想先了解合法与负责任的使用方式？",
        guideCopy: "阅读关于内容所有权、开放许可、公共领域、平台限制和个人归档的实用指南，再决定是否保存 YouTube 视频。",
        guideCta: "阅读 YouTube 指南",
        relatedEyebrow: "其他平台",
        relatedTitle: "需要保存公开的 TikTok 短视频？",
        relatedCopy: "前往 TikTok 专用工具页，查看适合短视频链接的操作方式与平台说明。",
        relatedCta: "打开 TikTok 下载器",
        faqEyebrow: "YOUTUBE 下载常见问题",
        faqTitle: "关于 YouTube 视频下载的问题。",
        faqIntro: "集中说明格式、画质、设备、来源限制与合法使用。",
        faqs: [["Pullvio YouTube 视频下载器免费吗？", "免费。前 5 次下载无需登录；创建免费账号后不设固定下载次数，但仍受合理使用、安全与来源可用性限制。"], ["可以把 YouTube 视频转成 MP4 吗？", "可以。选择视频模式即可准备同时包含画面与声音的 MP4；可选画质取决于原始上传和来源当前提供的内容。"], ["可以从 YouTube 提取 MP3 吗？", "可以。在您拥有音频使用许可的前提下，选择音频模式准备 MP3，适合不需要画面的场景。"], ["可以下载 HD 或 4K YouTube 视频吗？", "Pullvio 会显示来源真实提供的 720p、1080p、2K 或 4K 画质，不会把低分辨率视频虚假放大为 4K。"], ["私人、会员或直播视频可以下载吗？", "通常不适合。需要登录、付款、会员权限、特殊访问、仍在直播或带有 DRM 的内容不属于公开链接处理范围。"], ["iPhone 和 Android 可以使用吗？", "可以。Pullvio 直接在现代手机浏览器中运行，无需 App 或扩展；文件通常会出现在浏览器下载列表或设备的“下载/文件”目录。"], ["下载 YouTube 视频合法吗？", "这取决于所有权、许可、平台规则和当地法律。请只保存您创作、拥有适当许可、属于公共领域或已经获得其他明确授权的内容。"]],
      },
      es: {
        title: "Descargador de YouTube – MP4, MP3 y 4K | Pullvio",
        description: "Descarga videos autorizados de YouTube en MP4 o MP3, en HD y hasta 4K cuando esté disponible. Funciona en iPhone, Android, Mac y Windows sin instalar nada.",
        keywords: ["descargador de videos de youtube", "descargar video youtube", "youtube a mp4", "youtube a mp3", "descargar youtube online"],
        eyebrow: "DESCARGADOR DE YOUTUBE",
        h1: "Descarga videos de YouTube online.",
        accent: "Guarda videos autorizados en MP4, MP3, HD o 4K.",
        intro: "Usa Pullvio como descargador gratuito de YouTube para videos públicos propios o autorizados. Pega el enlace, elige MP4 o MP3 y selecciona la mejor calidad real disponible desde iPhone, Android, Mac o Windows.",
        placeholder: "Pega un enlace público de YouTube",
        benefits: ["YouTube a MP4 y MP3", "HD y hasta 4K cuando existe en la fuente", "Sin app en iPhone, Android, Mac o Windows"],
        howEyebrow: "CÓMO DESCARGAR VIDEOS DE YOUTUBE",
        howTitle: "Del enlace de YouTube al archivo en tres pasos.",
        steps: [["Copia la URL pública", "Abre el video que tienes permiso para guardar y copia el enlace completo desde la barra o el menú Compartir."], ["Pega y elige formato", "Añade la URL arriba, selecciona video MP4 o audio MP3 y una resolución disponible."], ["Guarda en tu dispositivo", "Cuando termine el proceso, descarga el archivo desde el navegador y organízalo en tu carpeta personal."]],
        formatsEyebrow: "FORMATO Y CALIDAD",
        formatsTitle: "Elige según el uso final.",
        formatsIntro: "Los archivos disponibles varían según la subida, el dispositivo, la región y el estado del video. Pullvio solo muestra formatos y resoluciones que la fuente permite preparar.",
        formats: [["MP4", "Imagen y sonido juntos", "Una opción compatible para reproducción, consulta offline, edición y archivo personal."], ["MP3", "Audio sin la pista visual", "Para entrevistas, clases, podcasts o música propia autorizada cuando no necesitas imagen."], ["HD / 4K", "Resolución basada en la fuente", "1080p equilibra calidad y tamaño; las resoluciones superiores solo aparecen si existen realmente."]],
        boundariesEyebrow: "QUÉ PUEDE PROCESAR",
        boundariesTitle: "Para enlaces públicos, no para eludir controles.",
        worksTitle: "Adecuado: videos accesibles y autorizados",
        worksCopy: "Usa URLs públicas para tus propias subidas, obras de dominio público, material con licencia y otros videos que tengas derecho legal a guardar.",
        limitsTitle: "Puede no funcionar: fuentes restringidas",
        limitsCopy: "Videos privados, contenido para miembros, alquileres, DRM, restricciones de edad o región, directos activos, videos borrados y enlaces que exigen sesión pueden no estar disponibles.",
        responsibleTitle: "Un enlace público no concede permiso",
        responsibleCopy: "Comprueba el permiso del creador, la licencia, las condiciones de YouTube y la ley local antes de guardar o reutilizar un video.",
        guideEyebrow: "GUÍA DE YOUTUBE",
        guideTitle: "Consulta primero el uso responsable.",
        guideCopy: "Nuestra guía explica propiedad, licencias, dominio público, restricciones de plataforma y archivo personal más seguro.",
        guideCta: "Leer la guía de YouTube",
        relatedEyebrow: "OTRA PLATAFORMA",
        relatedTitle: "¿Necesitas guardar un clip público de TikTok?",
        relatedCopy: "Abre la herramienta específica para enlaces cortos y recomendaciones propias de TikTok.",
        relatedCta: "Abrir descargador de TikTok",
        faqEyebrow: "PREGUNTAS SOBRE YOUTUBE",
        faqTitle: "Dudas comunes sobre descargas de YouTube.",
        faqIntro: "Formatos, calidad, dispositivos, restricciones y uso responsable, explicados con claridad.",
        faqs: [["¿El descargador de YouTube de Pullvio es gratis?", "Sí. Puedes completar cinco descargas sin iniciar sesión. Una cuenta gratuita no tiene un límite fijo, aunque siguen aplicándose el uso razonable, la seguridad y la disponibilidad de la fuente."], ["¿Puedo convertir un video de YouTube a MP4?", "Sí. El modo Video prepara un MP4 con imagen y sonido. La resolución depende de la subida original y de lo que la fuente ofrezca."], ["¿Puedo extraer MP3 de YouTube?", "Sí, si tienes permiso para usar ese audio. Selecciona Audio para preparar un MP3 cuando la imagen no sea necesaria."], ["¿Puedo descargar YouTube en HD o 4K?", "Pullvio muestra 720p, 1080p, 2K o 4K cuando la fuente realmente los ofrece. No convierte una subida de baja resolución en 4K artificial."], ["¿Funciona con videos privados, para miembros o directos?", "No de forma fiable. El contenido que exige sesión, pago, membresía, acceso especial, DRM o que sigue en directo queda fuera del flujo público."], ["¿Puedo usarlo en iPhone o Android?", "Sí. Funciona en navegadores móviles modernos sin app ni extensión. El archivo suele aparecer en la lista de descargas o en la app Archivos del dispositivo."], ["¿Es legal descargar videos de YouTube?", "Depende de la propiedad, el permiso, la licencia, las reglas de la plataforma y la ley local. Guarda solo contenido propio, autorizado o de dominio público."]],
      },
    },
  },
  "tiktok-video-downloader": {
    platform: "TikTok",
    guideSlug: "save-tiktok-videos",
    relatedSlug: "youtube-video-downloader",
    copy: {
      en: {
        title: "TikTok Video Downloader – HD MP4 & MP3 | Pullvio",
        description: "Download permitted TikTok videos online as HD MP4 or MP3. Pullvio works in iPhone, Android, Mac, and Windows browsers with no app or extension required.",
        keywords: ["tiktok video downloader", "download tiktok video", "tiktok to mp4", "tiktok to mp3", "tiktok downloader online", "tiktok downloader hd"],
        eyebrow: "TIKTOK VIDEO DOWNLOADER",
        h1: "Download TikTok videos online.",
        accent: "Save permitted clips as HD MP4 or MP3.",
        intro: "Use Pullvio as a free TikTok video downloader for public clips you created or are allowed to save. Paste the post link, choose MP4 video or MP3 audio, and download through your iPhone, Android, Mac, or Windows browser without installing an app.",
        placeholder: "Paste a public TikTok video link",
        benefits: ["TikTok to HD MP4 and MP3", "Direct public post links", "No app on iPhone, Android, Mac, or Windows"],
        howEyebrow: "HOW TO DOWNLOAD TIKTOK VIDEOS",
        howTitle: "A clean short-form workflow in three steps.",
        steps: [["Copy the TikTok post link", "Open the public clip, tap Share, and copy the full post URL for content you own or have permission to save."], ["Paste and choose the output", "Add the link above and select MP4 for video or MP3 when you are authorized to use only the sound."], ["Download and organize", "Save the result through your browser, then use a clear filename and keep creator or license details with your archive."]],
        formatsEyebrow: "SHORT-FORM FORMAT CHOICES",
        formatsTitle: "Keep the clip useful after it leaves the feed.",
        formatsIntro: "TikTok posts are optimized for fast mobile viewing. The best saved copy preserves the available source, uses a widely supported format, and retains the context you need to identify the creator and permission later.",
        formats: [["MP4", "The complete short-form video", "Keeps vertical picture and sound together for personal playback, approved editing, or archiving your own posts."], ["MP3", "Authorized audio only", "Creates a smaller audio file when you own or have permission to use the sound and do not need the visual track."], ["SOURCE", "Available quality—not artificial upscaling", "Pullvio uses the accessible source quality. A low-resolution post cannot become genuine HD or 4K by changing a label."]],
        boundariesEyebrow: "PUBLIC POST SUPPORT",
        boundariesTitle: "Creator settings and post type affect availability.",
        worksTitle: "Good fit: ordinary public video posts",
        worksCopy: "Use direct public post URLs for your own clips, properly licensed posts, promotional assets shared for reuse, and other media you are authorized to save.",
        limitsTitle: "May not work: private or non-video experiences",
        limitsCopy: "Private accounts, friends-only posts, removed clips, regional restrictions, login-only content, active LIVE sessions, photo-mode posts, stories, ads, or protected media may be unavailable or require a different workflow.",
        responsibleTitle: "Keep creator rights and context attached",
        responsibleCopy: "Downloading does not remove copyright, music rights, privacy rights, attribution duties, or TikTok’s platform rules. Do not imply that another creator’s clip is your own.",
        guideEyebrow: "TIKTOK GUIDE",
        guideTitle: "Save short-form media without losing context.",
        guideCopy: "Our TikTok guide covers public links, creator permission, music rights, filenames, mobile storage, and responsible reuse in more detail.",
        guideCta: "Read the TikTok guide",
        relatedEyebrow: "ANOTHER PLATFORM",
        relatedTitle: "Working with a public YouTube video?",
        relatedCopy: "Use the YouTube-specific tool page for long-form links, source resolutions, and platform-specific limitations.",
        relatedCta: "Open YouTube downloader",
        faqEyebrow: "TIKTOK DOWNLOADER FAQ",
        faqTitle: "Common TikTok download questions.",
        faqIntro: "What works, what may not, and how to handle creator content responsibly.",
        faqs: [["Is the Pullvio TikTok video downloader free?", "Yes. You can complete five downloads without signing in. A free account has no fixed download cap, but fair-use, security, and source-availability limits still apply."], ["Can I save a TikTok video as HD MP4?", "Yes, when an accessible public post you are allowed to save provides HD video. MP4 keeps the vertical picture and sound together in a widely supported format."], ["Can I convert TikTok audio to MP3?", "Choose Audio mode when you own the sound or have permission to use it. Music and spoken audio can have rights separate from the video itself."], ["Does Pullvio remove the TikTok watermark?", "Pullvio does not promise watermark removal. It prepares the authorized source that is available and does not hide creator attribution or ownership signals."], ["Do private accounts, photo posts, stories, or LIVE work?", "They may not. The tool is designed around direct public video-post URLs. Private, friends-only, removed, login-only, LIVE, story, and photo-mode experiences can be unavailable."], ["Can I use the TikTok downloader on iPhone or Android?", "Yes. Copy the post URL from TikTok’s Share menu, paste it into Pullvio in your mobile browser, and find the result in browser downloads or the device Files area."], ["Can I repost a downloaded TikTok video?", "Only if you have the necessary rights and permission. Saving a public post does not grant permission to republish, monetize, remove attribution, or reuse licensed music."]],
      },
      "zh-cn": {
        title: "TikTok 视频下载器 - 在线下载 HD MP4/MP3 | Pullvio",
        description: "使用 Pullvio 在线下载您有权保存的 TikTok 视频，可选择 HD MP4 或 MP3。支持 iPhone、Android、Mac 和 Windows 浏览器，无需安装 App 或扩展。",
        keywords: ["TikTok视频下载", "TikTok下载器", "TikTok转MP4", "TikTok转MP3", "抖音国际版视频下载"],
        eyebrow: "TIKTOK 视频下载器",
        h1: "在线下载 TikTok 视频。",
        accent: "将获得授权的短视频保存为 HD MP4 或 MP3。",
        intro: "Pullvio 是面向公开视频的免费 TikTok 视频下载器。粘贴您自己创作或已获得保存许可的帖子链接，选择 MP4 视频或 MP3 音频，即可在 iPhone、Android、Mac 或 Windows 浏览器中使用，无需安装 App。",
        placeholder: "粘贴公开的 TikTok 视频链接",
        benefits: ["TikTok 转 HD MP4 与 MP3", "适用于直接的公开帖子链接", "iPhone、Android、Mac 与 Windows 无需安装"],
        howEyebrow: "如何下载 TIKTOK 视频",
        howTitle: "适合短视频的三个简单步骤。",
        steps: [["复制 TikTok 帖子链接", "打开公开短视频，点击分享并复制完整帖子网址；请确认您拥有或已经获得保存许可。"], ["粘贴并选择输出", "将链接粘贴到上方，选择 MP4；仅在拥有声音使用权时选择 MP3。"], ["下载并整理", "通过浏览器保存结果，使用清晰文件名，并在个人档案中保留创作者与授权信息。"]],
        formatsEyebrow: "短视频格式选择",
        formatsTitle: "离开信息流后，仍然保持文件实用。",
        formatsIntro: "TikTok 帖子主要为快速移动观看优化。合理的个人副本应保留可用源画质、采用兼容格式，并记录日后识别创作者和许可所需的上下文。",
        formats: [["MP4", "完整竖屏短视频", "同时保存竖屏画面和声音，适合个人播放、获准剪辑或归档自己的帖子。"], ["MP3", "仅保留获得授权的音频", "在您拥有声音或使用许可时生成较小音频文件，无需保存多余画面。"], ["源画质", "不进行虚假放大", "Pullvio 使用可访问来源画质；低分辨率帖子不会仅靠修改标签变成真正的 HD 或 4K。"]],
        boundariesEyebrow: "公开帖子支持范围",
        boundariesTitle: "创作者设置与帖子类型会影响可用性。",
        worksTitle: "适合：普通公开视频帖子",
        worksCopy: "可处理您自己的短视频、符合许可条件的帖子、明确提供复用授权的推广素材，以及您有权保存的其他公开媒体。",
        limitsTitle: "可能不可用：私人或非视频体验",
        limitsCopy: "私人账户、仅好友可见、已删除内容、地区限制、登录后内容、仍在进行的 LIVE、图片模式帖子、Stories、广告或受保护媒体可能无法处理。",
        responsibleTitle: "请保留创作者权利与内容上下文",
        responsibleCopy: "下载不会消除版权、音乐权利、隐私权、署名义务或 TikTok 平台规则，也不应把他人的作品描述成自己的作品。",
        guideEyebrow: "TIKTOK 使用指南",
        guideTitle: "保存短视频时，不要丢失授权上下文。",
        guideCopy: "我们的 TikTok 指南进一步说明公开链接、创作者许可、音乐权利、文件命名、手机存储与负责任的再次使用。",
        guideCta: "阅读 TikTok 指南",
        relatedEyebrow: "其他平台",
        relatedTitle: "正在处理公开 YouTube 视频？",
        relatedCopy: "前往 YouTube 专用工具页，查看长视频、源分辨率与平台限制说明。",
        relatedCta: "打开 YouTube 下载器",
        faqEyebrow: "TIKTOK 下载常见问题",
        faqTitle: "关于 TikTok 视频下载的问题。",
        faqIntro: "说明适用范围、可能的限制，以及如何负责任地处理创作者内容。",
        faqs: [["Pullvio TikTok 视频下载器免费吗？", "免费。前 5 次下载无需登录；创建免费账号后不设固定下载次数，但仍受合理使用、安全与来源可用性限制。"], ["可以把 TikTok 视频保存为 HD MP4 吗？", "当您有权保存的公开视频来源提供 HD 时，可以。MP4 会把竖屏画面和声音保存在兼容性较广的文件中。"], ["可以把 TikTok 音频转成 MP3 吗？", "当您拥有声音或已经获得使用许可时，可以选择音频模式。音乐与语音可能拥有独立于视频本身的权利。"], ["Pullvio 会去除 TikTok 水印吗？", "Pullvio 不承诺去除水印，只处理可用且获得授权的来源，也不会刻意隐藏创作者署名或所有权标识。"], ["私人账户、图片帖子、Stories 或 LIVE 可以处理吗？", "不一定。工具主要面向直接的公开视频帖子网址；私人、仅好友、已删除、登录后、直播、Stories 与图片模式内容可能不可用。"], ["iPhone 或 Android 可以使用吗？", "可以。从 TikTok 分享菜单复制帖子链接，在手机浏览器打开 Pullvio 并粘贴；结果通常位于浏览器下载列表或设备文件目录。"], ["下载后可以重新发布 TikTok 视频吗？", "只有在您拥有必要权利和许可时才可以。保存公开视频不代表可以重新发布、商业化、删除署名或使用其中受许可保护的音乐。"]],
      },
      es: {
        title: "Descargador de TikTok – HD MP4 y MP3 | Pullvio",
        description: "Descarga videos autorizados de TikTok en HD MP4 o MP3. Pullvio funciona en iPhone, Android, Mac y Windows sin instalar aplicaciones ni extensiones.",
        keywords: ["descargador de videos de tiktok", "descargar video tiktok", "tiktok a mp4", "tiktok a mp3", "descargar tiktok online"],
        eyebrow: "DESCARGADOR DE TIKTOK",
        h1: "Descarga videos de TikTok online.",
        accent: "Guarda clips autorizados en HD MP4 o MP3.",
        intro: "Usa Pullvio como descargador gratuito de TikTok para clips públicos propios o autorizados. Pega el enlace, elige MP4 o MP3 y descarga desde iPhone, Android, Mac o Windows sin instalar una aplicación.",
        placeholder: "Pega un enlace público de TikTok",
        benefits: ["TikTok a HD MP4 y MP3", "Enlaces directos de publicaciones públicas", "Sin app en iPhone, Android, Mac o Windows"],
        howEyebrow: "CÓMO DESCARGAR VIDEOS DE TIKTOK",
        howTitle: "Un flujo limpio para clips cortos.",
        steps: [["Copia el enlace de la publicación", "Abre el clip público, toca Compartir y copia la URL completa del contenido que puedes guardar."], ["Pega y elige la salida", "Añade el enlace arriba y elige MP4 o, si puedes usar el sonido, audio MP3."], ["Descarga y organiza", "Guarda el resultado desde el navegador con un nombre claro y conserva la información del creador y la licencia."]],
        formatsEyebrow: "FORMATOS PARA VIDEO CORTO",
        formatsTitle: "Mantén el clip útil fuera del feed.",
        formatsIntro: "Las publicaciones de TikTok están optimizadas para el móvil. Una copia responsable conserva la calidad disponible, utiliza un formato compatible y mantiene el contexto del creador.",
        formats: [["MP4", "Video vertical completo", "Conserva imagen y sonido para reproducción personal, edición autorizada o archivo de tus publicaciones."], ["MP3", "Solo audio autorizado", "Crea un archivo menor cuando posees o puedes usar el sonido y no necesitas imagen."], ["ORIGEN", "Calidad disponible sin ampliación falsa", "Pullvio usa la fuente accesible; cambiar una etiqueta no convierte un clip de baja resolución en 4K real."]],
        boundariesEyebrow: "PUBLICACIONES PÚBLICAS",
        boundariesTitle: "La configuración del creador afecta la disponibilidad.",
        worksTitle: "Adecuado: publicaciones públicas normales",
        worksCopy: "Usa enlaces directos para clips propios, contenido con licencia, recursos promocionales autorizados y otros videos que puedas guardar legalmente.",
        limitsTitle: "Puede no funcionar: experiencias privadas",
        limitsCopy: "Cuentas privadas, publicaciones para amigos, clips borrados, restricciones regionales, contenido con sesión, LIVE activo, modo foto, Stories, anuncios o medios protegidos pueden no estar disponibles.",
        responsibleTitle: "Conserva los derechos y el contexto",
        responsibleCopy: "La descarga no elimina derechos de autor, derechos musicales, privacidad, atribución ni reglas de TikTok. No presentes el clip de otra persona como propio.",
        guideEyebrow: "GUÍA DE TIKTOK",
        guideTitle: "Guarda contenido corto sin perder contexto.",
        guideCopy: "La guía explica enlaces públicos, permiso del creador, música, nombres de archivo, almacenamiento móvil y reutilización responsable.",
        guideCta: "Leer la guía de TikTok",
        relatedEyebrow: "OTRA PLATAFORMA",
        relatedTitle: "¿Trabajas con un video público de YouTube?",
        relatedCopy: "Usa la página específica para contenido largo, resoluciones de origen y límites de YouTube.",
        relatedCta: "Abrir descargador de YouTube",
        faqEyebrow: "PREGUNTAS SOBRE TIKTOK",
        faqTitle: "Dudas comunes sobre descargas de TikTok.",
        faqIntro: "Qué funciona, qué puede fallar y cómo respetar al creador.",
        faqs: [["¿El descargador de TikTok de Pullvio es gratis?", "Sí. Puedes completar cinco descargas sin iniciar sesión. Una cuenta gratuita no tiene un límite fijo, aunque siguen aplicándose el uso razonable, la seguridad y la disponibilidad de la fuente."], ["¿Puedo guardar un TikTok como HD MP4?", "Sí, cuando una publicación pública que puedes guardar ofrece calidad HD. MP4 mantiene el video vertical y el audio en un formato compatible."], ["¿Puedo convertir audio de TikTok a MP3?", "Elige Audio si posees el sonido o tienes permiso para usarlo. La música y la voz pueden tener derechos independientes del video."], ["¿Pullvio elimina la marca de agua de TikTok?", "Pullvio no promete eliminar marcas de agua. Prepara la fuente autorizada disponible y no oculta intencionadamente la atribución del creador."], ["¿Funcionan cuentas privadas, fotos, Stories o LIVE?", "Puede que no. La herramienta se centra en URLs directas de videos públicos; contenido privado, para amigos, borrado, con sesión, LIVE, Stories y modo foto puede no estar disponible."], ["¿Puedo usarlo en iPhone o Android?", "Sí. Copia la URL desde Compartir, pégala en Pullvio desde el navegador móvil y busca el resultado en descargas o en la app Archivos."], ["¿Puedo volver a publicar el video descargado?", "Solo con los derechos y permisos necesarios. Guardar una publicación pública no autoriza republicar, monetizar, quitar atribución ni reutilizar música licenciada."]],
      },
    },
  },
};

export function getPlatformTool(slug: PlatformSlug, locale: Locale) {
  const definition = platformTools[slug];
  return { ...definition, slug, content: definition.copy[locale] };
}
