import type { Locale } from "./i18n";
import type { PlatformCopy, PlatformDefinition, PlatformSlug } from "./platform-tools";

type LocalDetails = {
  subject: string;
  accepted: string;
  excluded: string;
  useCase: string;
  quality: string;
};

type ExtendedPlatformConfig = {
  platform: string;
  searchName: string;
  relatedSlug: PlatformSlug;
  details: Record<Locale, LocalDetails>;
  keywords?: Record<Locale, string[]>;
};

const configs = {
  "instagram-video-downloader": {
    platform: "Instagram",
    searchName: "Instagram video",
    relatedSlug: "facebook-video-downloader",
    keywords: {
      en: ["instagram video downloader", "instagram reel downloader", "download instagram video", "instagram to mp4", "instagram to mp3", "instagram downloader online"],
      "zh-cn": ["Instagram视频下载器", "Instagram视频下载", "Instagram Reels下载", "Instagram转MP4", "Instagram转MP3"],
      es: ["descargador de videos de instagram", "descargar reels de instagram", "descargar video instagram", "instagram a mp4", "instagram a mp3"],
    },
    details: {
      en: { subject: "Instagram Reel, video post, or public Story", accepted: "a direct public Instagram Reel, video-post, or Story link", excluded: "profiles, private accounts, Highlights, image-only posts, login-only media, and expired Stories", useCase: "your own Reels, campaign drafts, creator-approved posts, and licensed social clips", quality: "the video rendition made available for that public Instagram item" },
      "zh-cn": { subject: "Instagram Reel、视频帖子或公开 Story", accepted: "Instagram Reel、视频帖子或公开 Story 的直达链接", excluded: "个人主页、私人账号、Highlights、纯图片帖子、登录后媒体和已过期 Story", useCase: "自己的 Reels、营销素材、创作者授权帖子和获得许可的社交短视频", quality: "该 Instagram 公开内容实际提供的视频版本" },
      es: { subject: "Reel, publicación de video o Story pública de Instagram", accepted: "un enlace directo a un Reel, video o Story pública de Instagram", excluded: "perfiles, cuentas privadas, Highlights, imágenes, contenido con sesión y Stories vencidas", useCase: "tus Reels, campañas, publicaciones autorizadas y clips con licencia", quality: "la versión de video disponible para ese contenido público de Instagram" },
    },
  },
  "facebook-video-downloader": {
    platform: "Facebook",
    searchName: "Facebook video",
    relatedSlug: "snapchat-video-downloader",
    keywords: {
      en: ["facebook video downloader", "facebook reel downloader", "download facebook video", "facebook to mp4", "facebook to mp3", "fb video downloader"],
      "zh-cn": ["Facebook视频下载器", "Facebook视频下载", "Facebook Reels下载", "Facebook转MP4", "Facebook转MP3"],
      es: ["descargador de videos de facebook", "descargar reels de facebook", "descargar video facebook", "facebook a mp4", "facebook a mp3"],
    },
    details: {
      en: { subject: "Facebook video or Reel", accepted: "a direct public Facebook video, Reel, Watch, share, or fb.watch link", excluded: "feeds, profiles, groups, private posts, login-only videos, active Live streams, paid media, and deleted posts", useCase: "your own Page videos, approved campaign assets, licensed clips, and creator-authorized Reels", quality: "the public video rendition Facebook makes available for that link" },
      "zh-cn": { subject: "Facebook 视频或 Reel", accepted: "Facebook 视频、Reel、Watch、Share 或 fb.watch 的公开直达链接", excluded: "信息流、个人主页、群组、私人帖子、登录后视频、直播、付费媒体和已删除内容", useCase: "自己的 Page 视频、获准营销素材、许可短片和创作者授权 Reels", quality: "Facebook 针对该公开链接实际提供的视频版本" },
      es: { subject: "video o Reel de Facebook", accepted: "un enlace directo público de video, Reel, Watch, compartido o fb.watch", excluded: "feeds, perfiles, grupos, posts privados, videos con sesión, Live activos, contenido de pago y posts eliminados", useCase: "tus videos de Página, campañas aprobadas, clips con licencia y Reels autorizados", quality: "la versión pública que Facebook ofrece para ese enlace" },
    },
  },
  "pinterest-video-downloader": {
    platform: "Pinterest",
    searchName: "Pinterest video",
    relatedSlug: "twitch-clip-downloader",
    details: {
      en: { subject: "Pinterest video Pin", accepted: "a direct public Pin containing a video", excluded: "boards, profiles, private Pins, and image-only Pins", useCase: "your own campaign drafts, tutorials, and licensed inspiration references", quality: "the MP4 rendition published with that Pin" },
      "zh-cn": { subject: "Pinterest 视频 Pin", accepted: "包含视频的公开 Pin 直达链接", excluded: "画板、个人主页、私人 Pin 和纯图片 Pin", useCase: "自己的营销素材、教程和获得许可的灵感参考", quality: "该 Pin 实际发布的 MP4 版本" },
      es: { subject: "Pin de video de Pinterest", accepted: "un Pin público directo que contenga video", excluded: "tableros, perfiles, Pines privados y Pines solo de imagen", useCase: "tus campañas, tutoriales y referencias con licencia", quality: "la versión MP4 publicada en el Pin" },
    },
  },
  "twitch-clip-downloader": {
    platform: "Twitch",
    searchName: "Twitch clip",
    relatedSlug: "dailymotion-video-downloader",
    details: {
      en: { subject: "Twitch Clip", accepted: "a direct public clips.twitch.tv or channel clip link", excluded: "live channels, full VODs, subscriber-only clips, and deleted clips", useCase: "clips from your own stream or highlights the creator permits you to archive", quality: "the clip's published MP4 resolution, including 1080p when available" },
      "zh-cn": { subject: "Twitch Clip", accepted: "公开的 clips.twitch.tv 或频道 Clip 直达链接", excluded: "直播频道、完整 VOD、订阅者专属和已删除片段", useCase: "自己的直播片段或创作者允许存档的高光", quality: "Clip 实际提供的 MP4 分辨率，来源具备时包括 1080p" },
      es: { subject: "Clip de Twitch", accepted: "un enlace público de clips.twitch.tv o de clip de canal", excluded: "directos, VOD completos, clips para suscriptores y clips eliminados", useCase: "clips de tu propia emisión o momentos que el creador permite archivar", quality: "la resolución MP4 publicada, incluido 1080p cuando exista" },
    },
  },
  "dailymotion-video-downloader": {
    platform: "Dailymotion",
    searchName: "Dailymotion video",
    relatedSlug: "streamable-video-downloader",
    details: {
      en: { subject: "Dailymotion video", accepted: "a direct public video or dai.ly link", excluded: "channels, playlists, private videos, paid media, and geo-blocked videos", useCase: "your uploads, licensed publisher material, and public-domain footage", quality: "the HLS or MP4 quality made available in your region" },
      "zh-cn": { subject: "Dailymotion 视频", accepted: "公开视频或 dai.ly 直达链接", excluded: "频道、播放列表、私人视频、付费和地区受限内容", useCase: "自己的上传、获得许可的发布素材和公共领域影像", quality: "当前地区实际提供的 HLS 或 MP4 画质" },
      es: { subject: "video de Dailymotion", accepted: "un enlace directo público o dai.ly", excluded: "canales, listas, videos privados, de pago o bloqueados por región", useCase: "tus subidas, material editorial con licencia y obras de dominio público", quality: "la calidad HLS o MP4 disponible en tu región" },
    },
  },
  "streamable-video-downloader": {
    platform: "Streamable",
    searchName: "Streamable video",
    relatedSlug: "snapchat-video-downloader",
    details: {
      en: { subject: "Streamable video", accepted: "one direct public Streamable video link", excluded: "account pages, private, deleted, expired, or password-protected videos", useCase: "short clips you uploaded or have permission to keep", quality: "the direct MP4 file supplied by Streamable" },
      "zh-cn": { subject: "Streamable 视频", accepted: "单个 Streamable 公共视频直达链接", excluded: "账号页面、私人、已删除、已过期或密码保护的视频", useCase: "自己上传或已获准保存的短视频", quality: "Streamable 实际提供的 MP4 文件" },
      es: { subject: "video de Streamable", accepted: "un enlace directo de video público", excluded: "páginas de cuenta y videos privados, eliminados, vencidos o con contraseña", useCase: "clips cortos propios o que tienes permiso para conservar", quality: "el archivo MP4 directo ofrecido por Streamable" },
    },
  },
  "snapchat-video-downloader": {
    platform: "Snapchat",
    searchName: "Snapchat Spotlight video",
    relatedSlug: "okru-video-downloader",
    keywords: {
      en: ["snapchat video downloader", "snapchat story downloader", "snapchat spotlight downloader", "download snapchat video", "snapchat to mp4", "snapchat to mp3"],
      "zh-cn": ["Snapchat视频下载器", "Snapchat视频下载", "Snapchat Story下载", "Snapchat Spotlight下载", "Snapchat转MP4", "Snapchat转MP3"],
      es: ["descargador de videos de snapchat", "descargar stories de snapchat", "descargador de snapchat spotlight", "descargar video snapchat", "snapchat a mp4", "snapchat a mp3"],
    },
    details: {
      en: { subject: "Snapchat Spotlight video or public Story", accepted: "a direct public Snapchat Spotlight or Story link", excluded: "profiles, chat media, private Snaps, friends-only Stories, expired Stories, and deleted posts", useCase: "your own Spotlight uploads, public Stories, or posts the creator authorizes you to save", quality: "the public video rendition available for that Snapchat item" },
      "zh-cn": { subject: "Snapchat Spotlight 视频或公开 Story", accepted: "公开 Snapchat Spotlight 或 Story 直达链接", excluded: "个人主页、聊天媒体、私人 Snap、仅好友 Story、已过期 Story 和已删除内容", useCase: "自己的 Spotlight、公开 Story 或创作者授权保存的帖子", quality: "该 Snapchat 公开内容当前实际提供的视频版本" },
      es: { subject: "video Spotlight o Story pública de Snapchat", accepted: "un enlace directo público de Spotlight o Story", excluded: "perfiles, chats, Snaps privados, Stories para amigos, vencidas y posts eliminados", useCase: "tus Spotlight, Stories públicas o posts autorizados por el creador", quality: "la versión pública disponible para ese contenido de Snapchat" },
    },
  },
  "okru-video-downloader": {
    platform: "OK.ru",
    searchName: "OK.ru video",
    relatedSlug: "instagram-video-downloader",
    keywords: {
      en: ["okru video downloader", "ok.ru video downloader", "download ok.ru video", "okru to mp4", "okru to mp3", "odnoklassniki video downloader"],
      "zh-cn": ["OKRU视频下载器", "OK.ru视频下载", "Odnoklassniki视频下载", "OKRU转MP4", "OKRU转MP3"],
      es: ["descargador de videos de okru", "descargar video de ok.ru", "descargador de odnoklassniki", "okru a mp4", "okru a mp3"],
    },
    details: {
      en: { subject: "OK.ru (Odnoklassniki) video", accepted: "a direct public OK.ru video or videoembed link", excluded: "profiles, group feeds, private videos, login-only media, paid content, active Live streams, and deleted videos", useCase: "your own OK.ru uploads, public-domain footage, licensed videos, and creator-approved posts", quality: "the public video rendition OK.ru provides for that item" },
      "zh-cn": { subject: "OK.ru（Odnoklassniki）视频", accepted: "OK.ru Video 或 Videoembed 的公开直达链接", excluded: "个人主页、群组信息流、私人视频、登录后媒体、付费内容、直播和已删除视频", useCase: "自己的 OK.ru 上传、公共领域影像、许可视频和创作者授权帖子", quality: "OK.ru 针对该公开内容实际提供的视频版本" },
      es: { subject: "video de OK.ru (Odnoklassniki)", accepted: "un enlace directo público de video o videoembed de OK.ru", excluded: "perfiles, feeds de grupos, videos privados, contenido con sesión o de pago, Live activos y videos eliminados", useCase: "tus subidas a OK.ru, dominio público, videos con licencia y posts autorizados", quality: "la versión pública que OK.ru ofrece para ese contenido" },
    },
  },
  "imgur-video-downloader": {
    platform: "Imgur",
    searchName: "Imgur video",
    relatedSlug: "loom-video-downloader",
    details: {
      en: { subject: "Imgur video or GIFV", accepted: "one public Imgur video, MP4, or GIFV link", excluded: "albums, galleries, image-only posts, private posts, and deleted media", useCase: "animations and short videos you created or are allowed to archive", quality: "the MP4 rendition behind the public video or GIFV" },
      "zh-cn": { subject: "Imgur 视频或 GIFV", accepted: "单个公开 Imgur 视频、MP4 或 GIFV 链接", excluded: "相册、图库、纯图片、私人帖子和已删除媒体", useCase: "自己创作或获准存档的动画与短视频", quality: "公开 Video 或 GIFV 背后的实际 MP4 版本" },
      es: { subject: "video o GIFV de Imgur", accepted: "un enlace público individual de video, MP4 o GIFV", excluded: "álbumes, galerías, imágenes, posts privados y contenido eliminado", useCase: "animaciones y videos propios o autorizados", quality: "la versión MP4 del video o GIFV público" },
    },
  },
  "loom-video-downloader": {
    platform: "Loom",
    searchName: "Loom video",
    relatedSlug: "dropbox-video-downloader",
    details: {
      en: { subject: "Loom video", accepted: "a direct public Loom share link", excluded: "workspace, edit, private, password-protected, and sign-in-only recordings", useCase: "your own walkthroughs, meetings, lessons, and product demonstrations", quality: "the HLS/MP4 rendition available on the public share page" },
      "zh-cn": { subject: "Loom 视频", accepted: "公开 Loom Share 直达链接", excluded: "工作区、编辑、私人、密码保护和登录后录像", useCase: "自己的操作演示、会议、课程和产品讲解", quality: "公开分享页实际提供的 HLS/MP4 版本" },
      es: { subject: "video de Loom", accepted: "un enlace directo de uso compartido público", excluded: "espacios, edición, grabaciones privadas, con contraseña o inicio de sesión", useCase: "tus tutoriales, reuniones, clases y demostraciones", quality: "la versión HLS/MP4 disponible en la página pública" },
    },
  },
  "dropbox-video-downloader": {
    platform: "Dropbox",
    searchName: "Dropbox video",
    relatedSlug: "pinterest-video-downloader",
    details: {
      en: { subject: "Dropbox video", accepted: "a direct public Dropbox file share for one video", excluded: "folders, private shares, sign-in-only files, passwords, and non-video files", useCase: "video files you own or a collaborator explicitly shared for download", quality: "the original public video file rather than an artificial upscale" },
      "zh-cn": { subject: "Dropbox 视频", accepted: "单个视频文件的 Dropbox 公开分享链接", excluded: "文件夹、私人分享、登录后文件、密码和非视频文件", useCase: "自己拥有或协作者明确分享给您下载的视频文件", quality: "公开分享的原始视频文件，不进行虚假放大" },
      es: { subject: "video de Dropbox", accepted: "un enlace público de un único archivo de video", excluded: "carpetas, archivos privados, con sesión, contraseña o que no sean video", useCase: "videos propios o compartidos expresamente por un colaborador", quality: "el archivo de video público original sin reescalado artificial" },
    },
  },
} satisfies Record<string, ExtendedPlatformConfig>;

