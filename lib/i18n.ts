export const locales = ["en", "zh-cn", "es"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-cn": "简体中文",
  es: "Español",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  "zh-cn": "zh-CN",
  es: "es",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return normalized === "/" ? "/" : normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

const localizedRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/blog",
  "/guides",
  "/privacy",
  "/terms",
  "/copyright",
  "/acceptable-use",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/account",
]);

/**
 * Returns a real route for the selected language. Unknown routes fall back to
 * the selected language's homepage instead of manufacturing a URL that resolves to 404.
 */
export function languageSwitchPath(locale: Locale, currentPath: string): string {
  const normalized = currentPath === "" ? "/" : currentPath.replace(/\/$/, "") || "/";
  if (localizedRoutes.has(normalized) || normalized.startsWith("/guides/") || normalized.startsWith("/blog/")) return localePath(locale, normalized);
  return locale === "en" ? normalized : localePath(locale);
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : "en";
}

export const seo = {
  en: {
    title: "Online Video Downloader – MP4, MP3 & 4K | Pullvio",
    description:
      "Download permitted online videos as MP4, extract MP3 audio, and keep original quality up to 4K. Pullvio works directly in your browser on mobile and desktop.",
    keywords: ["online media tool", "online video downloader", "MP4 and MP3 guide", "video quality guide"],
  },
  "zh-cn": {
    title: "在线视频下载工具 – MP4、MP3 与 4K | Pullvio",
    description:
      "使用 Pullvio 在线下载您有权保存的视频，导出 MP4 或提取 MP3 音频，并保留最高 4K 的原始画质。手机和电脑浏览器均可直接使用。",
    keywords: ["在线媒体工具", "在线视频下载工具", "MP4 MP3 指南", "视频画质指南"],
  },
  es: {
    title: "Descargador de Videos Online – MP4, MP3 y 4K | Pullvio",
    description:
      "Descarga videos permitidos en MP4, extrae audio MP3 y conserva la calidad original hasta 4K. Pullvio funciona en el navegador, tanto en móvil como en ordenador.",
    keywords: ["herramienta multimedia online", "descargador de videos online", "guía MP4 MP3", "calidad de video"],
  },
} satisfies Record<Locale, { title: string; description: string; keywords: string[] }>;

