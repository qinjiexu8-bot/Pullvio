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
  "/guides",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/account",
]);

/**
 * Returns a real route for the selected language. Content and policy pages are
 * English-only in the current beta, so switching language there goes to that
 * language's homepage instead of manufacturing a URL that resolves to 404.
 */
export function languageSwitchPath(locale: Locale, currentPath: string): string {
  const normalized = currentPath === "" ? "/" : currentPath.replace(/\/$/, "") || "/";
  if (localizedRoutes.has(normalized) || normalized.startsWith("/guides/")) return localePath(locale, normalized);
  return locale === "en" ? normalized : localePath(locale);
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : "en";
}

export const seo = {
  en: {
    title: "Pullvio Private Beta | A Cleaner Online Media Tool",
    description:
      "Follow the Pullvio private beta as we build a cleaner browser-based media tool for permitted MP4 and MP3 workflows. Read practical format and quality guides.",
    keywords: ["online media tool", "MP4 and MP3 guide", "video quality guide", "Pullvio beta"],
  },
  "zh-cn": {
    title: "Pullvio 内测版 | 更干净的在线媒体工具",
    description:
      "关注 Pullvio 内测进度。我们正在打造一款用于合法媒体工作流的浏览器工具，并提供 MP4、MP3 与视频画质实用指南。",
    keywords: ["在线媒体工具", "MP4 MP3 指南", "视频画质指南", "Pullvio 内测"],
  },
  es: {
    title: "Pullvio Beta Privada | Herramienta Multimedia Online",
    description:
      "Sigue la beta privada de Pullvio, una herramienta multimedia para el navegador en desarrollo, y consulta guías prácticas sobre MP4, MP3 y calidad de video.",
    keywords: ["herramienta multimedia online", "guía MP4 MP3", "calidad de video", "Pullvio beta"],
  },
} satisfies Record<Locale, { title: string; description: string; keywords: string[] }>;

