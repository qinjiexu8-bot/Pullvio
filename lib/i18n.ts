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
  "/tiktok-video-downloader",
  "/vimeo-video-downloader",
  "/soundcloud-downloader",
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
    title: "Free Online Video Downloader - Download MP4 & MP3 | Pullvio",
    description:
      "Easily download public videos from URLs to MP4, convert links to MP3, and keep original quality up to 4K. Pullvio works directly in your browser without any installation.",
    keywords: ["online video downloader", "download video from link", "link to mp4 converter", "extract audio from video", "free video downloader"],
  },
  "zh-cn": {
    title: "在线视频下载器 - 网页视频链接转 MP4/MP3 工具 | Pullvio",
    description:
      "免费的网页视频在线下载工具。支持粘贴视频链接直接导出 MP4 视频或提取无损 MP3 音频，保留最高 4K 原始画质。手机与电脑浏览器即开即用。",
    keywords: ["在线视频下载器", "网页视频下载", "视频链接下载", "视频转MP3", "链接转MP4", "在线视频提取"],
  },
  es: {
    title: "Descargador de Videos Online Gratis - MP4 y MP3 | Pullvio",
    description:
      "Descarga videos públicos desde un enlace a MP4, extrae audio MP3 y conserva la calidad original hasta 4K. Pullvio funciona gratis en tu navegador móvil y de escritorio.",
    keywords: ["descargador de videos online", "bajar videos gratis", "convertir video a mp3", "descargar mp4 de enlace", "descargador de videos gratis"],
  },
} satisfies Record<Locale, { title: string; description: string; keywords: string[] }>;