export const localizedContent = {
  "zh-cn": {
    nav: [
      ["使用方法", "#how"],
      ["产品功能", "#features"],
      ["博客", "/blog"],
      ["价格", "#pricing"],
      ["常见问题", "#faq"],
    ],
    signIn: "登录",
    getPro: "升级 Pro",
    announcement: "Pro 现已支持批量任务",
    heroTitle: "在线下载视频。",
    heroAccent: "保留原始画质。",
    heroCopy:
      "粘贴公开视频链接，将您拥有或获得授权的内容下载为 MP4，或者提取为 MP3 音频。免费使用高清画质，升级 Pro 可解锁 4K、长视频和批量处理。",
    trustTitle: "快速、私密、浏览器直接使用",
    trustCopy: "无需安装 · 没有弹窗 · 没有虚假按钮",
    supported: "支持的平台",
    studio: {
      video: "视频",
      audio: "音频",
      quota: "免费版 · 今日可保存 3 次",
      label: "媒体链接",
      placeholder: "粘贴公开媒体链接",
      submit: "获取媒体",
      loading: "正在解析",
      error: "请输入以 http:// 或 https:// 开头的完整链接",
      ready: "可以下载",
      preview: "视频预览",
      download: "下载",
      legal: "请仅保存您拥有或获得许可的媒体内容。",
    },
    howKicker: "使用方法",
    howTitle: "三个简单步骤，完成在线视频下载。",
    steps: [
      ["粘贴公开链接", "复制您拥有或获得授权的媒体链接，然后粘贴到 Pullvio。"],
      ["选择 MP4 或 MP3", "选择视频或音频，再选择适合设备和用途的可用画质。"],
      ["下载到您的设备", "Pullvio 完成处理后，文件将直接通过浏览器交付给您。"],
    ],
    featureKicker: "视频与音频下载器",
    featureTitle: "一个清晰、可靠的在线媒体工作区。",
    featureCopy: "Pullvio 负责格式、画质与文件交付，让手机和电脑上的下载过程保持简单。",
    features: [
      ["默认保护隐私", "临时处理文件会按计划自动删除，下载结果直接发送到您的设备。"],
      ["最高支持 4K 源画质", "当原始媒体提供 2K 或 4K 时，Pro 可以选择真实的高分辨率视频流。"],
      ["MP4 与 MP3", "无需浏览器扩展、弹窗或复杂的格式代码，即可下载视频或提取音频。"],
    ],
    pricingKicker: "免费版与 PRO",
    pricingTitle: "偶尔使用免费，形成工作流后再升级。",
    pricingCopy: "免费版适合日常保存；Pro 为创作者和高频用户提供 4K、长视频、批量队列和优先处理。",
    freeFor: "适合偶尔下载",
    proFor: "适合创作者和高频用户",
    forever: "永久免费",
    monthly: "/ 月",
    startFree: "免费开始",
    popular: "最受欢迎",
    freeItems: ["每天 3 次视频或音频下载", "最高 1080p 高清 MP4", "提取 MP3 音频", "最长 1 小时的视频"],
    proItems: ["更高的合理使用额度", "2K 与 4K 源画质", "长视频和长音频", "批量队列与优先处理"],
    faqKicker: "常见问题",
    faqTitle: "使用前，先把问题说清楚。",
    faqCopy: "从支持的链接、格式与画质，到账号、隐私和合法使用，这里汇总了使用 Pullvio 时最常见的问题。",
    faqSupport: "还有问题？联系我们",
    faqs: [
      ["Pullvio 可以免费使用吗？", "可以。免费版每天提供 3 次下载，支持最高 1080p 的 MP4、MP3 音频以及最长 1 小时的视频。"],
      ["Pullvio 支持哪些网站和链接？", "Pullvio 适用于 YouTube、TikTok、Vimeo、Twitch、SoundCloud 和 X 等受支持来源的公开媒体链接。私人内容、付费墙、DRM、登录后内容、直播或已下架内容可能无法处理。"],
      ["可以下载哪些格式和画质？", "视频可保存为 MP4，音频可提取为 MP3。免费版最高支持 1080p；Pro 可在源文件确实提供时选择 2K 或 4K。可用选项始终取决于原始媒体。"],
      ["为什么有时看不到 2K 或 4K？", "Pullvio 不会凭空放大画质。如果原始上传、当前链接或来源平台没有提供对应分辨率，该选项就不会出现。"],
      ["可以只提取视频中的音频吗？", "可以。切换到音频模式即可生成 MP3，适合保存您有权使用的访谈、课程、播客或原创音乐内容。"],
      ["视频长度有限制吗？", "免费版支持最长 1 小时的视频。Pro 面向长视频和长音频，并采用合理使用额度；极长或超大文件的处理时间会更久。"],
      ["可以一次处理多个链接吗？", "可以。Pro 提供批量队列和优先处理，适合需要连续整理多个授权素材的创作者和团队。"],
      ["需要注册账号吗？", "偶尔使用免费功能不需要账号。注册后可以管理近期链接、账户与 Pro；Pro 用户可获得更完整的跨设备历史记录。"],
      ["手机上可以使用吗？下载的文件在哪里？", "可以，无需安装 App 或浏览器扩展。在 iPhone、Android、Mac 和 Windows 的现代浏览器中均可使用；文件通常会进入浏览器下载列表或设备的“下载”文件夹。"],
      ["为什么链接处理失败或速度较慢？", "常见原因包括链接不公开、内容受地区或年龄限制、直播尚未结束、源内容已删除，或来源平台暂时限制访问。处理时间还会受到视频长度、画质和当前队列影响。"],
      ["Pullvio 会保存我的链接或文件吗？", "成品会直接交付到您的设备，临时处理文件会自动删除。账号历史用于帮助您管理已提交的来源链接；具体范围和保留规则以隐私政策为准。"],
      ["使用 Pullvio 下载内容合法吗？", "这取决于内容、授权许可、来源平台条款以及您所在地的法律。请仅保存自己的作品、公共领域或开放许可内容，以及您已获得明确许可或其他合法权利的媒体。Pullvio 不用于绕过 DRM 或访问控制。"],
    ],
    footer: "您的媒体，漂亮地保存下来。",
    legal: "请仅保存您有权保留的内容。",
  },
  es: {
    nav: [
      ["Cómo funciona", "#how"],
      ["Funciones", "#features"],
      ["Blog", "/blog"],
      ["Precios", "#pricing"],
      ["Preguntas", "#faq"],
    ],
    signIn: "Iniciar sesión",
    getPro: "Obtener Pro",
    announcement: "Las descargas por lotes ya están en Pro",
    heroTitle: "Descarga videos online.",
    heroAccent: "Conserva la calidad.",
    heroCopy:
      "Pega un enlace público para descargar contenido permitido en MP4 o extraer audio MP3. Usa calidad HD gratis o desbloquea 4K, videos largos y lotes con Pro.",
    trustTitle: "Rápido, privado y desde el navegador",
    trustCopy: "Sin instalar · sin ventanas emergentes · sin botones falsos",
    supported: "Plataformas compatibles",
    studio: {
      video: "Video",
      audio: "Audio",
      quota: "Gratis · 3 descargas hoy",
      label: "Enlace del contenido",
      placeholder: "Pega un enlace público",
      submit: "Obtener contenido",
      loading: "Analizando",
      error: "Introduce un enlace completo que comience por http:// o https://",
      ready: "Listo para guardar",
      preview: "Vista previa del video",
      download: "Descargar",
      legal: "Usa Pullvio solo con contenido propio o autorizado.",
    },
    howKicker: "CÓMO FUNCIONA",
    howTitle: "Descarga videos online en tres pasos sencillos.",
    steps: [
      ["Pega un enlace público", "Copia la URL de un contenido propio o autorizado y pégala en Pullvio."],
      ["Elige MP4 o MP3", "Selecciona video o audio y la calidad disponible adecuada para tu dispositivo."],
      ["Descarga el archivo", "Pullvio prepara el archivo y lo entrega directamente a tu navegador."],
    ],
    featureKicker: "DESCARGADOR DE VIDEO Y AUDIO",
    featureTitle: "Un espacio sencillo para guardar contenido online.",
    featureCopy: "Pullvio simplifica los formatos, la calidad y la entrega tanto en móvil como en ordenador.",
    features: [
      ["Privado por defecto", "Los archivos temporales se eliminan automáticamente y el resultado se entrega a tu dispositivo."],
      ["Calidad original hasta 4K", "Cuando la fuente ofrece 2K o 4K reales, Pro permite seleccionar esa resolución."],
      ["MP4 y MP3 sin complicaciones", "Descarga video o extrae audio sin extensiones, anuncios, ventanas emergentes ni códigos de formato."],
    ],
    pricingKicker: "GRATIS Y PRO",
    pricingTitle: "Empieza gratis. Mejora cuando lo necesites.",
    pricingCopy: "Usa Gratis para descargas ocasionales o Pro para 4K, contenido largo, lotes y procesamiento prioritario.",
    freeFor: "Para descargas ocasionales",
    proFor: "Para creadores y usuarios frecuentes",
    forever: "para siempre",
    monthly: "/ mes",
    startFree: "Empezar gratis",
    popular: "MÁS POPULAR",
    freeItems: ["3 descargas de video o audio al día", "Video MP4 hasta 1080p HD", "Extracción de audio MP3", "Videos de hasta 1 hora"],
    proItems: ["Límites de uso justo más amplios", "Video 2K y 4K de calidad original", "Video y audio de larga duración", "Cola por lotes y prioridad"],
    faqKicker: "PREGUNTAS FRECUENTES",
    faqTitle: "Todo claro antes de descargar.",
    faqCopy: "Respuestas sobre enlaces compatibles, formatos, calidad, cuentas, privacidad y uso responsable de Pullvio.",
    faqSupport: "¿Tienes otra pregunta? Contáctanos",
    faqs: [
      ["¿Pullvio es gratis?", "Sí. Gratis incluye tres descargas diarias, MP4 hasta 1080p, audio MP3 y videos de hasta una hora."],
      ["¿Qué sitios y enlaces admite Pullvio?", "Pullvio funciona con enlaces públicos de fuentes compatibles como YouTube, TikTok, Vimeo, Twitch, SoundCloud y X. El contenido privado, con DRM, tras un inicio de sesión, de pago, en directo o retirado puede no estar disponible."],
      ["¿Qué formatos y calidades puedo descargar?", "Puedes guardar video en MP4 o extraer audio MP3. Gratis llega hasta 1080p; Pro permite elegir 2K o 4K cuando la fuente original ofrece realmente esa resolución."],
      ["¿Por qué no aparece la opción 2K o 4K?", "Pullvio no aumenta artificialmente la resolución. Si la subida original, el enlace actual o la plataforma no ofrecen esa calidad, la opción no se mostrará."],
      ["¿Puedo descargar solo el audio?", "Sí. Cambia al modo Audio para crear un MP3 de entrevistas, clases, pódcasts o música propia que tengas derecho a guardar."],
      ["¿Hay un límite de duración?", "Gratis admite videos de hasta una hora. Pro está pensado para video y audio de larga duración dentro de límites de uso justo; los archivos muy largos o pesados tardan más."],
      ["¿Puedo procesar varios enlaces a la vez?", "Sí. Pro añade una cola por lotes y procesamiento prioritario para creadores y equipos que organizan varios contenidos autorizados."],
      ["¿Necesito crear una cuenta?", "No para un uso gratuito ocasional. Una cuenta permite gestionar enlaces recientes, la cuenta y Pro; los usuarios Pro obtienen un historial más completo entre dispositivos."],
      ["¿Funciona en móvil y dónde se guardan los archivos?", "Sí, sin instalar una aplicación ni una extensión. Funciona en navegadores modernos de iPhone, Android, Mac y Windows; normalmente encontrarás el archivo en las descargas del navegador o del dispositivo."],
      ["¿Por qué falla o tarda un enlace?", "Puede deberse a que el enlace no sea público, tenga restricciones regionales o de edad, sea un directo sin finalizar, se haya retirado o la fuente limite temporalmente el acceso. La duración, la calidad y la cola también influyen."],
      ["¿Pullvio conserva mis enlaces o archivos?", "El archivo final se entrega a tu dispositivo y los archivos temporales se eliminan automáticamente. El historial de cuenta ayuda a gestionar enlaces de origen; consulta la Política de privacidad para conocer el alcance y la conservación."],
      ["¿Es legal descargar contenido con Pullvio?", "Depende del contenido, su licencia, las condiciones de la plataforma y la legislación local. Guarda solo obras propias, de dominio público, con licencia abierta o para las que tengas permiso o un derecho legal. Pullvio no sirve para eludir DRM ni controles de acceso."],
    ],
    footer: "Tu contenido. Guardado con cuidado.",
    legal: "Guarda únicamente contenido que tengas derecho a conservar.",
  },
} as const;

