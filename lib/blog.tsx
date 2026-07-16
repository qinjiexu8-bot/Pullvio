import type { ReactNode } from "react";
import type { Locale } from "./i18n";

export type BlogPostCopy = {
  eyebrow: string;
  title: string;
  description: string;
  readingTime: string;
  body: ReactNode;
};

export type BlogPost = {
  slug: string;
  published: string;
  category: Record<Locale, string>;
  copy: Record<Locale, BlogPostCopy>;
};

export const blogIndexCopy = {
  en: {
    eyebrow: "PULLVIO JOURNAL",
    title: "Practical notes for better media workflows.",
    description: "Original guides for saving, organizing, and using online media responsibly across phones and computers.",
    latest: "Latest articles",
    read: "Read article",
  },
  "zh-cn": {
    eyebrow: "PULLVIO 博客",
    title: "让在线媒体工作流更清晰。",
    description: "围绕保存、整理与负责任使用在线媒体的原创文章，覆盖手机和电脑上的真实使用场景。",
    latest: "最新文章",
    read: "阅读文章",
  },
  es: {
    eyebrow: "REVISTA PULLVIO",
    title: "Ideas prácticas para trabajar mejor con contenido multimedia.",
    description: "Guías originales para guardar, organizar y utilizar contenido online de forma responsable en móvil y ordenador.",
    latest: "Artículos recientes",
    read: "Leer artículo",
  },
} satisfies Record<Locale, Record<string, string>>;

