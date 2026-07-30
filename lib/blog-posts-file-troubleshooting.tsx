import Link from "next/link";
import type { BlogPost } from "./blog";
import {
  editorialStandardVersion,
  type ReviewedCandidate,
} from "./blog-editorial";

const blurryVideoReview = {
  status: "approved",
  standardVersion: editorialStandardVersion,
  reviewedAt: "2026-07-30",
  reviewer: "Pullvio Editorial",
  notes: "Passed single-intent, source-quality evidence, first-party product behavior, independent localization, SEO, safety, and anti-template review. No screenshot is used because the interface cannot prove the downloaded file's pixels or bitrate.",
} as const;

const unplayableMp4Review = {
  status: "approved",
  standardVersion: editorialStandardVersion,
  reviewedAt: "2026-07-30",
  reviewer: "Pullvio Editorial",
  notes: "Passed single-intent, container and codec evidence, first-party temporary-link behavior, independent localization, SEO, safety, and anti-template review. File inspection is more useful than an interface screenshot for this diagnosis.",
} as const;

export const fileTroubleshootingCandidates: ReviewedCandidate<BlogPost>[] = [
  {
    review: blurryVideoReview,
    post: {
      slug: "downloaded-video-is-blurry",
      published: "2026-07-30",
      category: {
        en: "Video quality",
        "zh-cn": "画质排查",
        es: "Calidad de video",
      },
      copy: {
        en: {
          eyebrow: "VIDEO QUALITY DIAGNOSIS",
          title: "Why does my downloaded video look blurry?",
          description: "Check the file’s real resolution, playback size, source processing, and compression before downloading the same blurry video again.",
          readingTime: "9 min read",
          body: <>
            <p>A downloaded video usually looks blurry for one of four reasons: the available source is low resolution, the file is being enlarged beyond its pixel dimensions, the platform has not finished preparing its higher-quality version, or compression removed detail before you saved it. Start by checking the local file at its natural size and reading its actual width and height. Repeating the same request cannot restore detail that is absent from the source.</p>
            <div className="content-callout"><strong>The useful first test</strong><p>Play the file in a window instead of full screen, pause on a frame with small text, and compare it with the source at the same displayed size. If both look similar, the download probably preserved the available rendition. If only the local file is soft, inspect its pixel dimensions and the quality selected before making one controlled retry.</p></div>

            <h2>Is the video low resolution, or just displayed too large?</h2>
            <p>A 640 × 360 file can look acceptable in a small browser card and obviously soft on a 2560 × 1440 monitor. Full-screen playback asks the player to invent several screen pixels from each source pixel; it makes the image larger, not more detailed. That is why the same file may appear sharp on a phone and blurry on a television.</p>
            <p>On macOS, QuickTime Player&apos;s Movie Inspector can show the current and encoded size. Windows file properties and many media players expose frame width and height. For an exact check on a computer, FFmpeg&apos;s companion tool can report the first video stream:</p>
            <pre><code>ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>Compare the result with recognized dimensions, not with the letters in a filename. YouTube&apos;s official <a href="https://support.google.com/youtube/answer/6375112?hl=en">resolution guide</a> lists 1280 × 720 for 720p, 1920 × 1080 for 1080p, 2560 × 1440 for 1440p, and 3840 × 2160 for 4K. A file named “HD” that measures 640 × 360 is still a 360p file.</p>

            <h2>Resolution is not the whole picture</h2>
            <p>Two files can both be 1920 × 1080 and still look different. Bitrate, codec settings, frame rate, motion, noise, repeated re-encoding, and the platform&apos;s own compression all affect visible detail. Fast camera movement and fine textures need more data than a static presentation slide at the same dimensions.</p>
            <p>MDN&apos;s <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">web video codec guide</a> describes the practical trade-off: keeping an encoded image closer to the uncompressed source generally requires a larger data rate and file. A bigger resolution label does not cancel heavy compression. Likewise, converting a 480p file into a 1080p frame creates more pixels but not the missing texture, text edges, or facial detail.</p>
            <p>File size alone is not a quality score, but it is a useful warning signal when two copies have the same duration and dimensions. If one is dramatically smaller, inspect its bitrate and codec before assuming both contain the same visual information.</p>

            <h2>Why the online player can look sharper than the saved file</h2>
            <p>First compare like with like. An online player may be showing a small image, applying sharpening, or switching between adaptive renditions as bandwidth changes. The downloaded file may be opened full screen immediately. Match the viewing size, pause on the same frame, and confirm the player&apos;s quality setting before deciding that the files differ.</p>
            <p>If the upload is your own and is recent, the high-resolution rendition may not exist yet. YouTube explains that 1080p and 4K versions take longer to process and that a 60-minute 4K/30 fps upload can take up to four hours before high-resolution processing finishes. Its <a href="https://support.google.com/youtube/answer/71674?hl=en">low-quality-after-upload guidance</a> recommends checking the Quality menu on the watch page. Downloading while only the low rendition exists simply preserves that temporary limit.</p>
            <p>This processing delay is not a reason to keep polling someone else&apos;s video. It is mainly useful when checking your own fresh upload: wait for the intended quality to appear in the official player, then make one new authorized request.</p>

            <h2>What Pullvio’s quality choice actually means</h2>
            <p>Pullvio currently shows a resolution selector on the YouTube downloader. The selection is a requested ceiling, not an upscaling promise. A 2160p request can return only detail the public source actually provides. TikTok, Instagram, Facebook, Snapchat, and OK.ru use the available source video returned for that public post rather than presenting an artificial list of resolutions.</p>
            <p>For a YouTube file that is genuinely lower than the source, return to the <Link href="/youtube-video-downloader">YouTube video downloader</Link>, choose the known available resolution, and submit once. Do not cycle through every label. The <Link href="/guides/video-resolution-guide">video resolution guide</Link> explains how source pixels, aspect ratio, and display size fit together.</p>
            <p>Pullvio can select or prepare an available rendition; it cannot recover a camera focus mistake, platform compression, an already-small upload, or detail removed by previous exports. “Original quality” means preserving what is available, not reconstructing an earlier master file.</p>

            <h2>Can software make a blurry download clear?</h2>
            <p>Sharpening and machine-learning upscaling can change how a low-resolution image looks, but they estimate edges and texture. They do not reveal text or faces that were never recorded in the file. For evidence, archival, or editing work, an estimated image must not be described as the original.</p>
            <p>If you own the media, the best repair is to return to the camera file or editing master and export once at an appropriate resolution and bitrate. Keep that master separate from the platform copy. If another person owns it, request an authorized source file instead of repeatedly converting a compressed public rendition.</p>
            <p>Avoid several back-to-back conversions. Each lossy export can discard more information. Preserve the first downloaded file, make any compatibility copy from it once, and compare before deleting the source.</p>

            <h2>When to stop downloading and report the result</h2>
            <p>One controlled retry is reasonable when the official player now exposes a higher resolution that was unavailable earlier, or when you can show that the first request used the wrong quality. Identical retries after the source and settings remain unchanged only reproduce the same limitation and may consume unnecessary provider requests.</p>
            <p>Record the public URL, selected quality, file dimensions, duration, approximate size, device, and the time the job completed. If the source clearly offers a higher public rendition but Pullvio returns a smaller file twice, send those facts through the <Link href="/contact">contact page</Link>. If the file has the expected dimensions but looks poor, the likely causes are compression, playback scaling, or the source itself—not a missing resolution label.</p>
          </>,
        },
        "zh-cn": {
          eyebrow: "视频画质排查",
          title: "为什么下载后的视频很模糊？",
          description: "从真实分辨率、播放器放大、平台高清处理和压缩四个方向判断视频下载后变模糊的原因，避免无效重复下载。",
          readingTime: "约 9 分钟",
          body: <>
            <p>视频下载后很模糊，通常不是“下载把画面弄坏了”这么简单。先区分四种情况：公开来源只提供低分辨率、播放器把小画面放得过大、平台尚未完成高清版本处理，或者视频在上传与多次导出时已经丢失细节。先查看本地文件的真实宽高，再以相同显示尺寸对比在线画面；来源中不存在的细节，重新下载多少次也不会出现。</p>
            <div className="content-callout"><strong>不要先点第二次下载</strong><p>把播放器退出全屏，暂停在带小字、头发或纹理的画面，以接近网页播放器的尺寸对比。如果两边差不多，文件大概率保留了当前可用版本；如果本地明显更糊，再核对像素尺寸和第一次选择的画质。</p></div>

            <h2>先判断是分辨率低，还是播放时被放大了</h2>
            <p>一个 640 × 360 的视频放在聊天窗口里可能看不出问题，铺满 2560 × 1440 的显示器后一定会发虚。全屏不会给文件增加真实细节，播放器只能用一个来源像素填充多个屏幕像素。因此，同一文件在手机上看着清楚，在电视上却出现模糊和色块，并不矛盾。</p>
            <p>macOS 可以在 QuickTime Player 的影片检查器中看编码尺寸，Windows 的文件属性和常见播放器也会显示画面宽高。需要准确结果时，可以用 ffprobe 读取第一条视频流：</p>
            <pre><code>ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>不要只相信文件名里的“HD”。YouTube 官方<a href="https://support.google.com/youtube/answer/6375112?hl=zh-Hans">分辨率说明</a>列出了常见尺寸：720p 为 1280 × 720，1080p 为 1920 × 1080，1440p 为 2560 × 1440，4K 为 3840 × 2160。写着 1080p、实际只有 640 × 360 的文件，本质上仍是 360p。</p>

            <h2>同样是 1080p，为什么清晰度还会不同</h2>
            <p>分辨率只说明像素排列，不代表每个像素保留了多少信息。码率、编码器设置、帧率、运动速度、噪点和转码次数都会影响结果。静止的课程画面与高速运动的球赛即使宽高相同，后者通常也需要更多数据才能避免马赛克和拖影。</p>
            <p>MDN 的<a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">视频编解码器指南</a>指出，编码画面越接近未压缩来源，一般就需要更高的数据量。把已经模糊的 480p 视频放进 1080p 画布，只会产生更多像素，不会恢复被删除的文字边缘、皮肤纹理和焦点。</p>
            <p>文件大小也不能单独证明画质，但可以作为线索。两个时长、分辨率相同的文件，如果体积差别极大，应继续查看码率和编码，而不是只比较文件名。</p>

            <h2>为什么网页里看着清楚，下载后却觉得变糊</h2>
            <p>先保证比较条件一致。网页播放器可能只占半个屏幕，还可能根据网络自动切换视频流；本地文件却常被直接全屏播放。把两边调整到相近尺寸，暂停在同一时间点，并确认在线播放器当前选中的画质，才能判断是否真的存在差异。</p>
            <p>如果这是刚上传的自有视频，还要考虑高清处理时间。YouTube 官方说明，1080p 和 4K 的处理速度慢于低清版本；一段 60 分钟、4K/30 fps 的视频，高清处理最长可能需要四小时。可以按照<a href="https://support.google.com/youtube/answer/71674?hl=zh-Hans">上传后画质较低的检查方法</a>，打开播放页的“画质”菜单确认目标版本是否已经出现。</p>
            <p>这个等待建议主要用于检查自己的新上传。对于他人的内容，不应持续轮询或重复提交；平台当前只公开低清版本时，下载工具也只能看到这个上限。</p>

            <h2>Pullvio 的画质选择代表什么</h2>
            <p>目前只有 Pullvio 的 YouTube 页面显示分辨率选择。这里选择的是请求上限，不是“画质修复”或强制放大。公开视频没有 2160p 来源时，点击 4K 不会产生真实的 4K 细节。TikTok、Instagram、Facebook、Snapchat 和 OK.ru 则使用该公开帖子当前可用的来源视频，不提供人为制造的分辨率列表。</p>
            <p>如果确认 YouTube 官方播放器已经公开更高画质，而第一次文件确实更小，可以回到<Link href="/zh-cn/youtube-video-downloader">YouTube 视频下载器</Link>，选中已知存在的画质后只提交一次。分辨率、宽高比与屏幕尺寸之间的关系，可以继续阅读<Link href="/zh-cn/guides/video-resolution-guide">视频分辨率指南</Link>。</p>
            <p>Pullvio 能选择并准备上游存在的视频版本，但不能修复相机失焦、原始上传过小、平台压缩或前一次导出已经丢失的信息。“保留来源画质”不等于找回上传之前的母版。</p>

            <h2>所谓“变清晰”工具能恢复原画吗</h2>
            <p>锐化和 AI 放大可以重新估计边缘与纹理，让画面看起来不同，但它们无法读取文件里从未存在的文字或人物细节。用于证据、档案或严谨剪辑时，不应把估算出来的画面称为原始画质。</p>
            <p>视频属于自己时，最可靠的办法是回到相机原片或剪辑母版，按合适的分辨率和码率重新导出一次，并把母版与平台副本分开保存。视频属于他人时，应向权利人获取授权文件，而不是对公开压缩版反复转码。</p>
            <p>也不要连续经过多个转换工具。每一次有损导出都可能继续删除信息。保留首次下载文件，只在确有兼容需要时制作一份副本，并在删除之前完成对比。</p>

            <h2>什么情况下值得重试，什么时候应该反馈</h2>
            <p>只有两种情况值得做一次受控重试：官方播放器刚刚出现了之前没有的高清版本，或者已经确认第一次选错了画质。来源、设置和时间都没有变化时，重复提交通常只会得到相同结果，还会产生没有意义的上游请求。</p>
            <p>反馈前记录公开 URL、所选画质、文件宽高、时长、近似大小、设备和完成时间。如果来源明确存在更高的公开版本，而 Pullvio 连续两次返回较小文件，可通过<Link href="/zh-cn/contact">联系页面</Link>提供这些信息。文件尺寸正确但画面仍差时，更可能是压缩、播放放大或来源本身，而不是“少了一个高清标签”。</p>
          </>,
        },
        es: {
          eyebrow: "DIAGNÓSTICO DE CALIDAD",
          title: "¿Por qué el video descargado se ve borroso?",
          description: "Comprueba resolución real, tamaño de reproducción, procesamiento de la fuente y compresión antes de repetir una descarga borrosa.",
          readingTime: "9 min de lectura",
          body: <>
            <p>Un video descargado puede verse borroso aunque la descarga haya terminado correctamente. La causa suele estar en uno de cuatro puntos: la fuente pública solo ofrece baja resolución, el reproductor agranda el archivo por encima de sus píxeles reales, la plataforma todavía procesa la versión de alta calidad o una compresión anterior ya eliminó detalle. Antes de pedir otra copia, mira las dimensiones del archivo y compáralo con la fuente al mismo tamaño de pantalla.</p>
            <div className="content-callout"><strong>Una comparación que sí aporta información</strong><p>Sal del modo de pantalla completa, detén ambos videos en un fotograma con texto o textura fina y dales un tamaño parecido. Si se ven casi iguales, probablemente guardaste la versión disponible. Si el archivo local pierde mucho más detalle, revisa sus dimensiones y la calidad elegida.</p></div>

            <h2>¿El archivo tiene poca resolución o solo está demasiado ampliado?</h2>
            <p>Un video de 640 × 360 puede parecer correcto dentro de una tarjeta pequeña y muy suave al ocupar un monitor de 2560 × 1440. El reproductor multiplica cada píxel para llenar el panel, pero no descubre información nueva. Por eso un mismo archivo puede verse aceptable en el móvil y borroso en un televisor.</p>
            <p>QuickTime Player ofrece un inspector en macOS; Windows y muchos reproductores muestran ancho y alto en las propiedades. Si necesitas una lectura exacta, ffprobe puede consultar el primer flujo de video:</p>
            <pre><code>ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of default=noprint_wrappers=1 tu-video.mp4</code></pre>
            <p>Contrasta los números con dimensiones reales, no con el nombre. La <a href="https://support.google.com/youtube/answer/6375112?hl=es">guía oficial de resoluciones de YouTube</a> identifica 1280 × 720 como 720p, 1920 × 1080 como 1080p, 2560 × 1440 como 1440p y 3840 × 2160 como 4K. Cambiar el nombre de un archivo de 360p a “HD” no altera sus píxeles.</p>

            <h2>Dos videos 1080p no tienen por qué verse igual</h2>
            <p>La resolución describe una cuadrícula, no la cantidad de detalle que sobrevivió a la codificación. Influyen la tasa de bits, el códec, los fotogramas por segundo, el movimiento, el ruido y las conversiones anteriores. Una diapositiva casi estática necesita menos datos que un concierto con luces, humo y movimiento rápido.</p>
            <p>La <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">documentación de códecs de video de MDN</a> explica el intercambio entre tamaño y calidad: acercarse más a la fuente sin comprimir suele exigir más datos. Ampliar un 480p dentro de un lienzo 1080p no recupera letras, piel ni bordes que la compresión ya descartó.</p>
            <p>El peso tampoco es una nota definitiva, pero sí una pista. Ante dos archivos de igual duración y dimensiones con tamaños muy distintos, revisa la tasa de bits y el códec antes de afirmar que tienen la misma información visual.</p>

            <h2>Por qué el reproductor online puede parecer más nítido</h2>
            <p>La comparación suele ser desigual. El reproductor web ocupa menos espacio, puede aplicar ajustes visuales y cambia de variante según la conexión; el archivo local se abre a pantalla completa. Iguala el tamaño, pausa en el mismo segundo y comprueba la calidad activa de la fuente.</p>
            <p>Cuando acabas de subir un video propio, quizá todavía no exista la variante grande. YouTube indica que 1080p y 4K tardan más en procesarse y que un video 4K/30 fps de 60 minutos puede necesitar hasta cuatro horas. Su guía sobre <a href="https://support.google.com/youtube/answer/71674?hl=es">baja calidad después de subir</a> recomienda revisar el menú Calidad en la página del video.</p>
            <p>Esperar tiene sentido para tu propia subida reciente. No es una invitación a consultar una obra ajena repetidamente: si la plataforma solo expone una variante pequeña, esa es también la frontera de una herramienta de enlaces públicos.</p>

            <h2>Qué significa la calidad seleccionada en Pullvio</h2>
            <p>El selector de resolución aparece actualmente en el descargador de YouTube de Pullvio. Define un máximo solicitado; no es un sistema para inventar detalle. Pedir 2160p no convierte en 4K un video cuya fuente pública termina en 720p. TikTok, Instagram, Facebook, Snapchat y OK.ru entregan el video disponible para la publicación, sin una lista artificial de resoluciones.</p>
            <p>Si YouTube ya muestra una variante pública superior y el primer archivo fue menor, vuelve al <Link href="/es/youtube-video-downloader">descargador de YouTube</Link>, elige esa resolución conocida y haz una sola solicitud. Para interpretar píxeles, proporción y tamaño de pantalla, consulta la <Link href="/es/guides/video-resolution-guide">guía de resolución</Link>.</p>
            <p>Pullvio puede preparar una variante disponible. No puede corregir el enfoque de la cámara, una subida pequeña, la compresión de la plataforma ni el detalle perdido durante una exportación previa.</p>

            <h2>¿Se puede “arreglar” un video borroso?</h2>
            <p>El enfoque y el escalado con aprendizaje automático estiman bordes y texturas. Pueden producir una imagen distinta, pero no leer texto o rostros que el archivo nunca conservó. En un archivo, una prueba o un proyecto documental, esa estimación no debe presentarse como material original.</p>
            <p>Si el contenido es tuyo, regresa al archivo de cámara o al máster de edición y exporta una vez con dimensiones y tasa adecuadas. Conserva el máster separado de la copia publicada. Para contenido ajeno, solicita al titular un archivo autorizado en vez de encadenar conversiones sobre una versión comprimida.</p>
            <p>Guarda también la primera copia antes de convertir. Cada nueva compresión con pérdida puede empeorar bordes, movimiento y color.</p>

            <h2>Cuándo repetir y cuándo informar del problema</h2>
            <p>Un reintento controlado tiene sentido si acaba de aparecer una calidad que antes no existía o si elegiste por error una variante inferior. Repetir la misma URL con la misma configuración no mejora la fuente y puede consumir solicitudes del proveedor sin aportar información.</p>
            <p>Anota URL pública, calidad, dimensiones, duración, tamaño aproximado, dispositivo y hora. Si la fuente ofrece claramente una variante pública mayor y Pullvio devuelve dos veces un archivo inferior, envía esos datos desde <Link href="/es/contact">Contacto</Link>. Si las dimensiones son correctas, estudia compresión, ampliación y calidad original antes de buscar otro botón de resolución.</p>
          </>,
        },
      },
    },
  },
  {
    review: unplayableMp4Review,
    post: {
      slug: "downloaded-mp4-wont-play",
      published: "2026-07-30",
      category: {
        en: "Playback help",
        "zh-cn": "播放排错",
        es: "Ayuda de reproducción",
      },
      copy: {
        en: {
          eyebrow: "MP4 PLAYBACK DIAGNOSIS",
          title: "Why won’t my downloaded MP4 video play?",
          description: "Determine whether an MP4 download is incomplete, expired, mislabeled, or encoded with a codec your current player cannot decode.",
          readingTime: "9 min read",
          body: <>
            <p>If a downloaded MP4 will not play, first decide whether you have a complete media file or only an interrupted, expired, or incorrectly saved response. Check that the download finished, the file has a plausible size, and a second current player also rejects it. An <code>.mp4</code> extension identifies a container; it does not guarantee that every device can decode the video and audio streams inside.</p>
            <div className="content-callout"><strong>Read the symptom before changing the file</strong><p>A zero-byte or unusually tiny file points to an incomplete save. A file that works in one player but not another points to codec support. A file that fails everywhere but still has valid streams may be damaged or unfinished. Renaming the extension does not repair any of these conditions.</p></div>

            <h2>Confirm that the download actually finished</h2>
            <p>Look in the browser&apos;s Downloads panel before opening the file from a notification. It should show a completed state rather than paused, canceled, or failed. Then inspect the local size. A two-minute video is not expected to be a few kilobytes; a tiny result may be an error page, redirect response, or partial file rather than the video.</p>
            <p>Pullvio completed jobs expose temporary provider links. “Ready” means the result was available when the job finished, not that a provider URL will remain permanent. Save the file promptly and let the browser complete the transfer before closing the tab or moving the file. If the link expired before the save began, start a new authorized job; if a complete local file already exists, refreshing the old link will not change its codec.</p>
            <p>On mobile, confirm that you opened the finished item from Files or Downloads, not a temporary browser preview. The <Link href="/blog/download-video-on-iphone-and-android">iPhone and Android download guide</Link> lists the normal save locations.</p>

            <h2>MP4 is a container, not a single video format</h2>
            <p>An MP4 file can contain H.264/AVC, H.265/HEVC, AV1, or another video stream, plus AAC or a different audio stream. The filename can be correct while an older phone, television, editor, or system player lacks the required decoder. MDN&apos;s <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">video codec guide</a> recommends H.264 video with AAC audio in MP4 for broad browser compatibility, but MP4 itself does not enforce that combination.</p>
            <p>This explains a useful diagnostic: if the file opens in one maintained player but not in another app, the download is probably intact. The failing app may not support the codec profile, bit depth, resolution, frame rate, or audio stream. Update the operating system and player before converting the file.</p>
            <p>Do not solve this by changing <code>.mp4</code> to <code>.mov</code>, <code>.mkv</code>, or <code>.avi</code>. A new suffix changes the label that software sees; it does not rewrite the streams or container structure.</p>

            <h2>Inspect the file instead of guessing</h2>
            <p>On a computer with FFmpeg installed, ffprobe can show whether the file contains recognizable streams and how they are encoded:</p>
            <pre><code>ffprobe -v error -show_entries format=format_name,duration,size -show_entries stream=index,codec_type,codec_name,width,height -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>A normal result should identify an MP4-family format, a positive duration and at least one video stream. If ffprobe reports invalid data, reaches an unexpected end of file, or finds no streams, the transfer may be incomplete or the saved response may not be video. The official <a href="https://ffmpeg.org/ffprobe.html">ffprobe documentation</a> explains that the tool gathers information from a multimedia stream and returns a failure code when a file cannot be opened or recognized.</p>
            <p>Do not upload a private file to an unknown “repair” site simply to learn its codec. Local file properties, a trusted player, or ffprobe can answer the first questions without sending the media elsewhere.</p>

            <h2>Why playback can fail on one device</h2>
            <p>Hardware and software limits matter. A device may decode ordinary 1080p H.264 but reject 4K HEVC, a 10-bit profile, or a frame rate beyond what its hardware handles. Apple notes that HEVC support varies on older devices and that 1080p at 60 fps or below is more broadly compatible there. Its <a href="https://support.apple.com/en-us/116944">HEVC support guidance</a> also describes exporting as H.264 for greater compatibility.</p>
            <p>Try a current browser or a maintained media player on the same device, then try a second device if available. If every device rejects the file and ffprobe cannot read it, suspect the file. If one device plays it, preserve that original and treat the problem as compatibility.</p>
            <p>A black picture with audible sound, or sound with a frozen first frame, is also useful evidence. It suggests one stream is decoding while another is not. That is different from the <Link href="/blog/downloaded-video-has-no-sound">no-audio diagnosis</Link>, where the video picture already plays normally.</p>

            <h2>When conversion is appropriate</h2>
            <p>For media you own or are authorized to modify, one conversion to a broadly compatible H.264/AAC MP4 can help when the original streams are valid but the target device cannot decode them. Keep the original first. Conversion is lossy in most everyday workflows, so do not run the result through several online converters in succession.</p>
            <p>Conversion cannot reconstruct an interrupted file whose final data never arrived. It also cannot turn an HTML error response into a video. If ffprobe cannot find a valid stream, return to the source and make one clean save while the authorized public link is still available.</p>
            <p>For your own upload, the camera master or editing export is a better starting point than a platform copy. For someone else&apos;s work, ask the rights holder for a compatible authorized file rather than bypassing private, paid, regional, or DRM restrictions.</p>

            <h2>How to handle an unplayable Pullvio result</h2>
            <p>When a Pullvio job reaches Ready, start the browser download while its temporary result link is active and wait for completion. If the browser reports a failed transfer, one new request can be reasonable. If it reports success and the complete file fails in two players, collect evidence before using another provider request.</p>
            <p>Record the source URL, platform, Video or Audio mode, requested quality, local filename and size, device, player, completion time, and any ffprobe error. Submit those details through the <Link href="/contact">Pullvio contact page</Link>. Never send account cookies, private links, access tokens, or a copyrighted file you are not permitted to share.</p>
            <p>For an authorized public YouTube source, the <Link href="/youtube-video-downloader">YouTube downloader</Link> produces the selected result from the available provider response. A repeated failure across unrelated public sources may indicate a provider incident; a single file that only one old player rejects is more likely a local compatibility issue.</p>
          </>,
        },
        "zh-cn": {
          eyebrow: "MP4 播放排错",
          title: "下载的 MP4 视频打不开，应该怎么处理？",
          description: "判断 MP4 文件是下载不完整、临时链接已过期、扩展名错误，还是播放器不支持文件内部的视频编码。",
          readingTime: "约 9 分钟",
          body: <>
            <p>下载的 MP4 视频打不开，第一步不是改后缀或立即重新转换，而是确认本地拿到的究竟是不是完整媒体文件。查看浏览器下载是否已经结束、文件大小是否合理，并用第二个较新的播放器打开一次。<code>.mp4</code> 只说明容器类型，不保证每台设备都支持里面的视频和音频编码。</p>
            <div className="content-callout"><strong>根据现象分流</strong><p>0 字节或异常小的文件，优先怀疑下载中断；换播放器后正常，优先查编解码兼容；所有播放器都失败、但还能识别到音视频流，可能是文件结构损坏或没有写完。改名不会修复这三类问题。</p></div>

            <h2>先确认浏览器真的把文件下载完成了</h2>
            <p>打开浏览器“下载内容”，确认状态是完成，而不是暂停、取消或失败。然后查看文件大小：一段正常的几分钟视频不应只有几 KB。异常小的所谓 MP4 可能是错误页面、重定向响应或只下载了一部分，不是可以播放的视频。</p>
            <p>Pullvio 的已完成任务使用临时上游链接。“已完成”表示任务结束时结果可用，不代表链接永久存在。看到结果后应及时开始保存，并等浏览器完成传输再关闭页面或移动文件。链接在保存之前已经失效时，需要重新创建一次获得授权的任务；如果完整文件已经在本地，刷新旧链接不会改变它的编码。</p>
            <p>手机端要从“文件”或 Downloads 目录打开完成项目，不要把浏览器临时预览当作本地文件。具体位置可参考<Link href="/zh-cn/blog/download-video-on-iphone-and-android">iPhone 与 Android 下载文件指南</Link>。</p>

            <h2>MP4 是容器，不是唯一一种编码</h2>
            <p>一个 MP4 里面可能装 H.264/AVC、H.265/HEVC、AV1 等视频流，也可能搭配 AAC 或其他音频流。文件名完全正确，旧手机、电视、剪辑软件或系统播放器仍可能没有对应解码器。MDN 的<a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">视频编码指南</a>把 MP4 中的 H.264 视频与 AAC 音频列为兼容性广的常见组合，但 MP4 容器本身不会强制采用它。</p>
            <p>因此，“一个播放器打不开，另一个可以”是很有价值的结果：文件大概率完整，只是原播放器不支持编码档次、位深、分辨率、帧率或某条音频流。先升级系统和播放器，再决定是否转码。</p>
            <p>把 <code>.mp4</code> 改成 <code>.mov</code>、<code>.mkv</code> 或 <code>.avi</code> 没有用。后缀只是标签，内部流和容器结构没有被重写，甚至可能让软件判断得更混乱。</p>

            <h2>用文件信息结束猜测</h2>
            <p>电脑安装 FFmpeg 后，可以用 ffprobe 同时查看容器、时长、大小和音视频流：</p>
            <pre><code>ffprobe -v error -show_entries format=format_name,duration,size -show_entries stream=index,codec_type,codec_name,width,height -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>正常结果应识别出 MP4 相关容器、正数时长和至少一条视频流。如果出现 invalid data、unexpected end of file，或完全找不到 stream，更像是下载不完整或保存到的响应根本不是视频。FFmpeg 的 <a href="https://ffmpeg.org/ffprobe.html">ffprobe 官方说明</a>明确把它定义为媒体流信息检查工具，无法打开或识别输入时会返回失败。</p>
            <p>仅仅为了查编码，不需要把私人文件上传到陌生的“视频修复”网站。系统属性、可信播放器和本地 ffprobe 已经可以完成第一轮判断，也不会额外暴露内容。</p>

            <h2>为什么同一个 MP4 只在某台设备打不开</h2>
            <p>设备的软硬件解码能力不同。旧设备可能支持普通 1080p H.264，却无法处理 4K HEVC、10-bit 编码或超出硬件能力的帧率。Apple 官方说明，旧设备上的 HEVC 支持会受分辨率与帧率影响，1080p、60 fps 或以下通常更广泛兼容；其 <a href="https://support.apple.com/zh-cn/116944">HEVC 使用说明</a>也提供了导出为 H.264 以提高兼容性的方式。</p>
            <p>先在同一设备使用较新的浏览器或播放器，再换一台设备做对照。如果所有设备都打不开，ffprobe 也无法读取，应怀疑文件本身；如果至少有一台能正常播放，先保留原文件，再按目标设备解决兼容性。</p>
            <p>只有声音、画面全黑，或者第一帧卡住但音频继续，也属于有用现象：说明其中一条流可能正常，另一条无法解码。它与<Link href="/zh-cn/blog/downloaded-video-has-no-sound">下载视频没有声音</Link>不同，后者是画面已经正常播放，再判断音轨和输出。</p>

            <h2>什么时候转码才有意义</h2>
            <p>对自己拥有或获准修改的媒体，如果 ffprobe 能正常读取，只是目标设备不支持编码，可以制作一份 H.264/AAC MP4 兼容副本。开始前保留原文件。日常转码大多有损，不要让文件连续经过多个在线转换工具。</p>
            <p>转码无法补齐从未下载到本地的尾部数据，也不能把 HTML 错误页变成视频。ffprobe 找不到有效媒体流时，应回到公开且获得授权的来源，在链接仍有效时重新完整保存一次。</p>
            <p>自己的内容优先使用相机原片或剪辑导出，而不是平台压缩副本。别人的内容则应向权利人索取兼容文件和授权，不要尝试绕过私人账号、付费内容、地区限制或 DRM。</p>

            <h2>Pullvio 结果打不开时应该提供什么信息</h2>
            <p>Pullvio 任务显示“已完成”后，应在临时结果链接有效时开始下载，并等浏览器明确显示完成。浏览器直接报告传输失败，可以重新创建一次任务；浏览器显示成功、完整文件却在两个播放器中都失败，就不要继续盲目提交。</p>
            <p>请记录来源 URL、平台、视频或音频模式、请求画质、本地文件名与大小、设备、播放器、完成时间和 ffprobe 错误，再通过<Link href="/zh-cn/contact">联系页面</Link>反馈。不要发送账号 Cookie、私人链接、访问令牌，或没有权利分享的版权文件。</p>
            <p>处理获得授权的公开 YouTube 来源时，可以使用<Link href="/zh-cn/youtube-video-downloader">YouTube 视频下载器</Link>。多个无关公开视频同时失败，更像上游服务事件；只有一个旧播放器拒绝单个文件，则更像本地兼容问题。</p>
          </>,
        },
        es: {
          eyebrow: "DIAGNÓSTICO DE MP4",
          title: "¿Por qué no se reproduce el video MP4 descargado?",
          description: "Averigua si el MP4 está incompleto, caducó antes de guardarse o utiliza un códec que el reproductor actual no puede decodificar.",
          readingTime: "9 min de lectura",
          body: <>
            <p>Si un video MP4 descargado no se reproduce, comprueba primero que sea un archivo multimedia completo y no una transferencia interrumpida, una respuesta caducada o un contenido guardado con nombre equivocado. Mira el estado de Descargas, revisa que el tamaño sea razonable y prueba otro reproductor actualizado. La extensión <code>.mp4</code> describe el contenedor, no garantiza que el dispositivo pueda decodificar las pistas internas.</p>
            <div className="content-callout"><strong>El síntoma orienta la prueba</strong><p>Un archivo de cero bytes o demasiado pequeño suele estar incompleto. Si funciona en una aplicación y en otra no, el códec es el principal sospechoso. Si falla en todas pero aún aparecen pistas válidas, puede tener una estructura dañada o sin terminar. Cambiarle el nombre no arregla ninguno de esos casos.</p></div>

            <h2>Verifica que la descarga haya terminado de verdad</h2>
            <p>Abre el panel Descargas del navegador antes de utilizar la notificación del archivo. El estado debe ser completado, no pausado, cancelado ni fallido. Después observa el tamaño local. Un video de varios minutos no debería ocupar unos pocos kilobytes; un resultado diminuto puede ser una página de error, una redirección o solo una parte del contenido.</p>
            <p>Los trabajos completados de Pullvio ofrecen enlaces temporales del proveedor. “Listo” indica que el resultado existía al terminar la tarea, no que la dirección vaya a ser permanente. Inicia la descarga pronto y espera a que el navegador cierre la transferencia antes de salir o mover el archivo. Si el enlace caducó antes de guardar, crea una nueva tarea autorizada; si ya tienes un archivo completo, actualizar el enlace antiguo no modifica su códec.</p>
            <p>En móvil, abre el elemento terminado desde Archivos o Descargas y no confundas una vista previa temporal con el archivo local. La <Link href="/es/blog/download-video-on-iphone-and-android">guía para iPhone y Android</Link> muestra las ubicaciones habituales.</p>

            <h2>MP4 es un contenedor, no un único formato</h2>
            <p>Dentro de MP4 puede haber video H.264/AVC, H.265/HEVC, AV1 u otro flujo, acompañado de AAC u otro audio. Un móvil antiguo, un televisor o un editor puede reconocer el nombre y carecer del decodificador. La <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">guía de códecs de MDN</a> presenta H.264 con AAC dentro de MP4 como una combinación ampliamente compatible, pero el contenedor no obliga a utilizarla.</p>
            <p>Una prueba sencilla aclara mucho: cuando el video abre en un reproductor mantenido pero falla en otra aplicación, el archivo probablemente está íntegro. La aplicación que falla puede no admitir el perfil, profundidad de color, resolución, frecuencia de fotogramas o pista de audio. Actualiza primero el sistema y la aplicación.</p>
            <p>No cambies <code>.mp4</code> por <code>.mov</code>, <code>.mkv</code> o <code>.avi</code>. La etiqueta nueva no reescribe los flujos ni la estructura y puede provocar otro diagnóstico incorrecto.</p>

            <h2>Inspecciona el archivo sin enviarlo a otra web</h2>
            <p>En un ordenador con FFmpeg, ffprobe puede informar del formato, duración, tamaño y pistas reconocidas:</p>
            <pre><code>ffprobe -v error -show_entries format=format_name,duration,size -show_entries stream=index,codec_type,codec_name,width,height -of default=noprint_wrappers=1 tu-video.mp4</code></pre>
            <p>Un archivo normal debería indicar un formato de la familia MP4, duración positiva y al menos un flujo de video. “Invalid data”, un final inesperado o la ausencia de pistas apuntan a una transferencia incompleta o a una respuesta que no era multimedia. La <a href="https://ffmpeg.org/ffprobe.html">documentación oficial de ffprobe</a> explica que la herramienta recopila información de flujos y devuelve error cuando no puede abrir o reconocer la entrada.</p>
            <p>No subas un video privado a un sitio desconocido solo para saber su códec. Las propiedades locales, un reproductor de confianza y ffprobe responden las primeras preguntas sin compartir el contenido.</p>

            <h2>Por qué falla solo en un dispositivo</h2>
            <p>La decodificación depende del hardware y del software. Un equipo puede reproducir H.264 a 1080p y no aceptar HEVC 4K, 10 bits o una frecuencia superior. Apple señala que HEVC varía en dispositivos antiguos y que 1080p a 60 fps o menos ofrece compatibilidad más amplia. Su <a href="https://support.apple.com/es-es/116944">guía de HEVC</a> también explica cómo exportar en H.264 para obtener mayor compatibilidad.</p>
            <p>Prueba un navegador o reproductor actualizado en el mismo equipo y, si puedes, un segundo dispositivo. Si todos fallan y ffprobe tampoco lee el archivo, sospecha del archivo. Si uno lo reproduce, conserva ese original y trata el problema como compatibilidad.</p>
            <p>Una pantalla negra con sonido, o un fotograma congelado mientras el audio continúa, indica que una pista puede decodificarse y otra no. Es distinto del diagnóstico de <Link href="/es/blog/downloaded-video-has-no-sound">video descargado sin sonido</Link>, donde la imagen ya funciona.</p>

            <h2>Cuándo conviene convertir</h2>
            <p>Para contenido propio o autorizado, una conversión a MP4 con H.264 y AAC puede servir si las pistas son válidas pero el dispositivo de destino no las admite. Conserva antes el original. Las conversiones habituales pierden información, así que evita encadenar varias herramientas.</p>
            <p>Convertir no reconstruye los bytes que nunca llegaron ni transforma una página HTML en video. Cuando ffprobe no encuentra un flujo válido, vuelve a la fuente pública autorizada y realiza una sola descarga limpia mientras el enlace esté disponible.</p>
            <p>Para una obra propia, parte del máster de cámara o edición. Para una obra ajena, pide al titular una copia compatible y permiso; un códec diferente no justifica evitar cuentas privadas, pagos, restricciones regionales o DRM.</p>

            <h2>Qué hacer con un resultado de Pullvio que no abre</h2>
            <p>Cuando Pullvio muestra Listo, guarda el resultado mientras el enlace temporal esté activo y espera la confirmación del navegador. Si la transferencia falla, una tarea nueva puede tener sentido. Si termina y el archivo completo falla en dos reproductores, reúne datos antes de consumir otra solicitud.</p>
            <p>Anota URL pública, plataforma, modo Video o Audio, calidad, nombre y tamaño local, dispositivo, reproductor, hora y mensaje de ffprobe. Envíalos mediante <Link href="/es/contact">Contacto</Link>. Nunca incluyas cookies, enlaces privados, tokens ni un archivo que no tengas permiso para compartir.</p>
            <p>Para una fuente pública autorizada de YouTube, utiliza el <Link href="/es/youtube-video-downloader">descargador de YouTube</Link>. Si fallan varias fuentes públicas distintas, puede existir una incidencia del proveedor; si solo una aplicación antigua rechaza el archivo, revisa primero la compatibilidad local.</p>
          </>,
        },
      },
    },
  },
];