export type LocalizedLocale = keyof typeof localizedContent;

export const homeContent = {
  en: {
    nav: [["How it works", "#how"], ["Features", "#features"], ["Blog", "/blog"], ["Pricing", "#pricing"], ["FAQ", "#faq"]],
    signIn: "Sign in",
    getPro: "Get Pro",
    announcement: "Batch downloads are included with Pro",
    heroTitle: "Download videos online.",
    heroAccent: "Keep the original quality.",
    heroCopy: "Paste a public media link to save permitted content as MP4 or extract MP3 audio. Use HD for free, or unlock 4K, long-form media, and batch processing with Pro.",
    trustTitle: "Fast, private, and browser-based",
    trustCopy: "No install · no pop-ups · no fake buttons",
    supported: "SUPPORTED PLATFORMS",
    studio: {
      video: "Video", audio: "Audio", quota: "Free · 3 saves today", label: "Media link", placeholder: "Paste a public media link", submit: "Get media", loading: "Analyzing", error: "Enter a complete link beginning with http:// or https://", ready: "Ready to download", preview: "Video preview", download: "Download", legal: "Only save media you own or have permission to use.",
    },
    howKicker: "HOW IT WORKS", howTitle: "Download online videos in three simple steps.",
    steps: [["Paste a public link", "Copy the URL of media you own or are allowed to save, then paste it into Pullvio."], ["Choose MP4 or MP3", "Select video or audio, then choose the available quality that fits your device and purpose."], ["Download to your device", "Pullvio prepares the file and delivers it directly through your browser."]],
    featureKicker: "VIDEO & AUDIO DOWNLOADER", featureTitle: "A cleaner workspace for online media.", featureCopy: "Pullvio handles formats, quality, and file delivery so saving media stays simple on mobile and desktop.",
    features: [["Private by default", "Temporary processing files are deleted automatically and results are delivered to your device."], ["Original quality up to 4K", "When the source offers genuine 2K or 4K quality, Pro lets you select that resolution."], ["Simple MP4 and MP3", "Download video or extract audio without extensions, pop-ups, or confusing format codes."]],
    pricingKicker: "FREE & PRO", pricingTitle: "Start free. Upgrade when it becomes a workflow.", pricingCopy: "Free is designed for occasional saves. Pro adds 4K, long-form media, batch queues, and priority processing.",
    freeFor: "For occasional downloads", proFor: "For creators and frequent users", forever: "forever", monthly: "/ month", startFree: "Start free", popular: "MOST POPULAR",
    freeItems: ["3 video or audio downloads per day", "MP4 video up to 1080p HD", "MP3 audio extraction", "Videos up to 1 hour"],
    proItems: ["Generous fair-use limits", "Original-quality 2K and 4K video", "Long-form video and audio", "Batch queue and priority processing"],
    faqKicker: "FREQUENTLY ASKED QUESTIONS", faqTitle: "Know before you download.",
    faqCopy: "Clear answers about supported links, formats, quality, accounts, privacy, and responsible use of Pullvio.",
    faqSupport: "Still have a question? Contact us",
    faqs: [["Is Pullvio free to use?", "Yes. Free includes three daily downloads, MP4 up to 1080p, MP3 audio, and videos up to one hour."], ["Which sites and links does Pullvio support?", "Pullvio works with public media links from supported sources such as YouTube, TikTok, Vimeo, Twitch, SoundCloud, and X. Private, paywalled, DRM-protected, login-only, live, or removed content may be unavailable."], ["Which formats and video qualities can I download?", "Save video as MP4 or extract MP3 audio. Free supports up to 1080p; Pro can offer 2K or 4K when the original source genuinely provides that resolution."], ["Why is 2K or 4K sometimes unavailable?", "Pullvio does not artificially upscale media. If the original upload, current link, or source platform does not provide that resolution, the option will not appear."], ["Can I download audio only?", "Yes. Switch to Audio mode to create an MP3 from interviews, lessons, podcasts, or original music you have the right to save."], ["Is there a video length limit?", "Free supports videos up to one hour. Pro is designed for long-form video and audio within fair-use limits; very long or large files naturally take longer to process."], ["Can I process several links at once?", "Yes. Pro adds a batch queue and priority processing for creators and teams organizing multiple authorized media links."], ["Do I need an account?", "Not for occasional free use. An account lets you manage recent links, account settings, and Pro; Pro members receive a more complete cross-device history."], ["Does Pullvio work on mobile, and where are files saved?", "Yes, with no app or browser extension required. Use a modern iPhone, Android, Mac, or Windows browser; files normally appear in your browser downloads or device Downloads folder."], ["Why did a link fail or take longer than expected?", "Common causes include a non-public link, regional or age restrictions, an unfinished livestream, removed content, or temporary source limits. Media length, quality, and queue demand also affect processing time."], ["Does Pullvio keep my links or files?", "The finished file is delivered to your device and temporary processing files are deleted automatically. Account history helps you manage submitted source links; see the Privacy Policy for the exact scope and retention rules."], ["Is it legal to download online media with Pullvio?", "That depends on the content, its license, the source platform's terms, and local law. Only save your own work, public-domain or openly licensed media, or content you have permission or another legal right to keep. Pullvio is not intended to bypass DRM or access controls."]],
    footer: "Your media, saved beautifully.", legal: "Only save content you have the right to keep.",
  },
  ...localizedContent,
} as const satisfies Record<Locale, Record<string, unknown>>;