export const blogPosts: BlogPost[] = [
  {
    slug: "online-video-downloader-safety-checklist",
    published: "2026-07-16",
    category: { en: "Safety", "zh-cn": "安全", es: "Seguridad" },
    copy: {
      en: {
        eyebrow: "SAFER MEDIA TOOLS",
        title: "A safety checklist for online video downloaders.",
        description: "How to evaluate an online media tool before you paste a link, click a format, or save a file to your device.",
        readingTime: "6 min read",
        body: <>
          <p>An online video downloader should make a simple task feel simple. If the page is crowded with imitation download buttons, unexpected redirects, or requests for unrelated permissions, stop before sharing a link. A few quick checks can protect your device, your privacy, and the media you are working with.</p>
          <h2>1. Check the destination before the button</h2>
          <p>Confirm that you are on the domain you intended to visit. Look for a secure HTTPS connection and avoid lookalike domains with extra words or misspellings. A legitimate browser tool should not require you to install a separate executable, browser extension, or “codec” just to prepare an ordinary MP4 or MP3 file.</p>
          <h2>2. Treat every extra permission as a question</h2>
          <p>Preparing a public media link does not normally require access to your contacts, camera, microphone, notifications, or precise location. A file download may trigger the browser’s standard download prompt, but unrelated permission requests should be declined unless the product clearly explains why they are necessary.</p>
          <h2>3. Look for clear product and policy information</h2>
          <p>Trustworthy services explain who operates the product, how to contact them, what data is processed, and what uses are allowed. Read the privacy policy for link handling, temporary files, account data, analytics, and retention. Read the terms for usage limits and prohibited activity. Missing policies are not proof of harm, but they remove information you need to make an informed choice.</p>
          <h2>4. Inspect the file you receive</h2>
          <p>Video and audio downloads should have the file type you selected. Be cautious if a supposed video arrives as an executable, compressed archive, installer, or unfamiliar shortcut. Keep your browser and operating system updated, and use the security scanning already built into your device.</p>
          <h2>5. Confirm your right to save the source</h2>
          <p>Technical access is not the same as permission. Use download tools for media you created, public-domain works, content covered by an appropriate open license, or material you have another valid right to keep. Do not bypass DRM, private-account controls, subscriptions, or paywalls.</p>
          <div className="content-callout"><strong>A quick green-light test</strong><p>The domain is correct, the page uses HTTPS, no installation is required, buttons behave as labeled, policies are available, the output matches the chosen format, and you have permission to save the source.</p></div>
        </>,
      },
      "zh-cn": {
        eyebrow: "更安全的媒体工具",
        title: "在线视频下载工具安全检查清单。",
        description: "在粘贴链接、选择格式或保存文件前，如何快速判断一个在线媒体工具是否值得信任。",
        readingTime: "约 6 分钟",
        body: <>
          <p>在线视频下载本应是一项简单任务。如果页面充斥着真假难辨的下载按钮、意外跳转，或者索要与任务无关的权限，请先停下来。下面这些检查可以帮助您保护设备、隐私以及正在处理的媒体。</p>
          <h2>1. 点击前先核对域名</h2>
          <p>确认当前访问的是您原本要打开的域名，并检查页面是否使用 HTTPS。警惕多出单词、拼写相近的仿冒域名。正常的浏览器工具不应要求您安装独立程序、浏览器扩展或所谓“解码器”，才能生成普通的 MP4 或 MP3 文件。</p>
          <h2>2. 对额外权限保持敏感</h2>
          <p>处理公开媒体链接通常不需要访问联系人、相机、麦克风、通知或精确位置。浏览器可能会显示标准文件下载提示，但对于无关权限，除非产品清楚说明必要性，否则应当拒绝。</p>
          <h2>3. 查找清晰的产品与政策信息</h2>
          <p>可靠的服务会说明由谁运营、如何联系、会处理哪些数据，以及允许哪些用途。隐私政策应解释链接、临时文件、账户信息、分析数据和保留期限；服务条款则应说明使用限制和禁止行为。缺少政策不等于一定有害，但会让用户失去做判断所需的信息。</p>
          <h2>4. 检查最终文件</h2>
          <p>下载得到的视频或音频应与您选择的文件类型一致。如果所谓视频变成了可执行程序、压缩包、安装器或陌生快捷方式，应立即停止。保持浏览器和操作系统更新，并使用设备自带的安全扫描能力。</p>
          <h2>5. 确认您有权保存来源内容</h2>
          <p>技术上可以访问，不代表法律上获得许可。请仅保存自己创作的媒体、公共领域作品、符合开放许可条件的内容，或您通过其他方式取得合法保存权利的材料。不要绕过 DRM、私人账户限制、订阅或付费墙。</p>
          <div className="content-callout"><strong>快速通过标准</strong><p>域名正确、使用 HTTPS、无需安装、按钮行为与文字一致、政策可查、输出格式正确，并且您有权保存来源内容。</p></div>
        </>,
      },
      es: {
        eyebrow: "HERRAMIENTAS MÁS SEGURAS",
        title: "Lista de seguridad para descargadores de video online.",
        description: "Cómo evaluar una herramienta multimedia antes de pegar un enlace, elegir un formato o guardar un archivo.",
        readingTime: "6 min de lectura",
        body: <>
          <p>Descargar un video debería ser una tarea sencilla. Si una página está llena de botones falsos, redirecciones inesperadas o permisos que no tienen relación con el archivo, detente antes de compartir el enlace. Unas comprobaciones rápidas ayudan a proteger el dispositivo, la privacidad y el contenido.</p>
          <h2>1. Comprueba el dominio antes de pulsar</h2>
          <p>Confirma que estás en el dominio correcto y que la conexión utiliza HTTPS. Evita dominios parecidos con palabras añadidas o errores ortográficos. Una herramienta legítima no debería exigir un programa, una extensión ni un supuesto códec para preparar un MP4 o MP3 normal.</p>
          <h2>2. Cuestiona los permisos adicionales</h2>
          <p>Procesar un enlace público no suele requerir contactos, cámara, micrófono, notificaciones ni ubicación precisa. El navegador puede mostrar su aviso normal de descarga, pero conviene rechazar cualquier permiso ajeno a la tarea si el producto no explica su necesidad.</p>
          <h2>3. Busca información clara</h2>
          <p>Los servicios responsables explican quién opera el producto, cómo contactar, qué datos procesan y qué usos permiten. La política de privacidad debe cubrir enlaces, archivos temporales, cuentas, analítica y retención. Los términos deben explicar límites y actividades prohibidas.</p>
          <h2>4. Revisa el archivo recibido</h2>
          <p>El resultado debe coincidir con el formato elegido. Desconfía si un supuesto video llega como ejecutable, archivo comprimido, instalador o acceso directo desconocido. Mantén actualizados el navegador y el sistema operativo y utiliza sus funciones de seguridad.</p>
          <h2>5. Confirma tu derecho a guardar el contenido</h2>
          <p>Que un archivo sea accesible no significa que exista permiso. Utiliza estas herramientas con contenido propio, de dominio público, con una licencia abierta adecuada o con material que tengas derecho a conservar. No eludas DRM, cuentas privadas, suscripciones ni muros de pago.</p>
          <div className="content-callout"><strong>Prueba rápida</strong><p>Dominio correcto, HTTPS, ninguna instalación, botones honestos, políticas visibles, formato esperado y permiso para guardar la fuente.</p></div>
        </>,
      },
    },
  },
  {
    slug: "download-video-on-iphone-and-android",
    published: "2026-07-16",
    category: { en: "Mobile", "zh-cn": "移动端", es: "Móvil" },
    copy: {
      en: {
        eyebrow: "MOBILE WORKFLOW",
        title: "How browser downloads work on iPhone and Android.",
        description: "Where downloaded MP4 and MP3 files go, how to find them, and how to keep mobile storage under control.",
        readingTime: "5 min read",
        body: <>
          <p>Modern iPhone and Android browsers can save ordinary files without a dedicated app. The main source of confusion is not the download itself—it is knowing which folder received the file and which app can open it afterward.</p>
          <h2>Before you start</h2>
          <p>Use a current version of Safari, Chrome, or another well-supported browser. Check that the source provides the quality you need and that your phone has enough free space. A long 4K video can be many times larger than a 1080p copy, while MP3 audio is usually much smaller than either.</p>
          <h2>Finding a download on iPhone or iPad</h2>
          <p>Safari downloads normally appear in the Downloads location inside Apple’s Files app. The exact location may be iCloud Drive or “On My iPhone,” depending on Safari settings. Use the download indicator in Safari immediately after saving, or open Files and check Recents and Downloads.</p>
          <p>A file in Files is not automatically added to the Photos library. If you own the video and want it in Photos, open the file, use the Share menu, and choose the appropriate save action when iOS offers it. Keep the original in Files if you need a predictable folder for editing or transfer.</p>
          <h2>Finding a download on Android</h2>
          <p>Chrome and other Android browsers generally place files in the device’s Downloads folder. Open the Files app supplied by the device maker or Files by Google, then choose Downloads. The browser’s own Downloads screen can also show recent files and their status.</p>
          <h2>Choose a format for the next step</h2>
          <p>MP4 is the practical choice when you need both picture and sound. MP3 is designed for listening and saves storage when the visual track is unnecessary. If a file will be edited, confirm that the editing app supports its video codec as well as the MP4 container.</p>
          <h2>Keep mobile storage tidy</h2>
          <p>Rename important files soon after saving, move project media into a dedicated folder, and delete duplicates after verifying the best copy. For valuable personal work, transfer a second copy to a computer or trusted backup destination rather than treating the Downloads folder as a permanent archive.</p>
        </>,
      },
      "zh-cn": {
        eyebrow: "移动端工作流",
        title: "iPhone 与 Android 浏览器下载文件指南。",
        description: "了解 MP4、MP3 会保存到哪里、如何找到文件，以及怎样管理手机存储空间。",
        readingTime: "约 5 分钟",
        body: <>
          <p>现代 iPhone 和 Android 浏览器无需专用 App，也能保存普通文件。真正容易让人困惑的通常不是下载过程，而是文件被放进了哪个目录，以及之后该用什么应用打开。</p>
          <h2>开始前的准备</h2>
          <p>使用最新版 Safari、Chrome 或其他持续维护的浏览器，确认来源提供所需画质，并检查手机剩余空间。长时间 4K 视频可能比 1080p 文件大很多，而 MP3 音频通常明显更小。</p>
          <h2>在 iPhone 或 iPad 上查找文件</h2>
          <p>Safari 下载的文件通常位于苹果“文件”App 的“下载”目录。根据 Safari 设置，这个目录可能在 iCloud Drive，也可能在“我的 iPhone”中。下载完成后可立即使用 Safari 的下载图标，也可以打开“文件”，查看“最近项目”和“下载”。</p>
          <p>保存在“文件”中的视频不会自动进入“照片”。如果这是您拥有的视频并希望加入相册，可以打开文件，通过分享菜单选择系统提供的保存选项。若后续需要剪辑或传输，保留一份在明确的文件夹中会更好管理。</p>
          <h2>在 Android 上查找文件</h2>
          <p>Chrome 等 Android 浏览器通常把文件放入设备的 Downloads 目录。打开手机自带的文件管理器或 Files by Google，然后进入“下载”；浏览器自己的“下载内容”页面也能查看最近文件和状态。</p>
          <h2>根据下一步选择格式</h2>
          <p>需要画面与声音时，MP4 是更实用的选择；只需要收听时，MP3 可以节省空间。如果准备剪辑，还应确认编辑软件不仅支持 MP4 容器，也支持文件内部使用的视频编码。</p>
          <h2>保持手机存储整洁</h2>
          <p>重要文件应尽早重命名并移动到专用项目文件夹，确认最佳版本后删除重复副本。对有价值的个人作品，建议再复制到电脑或可信备份位置，不要把“下载”目录当作永久档案库。</p>
        </>,
      },
      es: {
        eyebrow: "FLUJO MÓVIL",
        title: "Cómo funcionan las descargas en iPhone y Android.",
        description: "Dónde se guardan los archivos MP4 y MP3, cómo encontrarlos y cómo controlar el espacio del móvil.",
        readingTime: "5 min de lectura",
        body: <>
          <p>Los navegadores actuales de iPhone y Android pueden guardar archivos normales sin una aplicación dedicada. La confusión suele aparecer después: qué carpeta recibió el archivo y qué aplicación puede abrirlo.</p>
          <h2>Antes de empezar</h2>
          <p>Utiliza una versión reciente de Safari, Chrome u otro navegador mantenido. Comprueba que la fuente ofrece la calidad necesaria y que el teléfono tiene espacio libre. Un video 4K largo puede ocupar varias veces más que una copia 1080p, mientras que el audio MP3 suele ser mucho más pequeño.</p>
          <h2>Encontrar una descarga en iPhone o iPad</h2>
          <p>Safari suele guardar los archivos en Descargas dentro de la app Archivos. La ubicación puede estar en iCloud Drive o “En mi iPhone”, según la configuración. Usa el indicador de descargas de Safari o abre Archivos y revisa Recientes y Descargas.</p>
          <p>Un video guardado en Archivos no aparece automáticamente en Fotos. Si es tuyo y quieres añadirlo, abre el archivo, utiliza Compartir y elige la acción de guardado que ofrezca iOS. Conserva el original en Archivos si necesitas una carpeta estable para editarlo.</p>
          <h2>Encontrar una descarga en Android</h2>
          <p>Chrome y otros navegadores suelen utilizar la carpeta Descargas. Abre el gestor de archivos del fabricante o Files de Google. La pantalla Descargas del propio navegador también muestra archivos recientes y su estado.</p>
          <h2>Elige el formato según el siguiente paso</h2>
          <p>MP4 es práctico cuando necesitas imagen y sonido. MP3 ahorra espacio cuando solo quieres escuchar. Para editar, comprueba que la aplicación admite tanto el contenedor MP4 como el códec de video incluido.</p>
          <h2>Mantén ordenado el almacenamiento</h2>
          <p>Cambia pronto el nombre de los archivos importantes, mueve cada proyecto a su carpeta y elimina duplicados después de verificar la mejor copia. Guarda una segunda copia del trabajo valioso en un ordenador o destino de respaldo fiable.</p>
        </>,
      },
    },
  },
  {
    slug: "organize-your-own-video-archive",
    published: "2026-07-16",
    category: { en: "Workflow", "zh-cn": "工作流", es: "Flujo de trabajo" },
    copy: {
      en: {
        eyebrow: "PERSONAL ARCHIVES",
        title: "A practical workflow for organizing your own video archive.",
        description: "Turn scattered personal uploads into a searchable, verified library with sensible names, metadata, and backups.",
        readingTime: "7 min read",
        body: <>
          <p>Creators often have important work scattered across phones, editing drives, social accounts, and old cloud folders. Downloading your own uploads is only the first step. A useful archive also needs structure, context, and a way to recover from hardware failure or accidental deletion.</p>
          <h2>Start with ownership and scope</h2>
          <p>Define what belongs in the archive: finished exports, original camera files, project files, captions, thumbnails, or published copies. Save media you created or are authorized to retain. If a project includes third-party music, footage, or artwork, preserve the relevant license and permission records alongside it.</p>
          <h2>Keep masters separate from delivery copies</h2>
          <p>A master is the highest-quality version you intend to preserve. A delivery copy is optimized for a platform, device, or client. Do not repeatedly recompress the master. Store it once, then create smaller MP4 copies for convenient playback and sharing when needed.</p>
          <h2>Use names that remain useful</h2>
          <p>A consistent pattern such as <code>2026-07-16_project-title_version_language.ext</code> sorts naturally and explains the file without opening it. Avoid names like “final-final-2.” Use a short project identifier, a meaningful version, and a real date.</p>
          <h2>Record context outside the filename</h2>
          <p>Keep a small text or spreadsheet record with title, creation date, creator, source URL, license, original resolution, duration, checksum, and notes. Captions, transcripts, descriptions, and thumbnails make an archive much easier to search and reuse responsibly.</p>
          <h2>Follow the 3-2-1 principle</h2>
          <p>Maintain three copies of valuable work, on two different kinds of storage, with one copy in another physical location or reputable cloud service. A synced folder is convenient, but synchronization alone can reproduce accidental deletion; use a destination with version history or independent backups.</p>
          <h2>Verify before deleting the source</h2>
          <p>Open the preserved video, check its duration, scrub several points in the timeline, confirm audio and captions, and compare file size and resolution with your record. For long-term archives, calculate a checksum so future integrity scans can identify silent corruption.</p>
          <div className="content-callout"><strong>A small archive beats a forgotten pile</strong><p>Begin with one completed project, document the workflow, and repeat it. Consistency is more valuable than designing a perfect system you never use.</p></div>
        </>,
      },
      "zh-cn": {
        eyebrow: "个人媒体档案",
        title: "整理个人视频档案的实用工作流。",
        description: "通过合理的命名、元数据与备份，把分散的个人作品变成可搜索、可验证的媒体库。",
        readingTime: "约 7 分钟",
        body: <>
          <p>创作者的重要作品经常分散在手机、剪辑硬盘、社交账号和旧云盘中。下载自己的已发布内容只是第一步；真正有用的档案还需要结构、背景信息，以及应对硬件故障和误删除的恢复方案。</p>
          <h2>先确定权利与归档范围</h2>
          <p>明确要保存哪些内容：最终成片、原始素材、工程文件、字幕、缩略图或平台发布版本。只归档自己创作或有权保留的媒体。如果项目包含第三方音乐、画面或插图，应将相关许可和授权记录一并保存。</p>
          <h2>母版与交付版本分开保存</h2>
          <p>母版是您希望长期保留的最高质量版本；交付版本则针对平台、设备或客户进行了优化。不要反复压缩母版。先完整保留一次，再按需要生成更小、便于播放和分享的 MP4 副本。</p>
          <h2>使用长期有效的文件名</h2>
          <p>例如 <code>2026-07-16_项目名_版本_语言.ext</code>，既能自然排序，也能在不打开文件的情况下说明内容。避免“最终版-最终版-2”这类名称，改用简短项目标识、明确版本和真实日期。</p>
          <h2>在文件名之外记录背景信息</h2>
          <p>用文本或表格记录标题、创作日期、作者、来源 URL、许可、原始分辨率、时长、校验值和备注。字幕、文字稿、简介与缩略图也会显著提升后续检索和合规复用效率。</p>
          <h2>遵循 3-2-1 备份原则</h2>
          <p>重要作品至少保留三份副本，使用两种不同存储介质，其中一份位于另一物理地点或可信云服务。同步文件夹很方便，但同步也可能复制误删除；因此应选择支持版本历史的目标，或保留独立备份。</p>
          <h2>删除来源前先验证</h2>
          <p>打开归档视频，核对总时长，在时间线上抽查多个位置，并确认音频和字幕。将文件大小、分辨率与记录进行对照。长期档案还可以计算校验值，以便未来发现不易察觉的数据损坏。</p>
          <div className="content-callout"><strong>小而稳定的档案胜过无人整理的文件堆</strong><p>先从一个已完成项目开始，记录流程，再逐步重复。持续执行比设计一个永远不用的完美系统更重要。</p></div>
        </>,
      },
      es: {
        eyebrow: "ARCHIVOS PERSONALES",
        title: "Un método práctico para organizar tu archivo de video.",
        description: "Convierte publicaciones dispersas en una biblioteca verificable con nombres, metadatos y copias de seguridad útiles.",
        readingTime: "7 min de lectura",
        body: <>
          <p>El trabajo de un creador suele quedar repartido entre teléfonos, discos de edición, cuentas sociales y carpetas antiguas. Descargar tus propias publicaciones es solo el primer paso. Un archivo útil necesita estructura, contexto y recuperación ante fallos o eliminaciones accidentales.</p>
          <h2>Empieza por los derechos y el alcance</h2>
          <p>Decide qué vas a conservar: exportaciones finales, originales de cámara, proyectos, subtítulos, miniaturas o copias publicadas. Guarda contenido propio o autorizado. Si un proyecto incluye música, imágenes o material de terceros, conserva también las licencias y permisos.</p>
          <h2>Separa los maestros de las copias de entrega</h2>
          <p>El maestro es la versión de mayor calidad que quieres preservar. Una copia de entrega está optimizada para una plataforma, dispositivo o cliente. No recomprimas el maestro repetidamente; consérvalo y crea MP4 más pequeños cuando los necesites.</p>
          <h2>Utiliza nombres que sigan siendo útiles</h2>
          <p>Un patrón como <code>2026-07-16_proyecto_version_idioma.ext</code> se ordena de forma natural y explica el archivo sin abrirlo. Evita nombres como “final-final-2”. Usa un identificador breve, una versión clara y una fecha real.</p>
          <h2>Guarda contexto fuera del nombre</h2>
          <p>Mantén un registro con título, fecha, creador, URL de origen, licencia, resolución, duración, suma de verificación y notas. Subtítulos, transcripciones, descripciones y miniaturas facilitan la búsqueda y la reutilización responsable.</p>
          <h2>Aplica el principio 3-2-1</h2>
          <p>Mantén tres copias del trabajo valioso, en dos tipos de almacenamiento, con una copia en otra ubicación o servicio fiable. La sincronización es cómoda, pero también puede replicar una eliminación; utiliza historial de versiones o una copia independiente.</p>
          <h2>Verifica antes de borrar el origen</h2>
          <p>Abre el video, comprueba la duración, revisa varios puntos de la línea de tiempo y confirma audio y subtítulos. Compara tamaño y resolución con el registro. Para conservación a largo plazo, una suma de verificación ayuda a detectar corrupción silenciosa.</p>
          <div className="content-callout"><strong>Un archivo pequeño supera a una pila olvidada</strong><p>Empieza con un proyecto terminado, documenta el proceso y repítelo. La constancia vale más que un sistema perfecto que nunca se utiliza.</p></div>
        </>,
      },
    },
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