export const localizedContent = {
  "zh-cn": {
    nav: [
      ["使用方法", "#how"],
      ["产品功能", "#features"],
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
    faqTitle: "重要问题，直接回答。",
    faqs: [
      ["Pullvio 可以免费使用吗？", "可以。免费版每天提供 3 次下载，支持最高 1080p 的 MP4、MP3 音频以及最长 1 小时的视频。"],
      ["可以下载 4K 视频吗？", "可以，但原始媒体必须真正提供 2K 或 4K 画质，并且该功能属于 Pullvio Pro。"],
      ["Pullvio 会保存我的文件吗？", "文件会直接交付到您的设备，服务器上的临时处理文件会按计划自动删除。"],
      ["哪些内容可以下载？", "请仅下载您自己的作品、公共领域或 Creative Commons 内容，以及您拥有其他合法保存权利的媒体。"],
      ["手机上可以使用吗？", "可以。Pullvio 是响应式网页工具，可在现代 iPhone、Android、Mac 和 Windows 浏览器中使用。"],
    ],
    footer: "您的媒体，漂亮地保存下来。",
    legal: "请仅保存您有权保留的内容。",
  },
  es: {
    nav: [
      ["Cómo funciona", "#how"],
      ["Funciones", "#features"],
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
    faqTitle: "Respuestas claras a tus preguntas.",
    faqs: [
      ["¿Pullvio es gratis?", "Sí. Gratis incluye tres descargas diarias, MP4 hasta 1080p, audio MP3 y videos de hasta una hora."],
      ["¿Puedo descargar videos en 4K?", "Sí, con Pro y cuando el contenido original disponga realmente de calidad 2K o 4K."],
      ["¿Pullvio guarda mis archivos?", "El archivo se entrega a tu dispositivo y las copias temporales del procesamiento se eliminan automáticamente."],
      ["¿Qué contenido puedo descargar?", "Tus propios archivos, obras de dominio público o Creative Commons y contenido que tengas derecho legal a guardar."],
      ["¿Funciona en el móvil?", "Sí. Pullvio funciona en navegadores modernos de iPhone, Android, Mac y Windows sin instalar aplicaciones."],
    ],
    footer: "Tu contenido. Guardado con cuidado.",
    legal: "Guarda únicamente contenido que tengas derecho a conservar.",
  },
} as const;

export type LocalizedLocale = keyof typeof localizedContent;

export const betaCopy = {
  en: {
    nav: [["Roadmap", "#roadmap"], ["Guides", "/guides"], ["About", "/about"], ["FAQ", "#faq"]],
    signIn: "Sign in", statusCta: "Beta status", eyebrow: "PRIVATE BETA · BUILDING IN PUBLIC",
    title: "A cleaner online media tool.", accent: "Built with permission in mind.",
    intro: "Pullvio is being built as a private, browser-based workspace for permitted media. The processing service is not live yet; for now, explore the product principles, roadmap, and practical format guides.",
    trustTitle: "Truthful beta, no fake downloads", trustCopy: "No pop-ups · no simulated files · no payment yet",
    panelLabel: "CURRENT STATUS", panelTitle: "Frontend preview is live.", panelCopy: "We are validating the interface, policies, and media workflow before connecting processing infrastructure.",
    panelItems: [["Interface", "Ready for review"], ["Guides & policies", "Published"], ["Media processing", "In development"], ["Pro billing", "Not available"]],
    panelButton: "Read the guides", planned: "PLANNED PRODUCT DIRECTION",
    guideCta: "Read guide",
    plannedItems: ["Browser-based", "MP4 & MP3", "Source quality", "Temporary processing", "Free entry tier"],
    principlesKicker: "PRODUCT PRINCIPLES", principlesTitle: "Useful first. Honest at every stage.",
    principlesCopy: "A media tool earns trust by doing exactly what it says, explaining its limits, and respecting the people who created the source material.",
    principles: [["Permission before processing", "Pullvio is intended for your own uploads, public-domain and openly licensed works, or media you otherwise have the right to save."], ["Clear quality choices", "The future workflow will explain the difference between source resolution, file size, container format, and audio extraction without confusing format codes."], ["Temporary by design", "Processing and retention rules will be documented before the service goes live. Privacy claims will match the deployed infrastructure, not marketing assumptions."]],
    roadmapKicker: "DELIVERY ROADMAP", roadmapTitle: "Small releases, real capabilities.",
    roadmapCopy: "Each page and feature will become transactional only after its workflow works from link analysis through file delivery.",
    roadmap: [["NOW", "Private beta foundation", "Responsive interface, multilingual SEO, policies, account shell, and educational content."], ["NEXT", "One working media flow", "A limited free workflow for permitted media, with honest source checks and useful error states."], ["LATER", "Accounts and Pro", "History, higher limits, long-form processing, batch queues, and billing only after the core flow is reliable."]],
    guidesKicker: "LEARN BEFORE YOU SAVE", guidesTitle: "Practical media guides.", guidesCopy: "Understand formats, resolution, and permission before choosing a file.",
    guides: [["MP4 or MP3?", "Choose the format that matches viewing, listening, editing, and storage needs.", "/guides/mp4-vs-mp3"], ["Video resolution guide", "Compare 480p, 720p, 1080p, 2K, and 4K without assuming bigger is always better.", "/guides/video-resolution-guide"], ["Save media responsibly", "A practical checklist for ownership, permission, public-domain works, and open licenses.", "/guides/save-online-media-legally"]],
    faqKicker: "PRIVATE BETA FAQ", faqTitle: "What is live today?", faqs: [["Can Pullvio download a video today?", "No. This release is a frontend beta and content site. Media processing will be enabled only after a real end-to-end workflow is ready."], ["Can I buy Pullvio Pro?", "Not yet. No paid subscription is offered during this phase, and the final price and limits have not been published."], ["Why publish before processing is ready?", "Publishing the interface, policies, and guides early lets us validate clarity, accessibility, search demand, and trust before operating media infrastructure."], ["Which platforms will be supported?", "No platform support is promised yet. We will publish a dedicated page only after that source has been tested and the permitted workflow works reliably."], ["What content is Pullvio intended for?", "Your own uploads, public-domain and openly licensed works, and media you have permission or another legal right to save."]],
    footer: "A private media workspace, currently in beta.", legal: "No media processing or paid plan is live in this release.",
  },
  "zh-cn": {
    nav: [["路线图", "#roadmap"], ["实用指南", "/guides"], ["关于我们", "/about"], ["常见问题", "#faq"]],
    signIn: "登录", statusCta: "内测状态", eyebrow: "PRIVATE BETA · 公开构建中",
    title: "更干净的在线媒体工具。", accent: "从尊重授权开始。",
    intro: "Pullvio 正在被打造为一款私密、基于浏览器的合法媒体工作区。媒体处理服务目前尚未开放；您可以先了解产品原则、开发路线和格式指南。",
    trustTitle: "真实内测，不模拟下载", trustCopy: "没有弹窗 · 没有虚假文件 · 暂未收费",
    panelLabel: "当前状态", panelTitle: "前端预览已经开放。", panelCopy: "我们正在验证界面、政策和媒体工作流，然后才会连接真实处理基础设施。",
    panelItems: [["响应式界面", "可供体验"], ["指南与政策", "已经发布"], ["媒体处理", "开发中"], ["Pro 付费", "尚未开放"]],
    panelButton: "阅读实用指南", planned: "计划中的产品方向",
    guideCta: "阅读指南",
    plannedItems: ["浏览器直接使用", "MP4 与 MP3", "尊重源画质", "临时文件处理", "免费入门层"],
    principlesKicker: "产品原则", principlesTitle: "先做到有用，每个阶段都保持诚实。",
    principlesCopy: "媒体工具只有言行一致、解释限制并尊重内容创作者，才能获得长期信任。",
    principles: [["获得授权再处理", "Pullvio 面向您自己的上传、公共领域或开放许可作品，以及您拥有其他合法保存权利的媒体。"], ["清晰解释画质", "未来的工作流会说明源分辨率、文件大小、容器格式和音频提取之间的区别，不让用户面对复杂格式代码。"], ["默认临时处理", "正式开放前会公布文件处理和保留规则。隐私文案必须与实际部署的基础设施一致。"]],
    roadmapKicker: "开发路线", roadmapTitle: "小步发布，每一步都真实可用。",
    roadmapCopy: "只有当链接分析到文件交付的流程真正跑通后，对应页面和功能才会正式开放。",
    roadmap: [["现在", "内测基础", "响应式界面、多语言 SEO、政策页面、账户外壳与实用内容。"], ["下一步", "一个可用的媒体流程", "为获得授权的媒体提供有限免费流程，包括真实来源检查和明确错误提示。"], ["以后", "账户与 Pro", "核心流程稳定后再加入历史、更高额度、长视频、批量队列和付费。"]],
    guidesKicker: "保存之前先了解", guidesTitle: "实用媒体指南。", guidesCopy: "在选择文件前，先理解格式、分辨率与使用许可。",
    guides: [["MP4 还是 MP3？", "根据观看、收听、编辑和存储需求选择正确格式。", "/guides/mp4-vs-mp3"], ["视频分辨率指南", "比较 480p、720p、1080p、2K 和 4K，画质并非越大越好。", "/guides/video-resolution-guide"], ["负责任地保存媒体", "了解所有权、许可、公共领域作品和开放许可证。", "/guides/save-online-media-legally"]],
    faqKicker: "内测常见问题", faqTitle: "今天已经开放什么？", faqs: [["Pullvio 现在可以下载视频吗？", "还不可以。这一版本是前端内测与内容站，真实端到端流程完成后才会开放媒体处理。"], ["现在可以买 Pro 吗？", "暂时不能。这一阶段不出售付费订阅，最终价格和额度也尚未发布。"], ["为什么后端完成前就上线？", "提前发布界面、政策和指南，可以在运营媒体基础设施前验证清晰度、无障碍体验、搜索需求和用户信任。"], ["将支持哪些平台？", "目前不承诺具体平台。只有当相应来源经过测试且合法工作流稳定后，才会发布专属页面。"], ["Pullvio 计划处理哪些内容？", "您自己的上传、公共领域或开放许可作品，以及您获得许可或拥有其他合法保存权利的媒体。"]],
    footer: "正在内测中的私密媒体工作区。", legal: "当前版本尚未开放媒体处理或付费方案。",
  },
  es: {
    nav: [["Hoja de ruta", "#roadmap"], ["Guías", "/guides"], ["Nosotros", "/about"], ["Preguntas", "#faq"]],
    signIn: "Iniciar sesión", statusCta: "Estado beta", eyebrow: "BETA PRIVADA · DESARROLLO ABIERTO",
    title: "Una herramienta multimedia más limpia.", accent: "Creada pensando en los permisos.",
    intro: "Pullvio se está creando como un espacio privado en el navegador para contenido permitido. El procesamiento aún no está disponible; por ahora puedes conocer los principios, la hoja de ruta y nuestras guías.",
    trustTitle: "Beta real, sin descargas simuladas", trustCopy: "Sin ventanas emergentes · sin archivos falsos · sin pagos",
    panelLabel: "ESTADO ACTUAL", panelTitle: "La vista previa ya está disponible.", panelCopy: "Estamos validando la interfaz, las políticas y el flujo antes de conectar la infraestructura de procesamiento.",
    panelItems: [["Interfaz", "Lista para revisar"], ["Guías y políticas", "Publicadas"], ["Procesamiento", "En desarrollo"], ["Pagos Pro", "No disponibles"]],
    panelButton: "Leer las guías", planned: "DIRECCIÓN DEL PRODUCTO",
    guideCta: "Leer guía",
    plannedItems: ["Desde el navegador", "MP4 y MP3", "Calidad de origen", "Procesamiento temporal", "Nivel gratuito"],
    principlesKicker: "PRINCIPIOS", principlesTitle: "Útil primero. Honesto siempre.", principlesCopy: "Una herramienta multimedia merece confianza cuando cumple lo que promete, explica sus límites y respeta a los creadores.",
    principles: [["Permiso antes de procesar", "Pullvio está pensado para tus archivos, obras de dominio público o con licencia abierta y contenido que tengas derecho a guardar."], ["Opciones de calidad claras", "El futuro flujo explicará resolución, tamaño, formato y extracción de audio sin códigos confusos."], ["Temporal por diseño", "Las reglas de procesamiento y retención se publicarán antes del lanzamiento y reflejarán la infraestructura real."]],
    roadmapKicker: "HOJA DE RUTA", roadmapTitle: "Entregas pequeñas, funciones reales.", roadmapCopy: "Cada página será transaccional solo cuando su flujo funcione desde el análisis hasta la entrega.",
    roadmap: [["AHORA", "Base de la beta", "Interfaz adaptable, SEO multilingüe, políticas, cuenta y contenido educativo."], ["DESPUÉS", "Un flujo multimedia real", "Un proceso gratuito limitado para contenido permitido, con comprobaciones y errores claros."], ["MÁS ADELANTE", "Cuentas y Pro", "Historial, límites superiores, lotes y pagos solo cuando el flujo principal sea fiable."]],
    guidesKicker: "APRENDE ANTES DE GUARDAR", guidesTitle: "Guías multimedia prácticas.", guidesCopy: "Comprende formatos, resolución y permisos antes de elegir un archivo.",
    guides: [["¿MP4 o MP3?", "Elige según tus necesidades de reproducción, escucha, edición y espacio.", "/guides/mp4-vs-mp3"], ["Guía de resolución", "Compara 480p, 720p, 1080p, 2K y 4K sin asumir que más siempre es mejor.", "/guides/video-resolution-guide"], ["Guarda contenido responsablemente", "Una lista práctica sobre propiedad, permisos, dominio público y licencias abiertas.", "/guides/save-online-media-legally"]],
    faqKicker: "PREGUNTAS DE LA BETA", faqTitle: "¿Qué está disponible hoy?", faqs: [["¿Pullvio puede descargar videos hoy?", "No. Esta versión es una beta de interfaz y contenido. El procesamiento se activará cuando exista un flujo real de principio a fin."], ["¿Puedo comprar Pro?", "Todavía no. No se ofrecen suscripciones y el precio final no está publicado."], ["¿Por qué publicar antes del procesamiento?", "Nos permite validar claridad, accesibilidad, demanda y confianza antes de operar infraestructura multimedia."], ["¿Qué plataformas serán compatibles?", "Aún no prometemos ninguna. Publicaremos una página específica solo después de probar el origen y su flujo permitido."], ["¿Para qué contenido está pensado Pullvio?", "Tus archivos, obras de dominio público o licencia abierta y contenido que tengas permiso o derecho legal para guardar."]],
    footer: "Un espacio multimedia privado, actualmente en beta.", legal: "Esta versión no procesa archivos ni ofrece planes de pago.",
  },
} as const satisfies Record<Locale, Record<string, unknown>>;