export const localizedContent = {
  "zh-cn": {
    nav: [
      ["使用方法", "#how"],
      ["产品功能", "#features"],
      ["博客", "/blog"],
      ["免费使用", "#pricing"],
      ["常见问题", "#faq"],
    ],
    signIn: "登录",
    getPro: "开始下载",
    accountCta: "创建免费账号",
    announcement: "登录免费账号后，不设固定下载次数",
    heroTitle: "在线视频下载与格式转换。",
    heroAccent: "下载高清与 4K 视频。",
    heroCopy:
      "粘贴公开视频链接，将您拥有或获得授权的内容下载为 MP4，或者提取为 MP3 音频。无需登录可完成 5 次下载；登录免费账号后可在合理使用范围内继续下载。",
    trustTitle: "快速、私密、浏览器直接使用",
    trustCopy: "无需安装 · 没有弹窗 · 没有虚假按钮",
    supported: "平台专用下载工具",
    studio: {
      video: "视频",
      audio: "音频",
      quota: "访客 · 可免费下载 5 次",
      label: "媒体链接",
      placeholder: "粘贴公开媒体链接",
      submit: "获取媒体",
      loading: "正在解析",
      error: "请输入完整的 HTTPS 公开媒体链接",
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
    featureTitle: "更快速、纯净的浏览器在线视频下载器。",
    featureCopy: "Pullvio 负责格式、画质与文件交付，让手机和电脑上的下载过程保持简单。",
    features: [
      ["默认保护隐私", "临时处理文件会按计划自动删除，下载结果直接发送到您的设备。"],
      ["最高支持 4K 源画质", "当原始媒体确实提供 2K 或 4K 时，Pullvio 会显示可用的真实高分辨率选项。"],
      ["MP4 与 MP3", "无需浏览器扩展、弹窗或复杂的格式代码，即可下载视频或提取音频。"],
    ],
    pricingKicker: "免费使用",
    pricingTitle: "不登录可以直接使用，登录后继续免费下载。",
    pricingCopy: "访客无需注册即可完成 5 次下载。创建免费账号后不设固定下载次数，并可管理下载记录；所有使用均受合理使用与安全限制约束。",
    guestLabel: "访客",
    accountLabel: "免费账号",
    freeFor: "无需注册即可体验",
    proFor: "适合经常使用",
    forever: "永久免费",
    monthly: "永久免费",
    startFree: "立即下载",
    popular: "推荐",
    freeItems: ["无需账号可完成 5 次下载", "支持 MP4 视频与 MP3 音频", "来源提供时可选择最高 4K", "手机和电脑浏览器直接使用"],
    proItems: ["不设固定下载次数", "保存跨设备下载记录", "使用最高可用源画质", "受合理使用与安全限制保护"],
    faqKicker: "常见问题",
    faqTitle: "使用前，先把问题说清楚。",
    faqCopy: "从支持的链接、格式与画质，到账号、隐私和合法使用，这里汇总了使用 Pullvio 时最常见的问题。",
    faqSupport: "还有问题？联系我们",
    faqs: [
      ["Pullvio 可以免费使用吗？", "可以。无需登录即可完成 5 次下载；创建免费账号后不设固定下载次数，但仍需遵守合理使用、安全和来源限制。"],
      ["Pullvio 支持哪些网站和链接？", "当前支持 TikTok 与 Vimeo 公开视频直达链接，以及 SoundCloud 公开音轨直达链接。私人内容、播放列表、付费墙、DRM、登录后内容、直播或已下架内容可能无法处理。"],
      ["可以下载哪些格式和画质？", "视频可保存为 MP4，音频可提取为 MP3。可用画质取决于原始媒体；来源确实提供时可以选择 2K 或 4K。"],
      ["为什么有时看不到 2K 或 4K？", "Pullvio 不会凭空放大画质。如果原始上传、当前链接或来源平台没有提供对应分辨率，该选项就不会出现。"],
      ["可以只提取视频中的音频吗？", "可以。切换到音频模式即可生成 MP3，适合保存您有权使用的访谈、课程、播客或原创音乐内容。"],
      ["视频长度有限制吗？", "可处理时长取决于来源、文件大小和当前服务容量。较长或较大的文件需要更多处理时间，也可能触发合理使用限制。"],
      ["可以一次处理多个链接吗？", "当前流程每次处理一个链接，以便清楚确认来源、格式和下载结果。完成后可以继续提交下一个链接。"],
      ["需要注册账号吗？", "前 5 次下载无需账号。创建免费账号后可在合理使用范围内继续下载，并管理近期链接和账户设置。"],
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
      ["Acceso gratis", "#pricing"],
      ["Preguntas", "#faq"],
    ],
    signIn: "Iniciar sesión",
    getPro: "Empezar a descargar",
    accountCta: "Crear cuenta gratis",
    announcement: "Sin límite fijo con una cuenta gratuita",
    heroTitle: "Descarga videos online.",
    heroAccent: "Descarga videos en HD y 4K.",
    heroCopy:
      "Pega un enlace público para descargar contenido autorizado en MP4 o extraer audio MP3. Haz cinco descargas sin iniciar sesión o crea una cuenta gratuita para continuar dentro de un uso razonable.",
    trustTitle: "Rápido, privado y desde el navegador",
    trustCopy: "Sin instalar · sin ventanas emergentes · sin botones falsos",
    supported: "Herramientas por plataforma",
    studio: {
      video: "Video",
      audio: "Audio",
      quota: "Invitado · 5 descargas gratis",
      label: "Enlace del contenido",
      placeholder: "Pega un enlace público",
      submit: "Obtener contenido",
      loading: "Analizando",
      error: "Introduce un enlace multimedia público HTTPS completo",
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
      ["Calidad original hasta 4K", "Cuando la fuente ofrece 2K o 4K reales, Pullvio muestra esas resoluciones disponibles."],
      ["MP4 y MP3 sin complicaciones", "Descarga video o extrae audio sin extensiones, anuncios, ventanas emergentes ni códigos de formato."],
    ],
    pricingKicker: "ACCESO GRATUITO",
    pricingTitle: "Descarga sin cuenta o inicia sesión para seguir gratis.",
    pricingCopy: "Los visitantes pueden completar cinco descargas sin registrarse. Una cuenta gratuita no tiene un límite fijo e incluye historial, siempre sujeto a uso razonable y seguridad.",
    guestLabel: "INVITADO",
    accountLabel: "CUENTA GRATUITA",
    freeFor: "Prueba sin registrarte",
    proFor: "Para uso habitual",
    forever: "para siempre",
    monthly: "siempre gratis",
    startFree: "Descargar ahora",
    popular: "RECOMENDADO",
    freeItems: ["Cinco descargas sin crear una cuenta", "Video MP4 y audio MP3", "Hasta 4K cuando la fuente lo ofrece", "Funciona en móvil y ordenador"],
    proItems: ["Sin un límite fijo de descargas", "Historial entre dispositivos", "Máxima calidad disponible en la fuente", "Protección mediante límites de uso razonable"],
    faqKicker: "PREGUNTAS FRECUENTES",
    faqTitle: "Todo claro antes de descargar.",
    faqCopy: "Respuestas sobre enlaces compatibles, formatos, calidad, cuentas, privacidad y uso responsable de Pullvio.",
    faqSupport: "¿Tienes otra pregunta? Contáctanos",
    faqs: [
      ["¿Pullvio es gratis?", "Sí. Puedes completar cinco descargas sin iniciar sesión. Una cuenta gratuita no tiene un límite fijo, pero sigue sujeta a uso razonable, seguridad y disponibilidad de la fuente."],
      ["¿Qué sitios y enlaces admite Pullvio?", "Actualmente admite videos públicos de TikTok y Vimeo, además de pistas públicas de SoundCloud. El contenido privado, las listas, el DRM, el pago, la sesión, los directos o el contenido retirado pueden no estar disponibles."],
      ["¿Qué formatos y calidades puedo descargar?", "Puedes guardar video en MP4 o extraer audio MP3. La calidad depende de la fuente; 2K o 4K solo aparecen cuando el original ofrece realmente esa resolución."],
      ["¿Por qué no aparece la opción 2K o 4K?", "Pullvio no aumenta artificialmente la resolución. Si la subida original, el enlace actual o la plataforma no ofrecen esa calidad, la opción no se mostrará."],
      ["¿Puedo descargar solo el audio?", "Sí. Cambia al modo Audio para crear un MP3 de entrevistas, clases, pódcasts o música propia que tengas derecho a guardar."],
      ["¿Hay un límite de duración?", "La disponibilidad depende de la fuente, el tamaño del archivo y la capacidad actual. Los archivos muy largos tardan más y pueden activar límites de uso razonable."],
      ["¿Puedo procesar varios enlaces a la vez?", "El flujo actual procesa un enlace cada vez para confirmar claramente la fuente, el formato y el resultado. Puedes enviar el siguiente al terminar."],
      ["¿Necesito crear una cuenta?", "No para las primeras cinco descargas. Una cuenta gratuita permite seguir descargando dentro de un uso razonable y conservar enlaces recientes y preferencias."],
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
    nav: [["How it works", "#how"], ["Features", "#features"], ["Blog", "/blog"], ["Free access", "#pricing"], ["FAQ", "#faq"]],
    signIn: "Sign in",
    getPro: "Start downloading",
    accountCta: "Create free account",
    announcement: "No fixed download cap with a free account",
    heroTitle: "Free online video downloader.",
    heroAccent: "Download videos in HD and 4K.",
    heroCopy: "Paste a public media link to download authorized content as MP4 or extract MP3 audio. Complete five downloads without signing in, or create a free account to continue within fair-use limits.",
    trustTitle: "Fast, private, and browser-based",
    trustCopy: "No install · no pop-ups · no fake buttons",
    supported: "PLATFORM-SPECIFIC DOWNLOADERS",
    studio: {
      video: "Video", audio: "Audio", quota: "Guest · 5 free downloads", label: "Media link", placeholder: "Paste a public media link", submit: "Get media", loading: "Analyzing", error: "Enter a complete public HTTPS media link", ready: "Ready to download", preview: "Video preview", download: "Download", legal: "Only save media you own or have permission to use.",
    },
    howKicker: "HOW IT WORKS", howTitle: "Download online videos in three simple steps.",
    steps: [["Paste a public link", "Copy the URL of media you own or are allowed to save, then paste it into Pullvio."], ["Choose MP4 or MP3", "Select video or audio, then choose the available quality that fits your device and purpose."], ["Download to your device", "Pullvio prepares the file and delivers it directly through your browser."]],
    featureKicker: "VIDEO & AUDIO DOWNLOADER", featureTitle: "A fast & clean browser-based video downloader.", featureCopy: "Pullvio handles formats, quality, and file delivery so saving media stays simple on mobile and desktop.",
    features: [["Private by default", "Temporary processing files are deleted automatically and results are delivered to your device."], ["Original quality up to 4K", "When the source offers genuine 2K or 4K quality, Pullvio shows that available resolution."], ["Simple MP4 and MP3", "Download video or extract audio without extensions, pop-ups, or confusing format codes."]],
    pricingKicker: "FREE ACCESS", pricingTitle: "Download without an account, or sign in to keep going free.", pricingCopy: "Guests can complete five downloads without registering. A free account has no fixed download cap and includes history, subject to fair-use and security limits.",
    guestLabel: "GUEST", accountLabel: "FREE ACCOUNT", freeFor: "Try it without registering", proFor: "For regular use", forever: "free", monthly: "free forever", startFree: "Download now", popular: "RECOMMENDED",
    freeItems: ["Five downloads without an account", "MP4 video and MP3 audio", "Up to 4K when the source provides it", "Works on mobile and desktop"],
    proItems: ["No fixed download cap", "Cross-device download history", "Highest available source quality", "Protected by fair-use and security limits"],
    faqKicker: "FREQUENTLY ASKED QUESTIONS", faqTitle: "Know before you download.",
    faqCopy: "Clear answers about supported links, formats, quality, accounts, privacy, and responsible use of Pullvio.",
    faqSupport: "Still have a question? Contact us",
    faqs: [["Is Pullvio free to use?", "Yes. You can complete five downloads without signing in. A free account has no fixed download cap, but fair-use, security, and source-availability limits still apply."], ["Which sites and links does Pullvio support?", "Pullvio currently supports direct public TikTok and Vimeo video links plus direct public SoundCloud track links. Private media, playlists, paywalls, DRM, login-only sources, live content, or removed media may be unavailable."], ["Which formats and video qualities can I download?", "Save video as MP4 or extract MP3 audio. Available quality depends on the source; 2K or 4K appears only when the original genuinely provides that resolution."], ["Why is 2K or 4K sometimes unavailable?", "Pullvio does not artificially upscale media. If the original upload, current link, or source platform does not provide that resolution, the option will not appear."], ["Can I download audio only?", "Yes. Switch to Audio mode to create an MP3 from interviews, lessons, podcasts, or original music you have the right to save."], ["Is there a video length limit?", "Availability depends on the source, file size, and current service capacity. Very long or large files take longer and may trigger fair-use limits."], ["Can I process several links at once?", "The current workflow processes one link at a time so you can confirm the source, format, and result clearly. Submit the next link after the first finishes."], ["Do I need an account?", "Not for the first five downloads. A free account lets you continue within fair-use limits and manage recent links and account preferences."], ["Does Pullvio work on mobile, and where are files saved?", "Yes, with no app or browser extension required. Use a modern iPhone, Android, Mac, or Windows browser; files normally appear in your browser downloads or device Downloads folder."], ["Why did a link fail or take longer than expected?", "Common causes include a non-public link, regional or age restrictions, an unfinished livestream, removed content, or temporary source limits. Media length, quality, and current demand also affect processing time."], ["Does Pullvio keep my links or files?", "The finished file is delivered to your device and temporary processing files are deleted automatically. Account history helps you manage submitted source links; see the Privacy Policy for the exact scope and retention rules."], ["Is it legal to download online media with Pullvio?", "That depends on the content, its license, the source platform's terms, and local law. Only save your own work, public-domain or openly licensed media, or content you have permission or another legal right to keep. Pullvio is not intended to bypass DRM or access controls."]],
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