function buildCopy(config: ExtendedPlatformConfig, locale: Locale): PlatformCopy {
  const d = config.details[locale];
  if (locale === "zh-cn") {
    return {
      title: `${config.platform} 视频下载器 - 在线下载 MP4/MP3 | Pullvio`,
      description: `免费的 ${config.platform} 视频下载器。粘贴${d.accepted}，将有权保存的内容下载为 MP4，并在音轨存在时获取 MP3。`,
      keywords: config.keywords?.[locale] ?? [`${config.platform}视频下载器`, `${config.platform}视频下载`, `${config.platform}转MP4`, `${config.platform}转MP3`, "在线视频下载器"],
      eyebrow: `${config.platform.toUpperCase()} 视频下载器`, h1: `在线下载 ${config.platform} 视频。`, accent: `将获得授权的内容保存为 HD MP4 或 MP3。`,
      intro: `粘贴${d.accepted}。Pullvio 会处理您自己拥有、符合许可条件或已获得保存授权的${d.subject}，并在浏览器中提供可用的视频、封面和音频文件。`,
      placeholder: `粘贴${config.platform}公开链接`, benefits: [`支持${d.accepted}`, `输出以${d.quality}为准`, "无需安装 App 或浏览器扩展"],
      howEyebrow: `如何下载 ${config.platform} 视频`, howTitle: "三个步骤，从公开链接获得媒体文件。",
      steps: [["复制单个公开链接", `打开${d.accepted}并复制完整 HTTPS 地址。`], ["粘贴并开始处理", "提交链接，Pullvio 会检查来源并准备 MP4、封面以及存在音轨时的 MP3。"], ["及时下载文件", "完成后将文件保存到设备；临时结果只保留24小时。"]],
      formatsEyebrow: "格式与源画质", formatsTitle: "只提供来源真实存在的文件。", formatsIntro: `可用格式取决于${d.quality}。Pullvio 不会凭空制造分辨率、音轨或无损音质。`,
      formats: [["MP4", "视频与声音", "适合在手机、电脑、编辑软件和个人档案中使用。"], ["MP3", "来源含音轨时提供", "提取音频不会授予音乐或语音的复用权。"], ["封面", "独立保存预览图", "来源提供封面时，可与视频一起及时下载。"]],
      boundariesEyebrow: "支持范围", boundariesTitle: "只处理单个、公开且已获授权的媒体。", worksTitle: "适合：公开直达链接", worksCopy: `用于${d.useCase}。`, limitsTitle: "不支持：受限页面", limitsCopy: `当前不处理${d.excluded}。`, responsibleTitle: "可访问不等于可自由使用", responsibleCopy: "下载前请确认所有权、许可、平台条款和当地法律；不要绕过访问控制或冒充原作者。",
      guideEyebrow: "负责任使用", guideTitle: "下载前先确认许可。", guideCopy: "阅读授权指南，了解自有作品、开放许可、公共领域、署名与受限内容之间的区别。", guideCta: "阅读负责任使用指南",
      relatedEyebrow: "更多平台工具", relatedTitle: "还需要处理其他公开媒体？", relatedCopy: "使用另一个经过验证的平台下载页，并继续遵守来源和授权范围。", relatedCta: "打开相关下载器",
      faqEyebrow: `${config.platform.toUpperCase()} 下载常见问题`, faqTitle: `关于 ${config.platform} 视频下载的问题。`, faqIntro: "说明公开链接、MP4、MP3、画质、设备、保留期限和使用边界。",
      faqs: [[`Pullvio ${config.platform} 下载器免费吗？`, "免费。访客可完成5次下载；免费账号可在合理使用、安全和来源可用范围内继续。"], [`支持哪些 ${config.platform} 链接？`, `当前只接受${d.accepted}。`], ["可以下载 MP4 和 MP3 吗？", "视频会准备为 MP4；只有来源实际包含音轨时，才会提供或生成 MP3。"], ["为什么某些链接无法处理？", `常见原因包括${d.excluded}，以及来源删除、地区限制或临时风控。`], ["文件会保留多久？", "处理结果只保留24小时，请完成后尽快下载。"], ["手机上可以使用吗？", "可以，支持现代 iPhone、Android、Mac 与 Windows 浏览器，无需扩展。"], ["下载后可以重新发布吗？", "只有所有权、许可或权利人明确允许时才可以；下载本身不会授予传播或商业使用权。"]],
    };
  }

  if (locale === "es") {
    return {
      title: `Descargador de ${config.platform} – MP4 y MP3 | Pullvio`,
      description: `Descarga ${config.searchName} público autorizado en MP4 y extrae MP3 cuando exista audio. Gratis, online y sin instalar aplicaciones.`,
      keywords: config.keywords?.[locale] ?? [`descargador de ${config.platform.toLowerCase()}`, `descargar ${config.searchName.toLowerCase()}`, `${config.platform.toLowerCase()} a mp4`, `${config.platform.toLowerCase()} a mp3`, "descargador de videos online"],
      eyebrow: `DESCARGADOR DE ${config.platform.toUpperCase()}`, h1: `Descarga videos de ${config.platform} online.`, accent: "Guarda contenido autorizado en MP4 o MP3.",
      intro: `Pega ${d.accepted}. Pullvio procesa ${d.subject} que posees, que tienen licencia o que puedes guardar, y entrega video, portada y audio disponible desde el navegador.`,
      placeholder: `Pega un enlace público de ${config.platform}`, benefits: [`Compatible con ${d.accepted}`, `Calidad según ${d.quality}`, "Sin aplicación ni extensión"],
      howEyebrow: `CÓMO DESCARGAR DE ${config.platform.toUpperCase()}`, howTitle: "Del enlace público al archivo en tres pasos.",
      steps: [["Copia el enlace público", `Abre ${d.accepted} y copia la dirección HTTPS completa.`], ["Pega y procesa", "Pullvio verifica la fuente y prepara MP4, portada y MP3 cuando existe audio."], ["Descarga sin demora", "Guarda los archivos en tu dispositivo; los resultados temporales duran 24 horas."]],
      formatsEyebrow: "FORMATO Y CALIDAD", formatsTitle: "Archivos fieles a la fuente pública.", formatsIntro: `Los formatos dependen de ${d.quality}. Pullvio no inventa resolución, audio ni calidad sin pérdida.`,
      formats: [["MP4", "Video compatible", "Para reproducción, edición y archivo autorizado."], ["MP3", "Audio cuando existe", "Extraer audio no concede derechos sobre música o voz."], ["PORTADA", "Imagen de vista previa", "Disponible por separado cuando la fuente la proporciona."]],
      boundariesEyebrow: "ALCANCE COMPATIBLE", boundariesTitle: "Solo un medio público y autorizado.", worksTitle: "Adecuado: enlace público directo", worksCopy: `Úsalo para ${d.useCase}.`, limitsTitle: "No compatible: acceso restringido", limitsCopy: `No se procesan ${d.excluded}.`, responsibleTitle: "Accesible no significa libre de derechos", responsibleCopy: "Comprueba propiedad, licencia, condiciones y ley local; no evites controles ni atribuyas obras ajenas.",
      guideEyebrow: "USO RESPONSABLE", guideTitle: "Comprueba el permiso antes de descargar.", guideCopy: "Distingue obras propias, licencias abiertas, dominio público, atribución y fuentes restringidas.", guideCta: "Leer la guía responsable",
      relatedEyebrow: "MÁS HERRAMIENTAS", relatedTitle: "¿Necesitas otra fuente pública?", relatedCopy: "Abre otro descargador verificado y conserva el mismo criterio de permiso.", relatedCta: "Abrir herramienta relacionada",
      faqEyebrow: `PREGUNTAS SOBRE ${config.platform.toUpperCase()}`, faqTitle: `Dudas sobre descargar de ${config.platform}.`, faqIntro: "Enlaces públicos, MP4, MP3, calidad, dispositivos, retención y permisos.",
      faqs: [[`¿El descargador de ${config.platform} es gratis?`, "Sí. Los visitantes tienen cinco descargas y una cuenta gratuita continúa dentro de límites razonables."], [`¿Qué enlaces de ${config.platform} funcionan?`, `Solo se acepta ${d.accepted}.`], ["¿Puedo obtener MP4 y MP3?", "Se prepara MP4; MP3 solo está disponible si la fuente contiene audio."], ["¿Por qué falla un enlace?", `Puede tratarse de ${d.excluded}, contenido eliminado, restricción regional o un límite temporal.`], ["¿Cuánto tiempo se guardan los archivos?", "Solo 24 horas. Descárgalos en cuanto estén listos."], ["¿Funciona en móvil?", "Sí, en navegadores modernos de iPhone, Android, Mac y Windows."], ["¿Puedo volver a publicar el archivo?", "Solo si eres titular o tienes una licencia o permiso que lo permita."]],
    };
  }

  return {
    title: `Free ${config.platform} Downloader – MP4 & MP3 | Pullvio`,
    description: `Download permitted public ${config.searchName} links as MP4 and extract MP3 when audio exists. Free, browser-based, and no app or extension required.`,
    keywords: config.keywords?.[locale] ?? [`${config.searchName.toLowerCase()} downloader`, `download ${config.searchName.toLowerCase()}`, `${config.platform.toLowerCase()} to mp4`, `${config.platform.toLowerCase()} to mp3`, "online video downloader"],
    eyebrow: `${config.platform.toUpperCase()} VIDEO DOWNLOADER`, h1: `Download ${config.platform} videos online.`, accent: "Save permitted public media as MP4 or MP3.",
    intro: `Paste ${d.accepted}. Pullvio processes a ${d.subject} you own, licensed material, or media you have permission to save, then delivers available video, cover, and audio files in your browser.`,
    placeholder: `Paste a public ${config.platform} link`, benefits: [`Supports ${d.accepted}`, `Quality follows ${d.quality}`, "No app or browser extension"],
    howEyebrow: `HOW TO DOWNLOAD ${config.platform.toUpperCase()} VIDEO`, howTitle: "A public link becomes a useful file in three steps.",
    steps: [["Copy the single public link", `Open ${d.accepted} and copy the complete HTTPS URL.`], ["Paste and process", "Pullvio validates the source and prepares MP4, a cover, and MP3 when an audio track exists."], ["Download promptly", "Save the files to your device; temporary results are retained for only 24 hours."]],
    formatsEyebrow: "FORMAT & SOURCE QUALITY", formatsTitle: "Download only what the source genuinely provides.", formatsIntro: `Available formats depend on ${d.quality}. Pullvio does not manufacture resolution, audio tracks, or lossless detail.`,
    formats: [["MP4", "Video with available sound", "A compatible file for playback, editing, and permitted archives."], ["MP3", "Audio when the source has it", "Audio extraction does not grant rights to music, speech, or other recordings."], ["COVER", "Separate preview image", "Download the cover alongside the video when the source publishes one."]],
    boundariesEyebrow: "SUPPORTED PUBLIC LINKS", boundariesTitle: "One accessible media item you are allowed to save.", worksTitle: "Good fit: a direct public link", worksCopy: `Use it for ${d.useCase}.`, limitsTitle: "Unavailable: restricted pages", limitsCopy: `The first release does not process ${d.excluded}.`, responsibleTitle: "Accessible does not mean free to reuse", responsibleCopy: "Check ownership, licenses, platform terms, and local law. Do not bypass access controls or present another creator's work as your own.",
    guideEyebrow: "RESPONSIBLE USE", guideTitle: "Confirm permission before downloading.", guideCopy: "Review ownership, open licenses, public-domain status, attribution, and restricted sources before keeping an offline copy.", guideCta: "Read the responsible-use guide",
    relatedEyebrow: "MORE PLATFORM TOOLS", relatedTitle: "Need another verified public source?", relatedCopy: "Open another dedicated downloader and keep the same permission-first workflow.", relatedCta: "Open related downloader",
    faqEyebrow: `${config.platform.toUpperCase()} DOWNLOADER FAQ`, faqTitle: `Common ${config.platform} download questions.`, faqIntro: "Public links, MP4, MP3, source quality, devices, retention, and responsible use.",
    faqs: [[`Is the Pullvio ${config.platform} downloader free?`, "Yes. Guests can complete five downloads and a free account continues within fair-use, security, and source-availability limits."], [`Which ${config.platform} links are supported?`, `The current workflow accepts ${d.accepted}.`], ["Can I download MP4 and MP3?", "Pullvio prepares MP4 video. MP3 is available only when the source genuinely contains an audio track."], ["Why might a link fail?", `Common causes include ${d.excluded}, removed media, regional restrictions, or temporary source limits.`], ["How long are files available?", "Only 24 hours. Download completed video, audio, and cover files promptly."], ["Does it work on mobile?", "Yes. Use a modern iPhone, Android, Mac, or Windows browser without an extension."], ["Can I republish the downloaded media?", "Only if ownership, a license, or the rights holder gives you permission. Downloading alone grants no reuse rights."]],
  };
}

export const extendedPlatformTools = Object.fromEntries(
  Object.entries(configs).map(([slug, config]) => [
    slug,
    {
      platform: config.platform,
      guideSlug: "save-online-media-legally",
      relatedSlug: config.relatedSlug,
      copy: Object.fromEntries(["en", "zh-cn", "es"].map((locale) => [locale, buildCopy(config, locale as Locale)])),
    },
  ]),
) as Record<keyof typeof configs, PlatformDefinition>;