export const betaCopy = {
  en: {
    nav: [["Roadmap", "#roadmap"], ["Guides", "/guides"], ["About", "/about"], ["FAQ", "#faq"]],
    signIn: "Sign in", statusCta: "Launch status", eyebrow: "PUBLIC LAUNCH · LIVE WORLDWIDE",
    title: "A cleaner online media tool.", accent: "Now live for a global audience.",
    intro: "Pullvio is now live as a multilingual, browser-based home for MP4, MP3, video quality, and responsible media guides. Online media processing is the next product release.",
    trustTitle: "Live, multilingual, and transparent", trustCopy: "No pop-ups · practical guides · clear launch status",
    panelLabel: "LAUNCH STATUS", panelTitle: "The Pullvio website is live.", panelCopy: "The public site, localized guides, policies, and product foundation are available now. Browser-based media processing comes next.",
    panelItems: [["Global website", "Live"], ["Guides & policies", "Live"], ["Media processing", "Next release"], ["Pro plans", "Planned"]],
    panelButton: "Explore media guides", planned: "PRODUCT LAUNCH ROADMAP",
    guideCta: "Read guide",
    plannedItems: ["Browser-based", "MP4 & MP3", "Source quality", "Temporary processing", "Free entry tier"],
    principlesKicker: "PRODUCT PRINCIPLES", principlesTitle: "Clear from day one. Honest at every release.",
    principlesCopy: "A media tool earns trust by doing exactly what it says, explaining its limits, and respecting the people who created the source material.",
    principles: [["Permission before processing", "Pullvio is intended for your own uploads, public-domain and openly licensed works, or media you otherwise have the right to save."], ["Clear quality choices", "The future workflow will explain the difference between source resolution, file size, container format, and audio extraction without confusing format codes."], ["Temporary by design", "Processing and retention rules will be documented before the service goes live. Privacy claims will match the deployed infrastructure, not marketing assumptions."]],
    roadmapKicker: "DELIVERY ROADMAP", roadmapTitle: "Small releases, real capabilities.",
    roadmapCopy: "Each page and feature will become transactional only after its workflow works from link analysis through file delivery.",
    roadmap: [["LIVE", "Public website launch", "Responsive interface, multilingual SEO, policies, account access, and practical media guides."], ["NEXT", "Online media processing", "A limited browser workflow for permitted media, with honest source checks and useful error states."], ["LATER", "Accounts and Pro", "History, higher limits, long-form processing, batch queues, and billing after the core flow is reliable."]],
    guidesKicker: "LEARN BEFORE YOU SAVE", guidesTitle: "Practical media guides.", guidesCopy: "Understand formats, resolution, and permission before choosing a file.",
    guides: [["MP4 or MP3?", "Choose the format that matches viewing, listening, editing, and storage needs.", "/guides/mp4-vs-mp3"], ["Video resolution guide", "Compare 480p, 720p, 1080p, 2K, and 4K without assuming bigger is always better.", "/guides/video-resolution-guide"], ["Save media responsibly", "A practical checklist for ownership, permission, public-domain works, and open licenses.", "/guides/save-online-media-legally"]],
    faqKicker: "LAUNCH FAQ", faqTitle: "What can you use today?", faqs: [["What is live on Pullvio today?", "The public website, multilingual media guides, policies, and account interface are live now. Browser-based downloading and conversion will open in the next product release."], ["Can I buy Pullvio Pro?", "Not yet. No paid subscription is offered today, and the final price and limits have not been published."], ["Why launch before processing is ready?", "The public site gives global users useful format and quality guidance now while we complete and verify the processing workflow."], ["Which platforms will be supported?", "No platform support is promised yet. We will publish a dedicated page only after that source has been tested and the permitted workflow works reliably."], ["What content is Pullvio intended for?", "Your own uploads, public-domain and openly licensed works, and media you have permission or another legal right to save."]],
    footer: "A cleaner online media workspace, live worldwide.", legal: "Public website live. Media processing and paid plans are not yet available.",
  },
  "zh-cn": {
    nav: [["路线图", "#roadmap"], ["实用指南", "/guides"], ["关于我们", "/about"], ["常见问题", "#faq"]],
    signIn: "登录", statusCta: "上线状态", eyebrow: "正式上线 · 面向全球用户",
    title: "更干净的在线媒体工具。", accent: "现已面向全球上线。",
    intro: "Pullvio 官网现已正式上线，为全球用户提供 MP4、MP3、视频画质与负责任使用指南。浏览器在线媒体处理将在下一次产品发布中开放。",
    trustTitle: "正式上线，多语言，状态透明", trustCopy: "没有弹窗 · 实用指南 · 清晰说明功能进度",
    panelLabel: "上线状态", panelTitle: "Pullvio 官网已正式上线。", panelCopy: "公开网站、多语言指南、政策与产品基础已经开放。浏览器媒体处理功能将在下一次发布中上线。",
    panelItems: [["全球官网", "已上线"], ["指南与政策", "已上线"], ["媒体处理", "下一版本"], ["Pro 方案", "规划中"]],
    panelButton: "浏览媒体指南", planned: "产品上线路线",
    guideCta: "阅读指南",
    plannedItems: ["浏览器直接使用", "MP4 与 MP3", "尊重源画质", "临时文件处理", "免费入门层"],
    principlesKicker: "产品原则", principlesTitle: "从上线第一天开始清晰，每次发布都保持诚实。",
    principlesCopy: "媒体工具只有言行一致、解释限制并尊重内容创作者，才能获得长期信任。",
    principles: [["获得授权再处理", "Pullvio 面向您自己的上传、公共领域或开放许可作品，以及您拥有其他合法保存权利的媒体。"], ["清晰解释画质", "未来的工作流会说明源分辨率、文件大小、容器格式和音频提取之间的区别，不让用户面对复杂格式代码。"], ["默认临时处理", "正式开放前会公布文件处理和保留规则。隐私文案必须与实际部署的基础设施一致。"]],
    roadmapKicker: "开发路线", roadmapTitle: "小步发布，每一步都真实可用。",
    roadmapCopy: "只有当链接分析到文件交付的流程真正跑通后，对应页面和功能才会正式开放。",
    roadmap: [["已上线", "公开网站", "响应式界面、多语言 SEO、政策页面、账户入口与实用媒体指南。"], ["下一步", "在线媒体处理", "为获得授权的媒体提供浏览器流程，包括真实来源检查和明确错误提示。"], ["以后", "账户与 Pro", "核心流程稳定后再加入历史、更高额度、长视频、批量队列和付费。"]],
    guidesKicker: "保存之前先了解", guidesTitle: "实用媒体指南。", guidesCopy: "在选择文件前，先理解格式、分辨率与使用许可。",
    guides: [["MP4 还是 MP3？", "根据观看、收听、编辑和存储需求选择正确格式。", "/guides/mp4-vs-mp3"], ["视频分辨率指南", "比较 480p、720p、1080p、2K 和 4K，画质并非越大越好。", "/guides/video-resolution-guide"], ["负责任地保存媒体", "了解所有权、许可、公共领域作品和开放许可证。", "/guides/save-online-media-legally"]],
    faqKicker: "上线常见问题", faqTitle: "今天可以使用什么？", faqs: [["Pullvio 今天已经上线了什么？", "公开官网、多语言媒体指南、政策和账户界面均已上线。浏览器下载与转换功能将在下一次产品发布中开放。"], ["现在可以买 Pro 吗？", "暂时不能。当前没有出售付费订阅，最终价格和额度也尚未发布。"], ["为什么媒体处理完成前先上线官网？", "全球用户现在就可以使用格式、画质与授权指南，同时我们继续完成并验证真实媒体处理流程。"], ["将支持哪些平台？", "目前不承诺具体平台。只有当相应来源经过测试且合法工作流稳定后，才会发布专属页面。"], ["Pullvio 计划处理哪些内容？", "您自己的上传、公共领域或开放许可作品，以及您获得许可或拥有其他合法保存权利的媒体。"]],
    footer: "面向全球上线的在线媒体工作区。", legal: "官网已上线；媒体处理与付费方案暂未开放。",
  },
  es: {
    nav: [["Hoja de ruta", "#roadmap"], ["Guías", "/guides"], ["Nosotros", "/about"], ["Preguntas", "#faq"]],
    signIn: "Iniciar sesión", statusCta: "Estado del lanzamiento", eyebrow: "LANZAMIENTO PÚBLICO · DISPONIBLE GLOBALMENTE",
    title: "Una herramienta multimedia más limpia.", accent: "Ya disponible para una audiencia global.",
    intro: "Pullvio ya está disponible como espacio multilingüe para guías sobre MP4, MP3, calidad de video y uso responsable. El procesamiento multimedia online llegará en la próxima versión.",
    trustTitle: "Disponible, multilingüe y transparente", trustCopy: "Sin ventanas emergentes · guías prácticas · estado claro",
    panelLabel: "ESTADO DEL LANZAMIENTO", panelTitle: "El sitio de Pullvio ya está disponible.", panelCopy: "El sitio público, las guías localizadas, las políticas y la base del producto están disponibles. El procesamiento desde el navegador viene después.",
    panelItems: [["Sitio global", "Disponible"], ["Guías y políticas", "Disponibles"], ["Procesamiento", "Próxima versión"], ["Planes Pro", "Planificados"]],
    panelButton: "Explorar las guías", planned: "HOJA DE RUTA DEL LANZAMIENTO",
    guideCta: "Leer guía",
    plannedItems: ["Desde el navegador", "MP4 y MP3", "Calidad de origen", "Procesamiento temporal", "Nivel gratuito"],
    principlesKicker: "PRINCIPIOS", principlesTitle: "Útil primero. Honesto siempre.", principlesCopy: "Una herramienta multimedia merece confianza cuando cumple lo que promete, explica sus límites y respeta a los creadores.",
    principles: [["Permiso antes de procesar", "Pullvio está pensado para tus archivos, obras de dominio público o con licencia abierta y contenido que tengas derecho a guardar."], ["Opciones de calidad claras", "El futuro flujo explicará resolución, tamaño, formato y extracción de audio sin códigos confusos."], ["Temporal por diseño", "Las reglas de procesamiento y retención se publicarán antes de activar esa función y reflejarán la infraestructura real."]],
    roadmapKicker: "HOJA DE RUTA", roadmapTitle: "Entregas pequeñas, funciones reales.", roadmapCopy: "Cada página será transaccional solo cuando su flujo funcione desde el análisis hasta la entrega.",
    roadmap: [["DISPONIBLE", "Lanzamiento del sitio público", "Interfaz adaptable, SEO multilingüe, políticas, acceso a cuenta y guías prácticas."], ["DESPUÉS", "Procesamiento multimedia online", "Un flujo desde el navegador para contenido permitido, con comprobaciones y errores claros."], ["MÁS ADELANTE", "Cuentas y Pro", "Historial, límites superiores, lotes y pagos solo cuando el flujo principal sea fiable."]],
    guidesKicker: "APRENDE ANTES DE GUARDAR", guidesTitle: "Guías multimedia prácticas.", guidesCopy: "Comprende formatos, resolución y permisos antes de elegir un archivo.",
    guides: [["¿MP4 o MP3?", "Elige según tus necesidades de reproducción, escucha, edición y espacio.", "/guides/mp4-vs-mp3"], ["Guía de resolución", "Compara 480p, 720p, 1080p, 2K y 4K sin asumir que más siempre es mejor.", "/guides/video-resolution-guide"], ["Guarda contenido responsablemente", "Una lista práctica sobre propiedad, permisos, dominio público y licencias abiertas.", "/guides/save-online-media-legally"]],
    faqKicker: "PREGUNTAS DEL LANZAMIENTO", faqTitle: "¿Qué puedes usar hoy?", faqs: [["¿Qué está disponible hoy en Pullvio?", "El sitio público, las guías multilingües, las políticas y la interfaz de cuenta ya están disponibles. Las descargas y conversiones desde el navegador llegarán en la próxima versión."], ["¿Puedo comprar Pro?", "Todavía no. No se ofrecen suscripciones y el precio final no está publicado."], ["¿Por qué lanzar antes del procesamiento?", "Los usuarios globales ya pueden consultar guías de formatos, calidad y permisos mientras completamos y verificamos el flujo real."], ["¿Qué plataformas serán compatibles?", "Aún no prometemos ninguna. Publicaremos una página específica solo después de probar el origen y su flujo permitido."], ["¿Para qué contenido está pensado Pullvio?", "Tus archivos, obras de dominio público o licencia abierta y contenido que tengas permiso o derecho legal para guardar."]],
    footer: "Un espacio multimedia más limpio, disponible globalmente.", legal: "El sitio está disponible; el procesamiento y los planes de pago todavía no.",
  },
} as const satisfies Record<Locale, Record<string, unknown>>;
