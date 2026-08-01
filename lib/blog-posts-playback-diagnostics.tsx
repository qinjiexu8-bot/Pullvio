import Link from "next/link";
import type { BlogPost } from "./blog";
import {
  editorialStandardVersion,
  type ReviewedCandidate,
} from "./blog-editorial";

const missingSubtitlesReview = {
  status: "approved",
  standardVersion: editorialStandardVersion,
  reviewedAt: "2026-08-01",
  reviewer: "Pullvio Editorial",
  notes: "Passed single-intent, timed-text evidence, first-party output-boundary, independent localization, SEO, permission, privacy, and anti-template review. File and track inspection provide stronger evidence than a downloader-interface screenshot.",
} as const;

const earlyEndingReview = {
  status: "approved",
  standardVersion: editorialStandardVersion,
  reviewedAt: "2026-08-01",
  reviewer: "Pullvio Editorial",
  notes: "Passed single-intent, browser-transfer and media-duration evidence, first-party temporary-result behavior, independent localization, SEO, safety, and anti-template review. No screenshot is used because a Ready screen cannot prove local transfer completeness.",
} as const;

export const playbackDiagnosticCandidates: ReviewedCandidate<BlogPost>[] = [
  {
    review: missingSubtitlesReview,
    post: {
      slug: "subtitles-missing-from-downloaded-video",
      published: "2026-08-01",
      category: {
        en: "Subtitle diagnosis",
        "zh-cn": "字幕排查",
        es: "Diagnóstico de subtítulos",
      },
      copy: {
        en: {
          eyebrow: "SUBTITLE DIAGNOSIS",
          title: "Why are subtitles missing from my downloaded video?",
          description: "Find out whether the online captions were burned into the picture, embedded in the media, or delivered as a separate timed-text file.",
          readingTime: "9 min read",
          body: <>
            <p>Subtitles can disappear from a downloaded video even when the web player showed them, because the text may never have been part of the video file. Online players often load captions as a separate timed-text resource and draw them over the picture during playback. First check whether the local file contains a subtitle track; if it does not, changing players or renaming the MP4 cannot recreate text that was never saved.</p>
            <div className="content-callout"><strong>Three different subtitle arrangements</strong><p>Burned-in text is part of every video frame and cannot be switched off. An embedded subtitle track travels inside the media container but needs player support. An external SRT or VTT file is a separate download that must be kept and loaded alongside the video. The correct fix depends on which arrangement the source used.</p></div>

            <h2>Why captions visible online may not be inside the video</h2>
            <p>A CC button proves that the player can display a text track; it does not prove that the text is encoded into the MP4. MDN defines <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format">WebVTT</a> as a plain-text format containing timed cues that can be associated with a video through a separate track. The browser synchronizes those cues with the picture while the page is open.</p>
            <p>This separation is useful. A platform can offer several languages, accessibility captions, chapters, or corrected text without encoding a new video for each version. It also means a request that returns only the visual media can be perfectly complete and still contain no captions.</p>
            <p>Automatic captions can add another timing difference. YouTube says automatic captions may still be processing after an upload and may be unavailable for unsupported languages, long videos, poor audio, silence, or overlapping speakers. Its <a href="https://support.google.com/youtube/answer/6373554?hl=en">automatic-caption guidance</a> is a reminder to confirm that a real caption track exists, rather than assuming every CC label represents a downloadable file.</p>

            <h2>How to tell burned-in, embedded, and external subtitles apart</h2>
            <p>Start with the local player. If the words remain visible after subtitles are disabled, they are probably burned into the pixels. If the Subtitle or CC menu lists a language, the file may contain an embedded text track. If the menu is empty but another <code>.srt</code>, <code>.vtt</code>, or <code>.ass</code> file sits beside the video, load that external file manually.</p>
            <p>On a computer with FFmpeg installed, inspect subtitle streams without uploading the media anywhere:</p>
            <pre><code>ffprobe -v error -select_streams s -show_entries stream=index,codec_name:stream_tags=language,title -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>A listed stream is evidence that subtitle data is present in the container. No output means ffprobe found no subtitle stream; it says nothing about burned-in words because those are ordinary picture pixels. It also cannot discover a web-only caption URL after the page session has ended.</p>

            <h2>What Pullvio currently includes in a result</h2>
            <p>Pullvio&apos;s current downloader prepares the available public video, while the YouTube page also offers an Audio mode. The current workflow does not promise SRT, VTT, translated captions, or a subtitle track. Therefore a Pullvio MP4 can contain the full picture and sound returned by the provider while omitting captions that the platform player loaded separately.</p>
            <p>Use the <Link href="/youtube-video-downloader">YouTube video downloader</Link> only for media you own or are authorized to save, and judge the result by the selected media output—not by a CC overlay that was never offered as an artifact. Submitting the same URL repeatedly will not make a separate caption resource appear.</p>
            <p>This is different from a file whose audio is missing. If the picture plays but sound does not, use the <Link href="/blog/downloaded-video-has-no-sound">no-sound diagnostic</Link>. Captions are timed text, not a replacement audio stream.</p>

            <h2>How creators can recover an authorized caption file</h2>
            <p>If it is your YouTube upload, use YouTube Studio rather than a general video downloader. YouTube&apos;s <a href="https://support.google.com/youtube/answer/2734705?hl=en">caption editing documentation</a> explains how the owner can open Subtitles, choose a language, and download its caption file. Its <a href="https://support.google.com/youtube/answer/2734698?hl=en">supported-format guide</a> lists SRT, SBV, WebVTT, and other timed-text formats.</p>
            <p>Some authorized stores and hosting products expose captions separately. Vimeo, for example, tells eligible On Demand viewers to download both the video and caption file, then add the caption file in a compatible player. That <a href="https://help.vimeo.com/hc/en-us/articles/12426105647249-Download-captions-or-subtitles-for-On-Demand-titles">official Vimeo workflow</a> also notes that sellers may not enable caption downloads for every title.</p>
            <p>For someone else&apos;s work, request the caption file and permission from the creator or rights holder. Do not inspect private page requests, import account cookies, or bypass a membership simply because the public player can display text.</p>

            <h2>How to load an external subtitle file locally</h2>
            <p>Keep the video and authorized subtitle file in the same folder. Many desktop players can load it through a Subtitle menu; automatic discovery often works when the base names match, such as <code>lesson.mp4</code> and <code>lesson.en.srt</code>. Choose the correct language and character encoding if the text appears garbled.</p>
            <p>An external file can be out of sync when it was authored for a different edit. A caption timed for a 12:04 source will drift or skip when paired with an 11:57 cut. Do not stretch the video to fit the text. Obtain the caption made for that exact version or, for your own production, retime a copy while preserving the original.</p>
            <p>Burning captions into a new export makes them visible on players that lack subtitle support, but the text can no longer be switched, translated, restyled, or hidden. Keep the accessible source track as well as any burned-in delivery copy.</p>

            <h2>When the missing text cannot be recovered from the download</h2>
            <p>If ffprobe finds no subtitle stream, there is no separate file, and the text is not burned into the image, the local video has no captions to enable. A file extension change or generic “repair” tool cannot infer the original wording and timing. Speech-to-text can create a new transcript, but that is newly generated content and may contain errors; it is not recovery of the platform&apos;s original captions.</p>
            <p>For private or sensitive speech, avoid uploading the video to an unknown transcription service. Use a trusted local workflow or the platform&apos;s owner tools. Review names, numbers, technical terms, and accessibility cues before publishing generated captions.</p>
            <p>If Pullvio ever adds subtitle artifacts, the interface should show the language and file type explicitly. Until then, the absence of a subtitle button is a product boundary, not a reason to consume repeated downloads.</p>

            <h2>What to record before contacting support</h2>
            <p>Record the public source URL, platform, whether the online captions were manual or automatic, visible language, Pullvio mode, local filename, and the result of the player and ffprobe checks. Send the facts through the <Link href="/contact">contact page</Link>. Do not send cookies, private links, access tokens, or media you are not permitted to share.</p>
            <p>If the MP4 itself will not open, switch to the <Link href="/blog/downloaded-mp4-wont-play">unplayable MP4 guide</Link>. If the video plays normally and only the timed text is absent, the useful next step is to locate an authorized caption resource—not to repair the video stream.</p>
          </>,
        },
        "zh-cn": {
          eyebrow: "视频字幕排查",
          title: "为什么下载的视频没有字幕？",
          description: "判断网页字幕是烧录在画面中、内嵌在视频容器里，还是由播放器单独加载的 SRT、VTT 等文本轨道，并找到正确处理方式。",
          readingTime: "约 9 分钟",
          body: <>
            <p>网页播放时能看到字幕，下载后的文件却没有，最常见的原因不是字幕“被删掉”，而是文字原本就不在视频文件里。很多网页播放器会另外读取一份带时间码的文本，再把它叠加到画面上。先检查本地文件是否包含字幕轨；如果没有，换播放器、改后缀或重复下载都不会凭空生成原来的文字与时间轴。</p>
            <div className="content-callout"><strong>先分清三种字幕</strong><p>画面字幕已经成为视频像素，无法单独关闭；内嵌字幕位于 MP4 等容器中，需要播放器识别；外挂字幕是单独的 SRT、VTT 或 ASS 文件，必须与视频一起保存并手动加载。三种情况看起来相似，处理方法完全不同。</p></div>

            <h2>先看关闭 CC 后文字是否还存在</h2>
            <p>在网页播放器关闭 CC，再观察同一段画面。文字仍然存在，说明它很可能已经烧录到画面；关闭后消失，则播放器正在显示可切换的文本轨。后者可能存放在媒体容器中，也可能是网页单独请求的文件，不能仅凭肉眼判断它会不会跟着 MP4 下载。</p>
            <p>MDN 将 <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format">WebVTT</a> 定义为带时间提示的纯文本格式，可通过独立 track 与视频同步。平台用这种结构可以在同一画面上提供多种语言、无障碍字幕和章节，而不用为每种语言重新编码一份视频。</p>
            <p>YouTube 自动字幕还可能晚于视频出现。官方<a href="https://support.google.com/youtube/answer/6373554?hl=zh-Hans">自动字幕说明</a>列出了尚在处理、语言不支持、视频过长、音质较差、开头长时间静音和多人重叠说话等限制。因此，网页出现 CC 图标之前，应先确认具体语言轨道已经生成。</p>

            <h2>检查本地文件里到底有没有字幕轨</h2>
            <p>先打开播放器的“字幕”菜单。如果能选择语言，说明文件或同目录资源里很可能有字幕；菜单为空，但文件夹里存在同名 <code>.srt</code>、<code>.vtt</code> 或 <code>.ass</code>，需要手动加载。把字幕关闭后文字仍留在画面，则属于烧录字幕，播放器不会把它列成文字轨。</p>
            <p>电脑安装 FFmpeg 后，可以在本地查询容器里的字幕流，不必把私人文件上传到陌生网站：</p>
            <pre><code>ffprobe -v error -select_streams s -show_entries stream=index,codec_name:stream_tags=language,title -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>命令列出语言或编码，说明容器中有字幕流；完全没有输出，说明没有识别到字幕流。它无法检测已经烧进画面的文字，也无法在下载结束后找回只存在于网页会话里的字幕地址。</p>

            <h2>Pullvio 当前会返回哪些内容</h2>
            <p>Pullvio 当前以公开来源实际可用的视频为主，YouTube 页面另有 Audio 模式；现有流程没有承诺输出 SRT、VTT、翻译字幕或字幕语言列表。所以下载结果可能完整保留画面和声音，但不会自动带上网页播放器单独加载的 CC 文本。</p>
            <p>确认有权保存公开内容后，可以使用<Link href="/zh-cn/youtube-video-downloader">YouTube 视频下载器</Link>。界面没有字幕文件按钮时，不要连续提交同一链接来“碰运气”；相同的媒体请求不会把未声明的字幕资源变成视频附件。</p>
            <p>视频没有字幕与视频没有声音不是同一问题。画面正常、声音消失时，应按照<Link href="/zh-cn/blog/downloaded-video-has-no-sound">下载视频无声排查</Link>检查音轨；字幕只是与时间同步的文字数据。</p>

            <h2>自己的视频如何取得原字幕文件</h2>
            <p>如果视频由你上传到 YouTube，应进入 YouTube Studio 的“字幕”页面。YouTube 官方<a href="https://support.google.com/youtube/answer/2734705?hl=zh-Hans">编辑和下载字幕说明</a>提供了选择语言、打开选项并下载字幕文件的步骤。官方<a href="https://support.google.com/youtube/answer/2734698?hl=zh-Hans">字幕格式说明</a>列出的常见格式包括 SRT、SBV 与 WebVTT。</p>
            <p>有些正版托管或购买页面会把视频与字幕作为两个下载项。Vimeo 的<a href="https://help.vimeo.com/hc/en-us/articles/12426105647249-Download-captions-or-subtitles-for-On-Demand-titles">官方帮助</a>明确要求分别下载视频和字幕，再在支持字幕的播放器中加载；发布者没有开放字幕下载时，则应联系发布者。</p>
            <p>别人作品的字幕同样受到授权与访问边界约束。不要为了取一份文本导入账号 Cookie、抓取私人页面或绕过会员限制；向权利人索取对应版本的字幕文件更可靠。</p>

            <h2>外挂字幕存在时怎样正确加载</h2>
            <p>把视频与获得授权的字幕放在同一文件夹，尽量使用相同的基础文件名，例如 <code>lesson.mp4</code> 与 <code>lesson.zh-CN.srt</code>。桌面播放器通常可从“字幕—添加字幕文件”手动选择；乱码时检查文件是否采用 UTF-8，以及播放器选择的字符编码。</p>
            <p>字幕与画面逐渐错位，常常是文件版本不匹配。一份按 12 分 04 秒完整版制作的字幕，无法准确对应被剪成 11 分 57 秒的视频。应寻找针对同一剪辑版本的字幕；自己的内容可以复制一份字幕重新校时，但要保留原始轨道。</p>
            <p>把字幕烧录进新视频能解决部分电视或旧播放器无法加载文字的问题，但之后不能自由切换语言、样式和开关。用于无障碍发布时，最好同时保存可编辑的原始文本轨。</p>

            <h2>什么时候应该停止尝试“修复视频”</h2>
            <p>ffprobe 没有字幕流、文件夹没有外挂字幕、文字也没有烧在画面里，就意味着本地文件没有可开启的字幕。改名或普通视频修复软件不能推断原文与精确时间。语音识别可以重新生成文字，但那是新转写，可能听错姓名、数字、口音和专业术语，不等于恢复平台原字幕。</p>
            <p>涉及会议、未发布素材或私人对话时，不要随意上传到未知的在线转写网站。优先使用平台所有者工具或可信的本地流程，并由人工检查无障碍提示、说话人和时间轴。</p>
            <p>未来如果 Pullvio 提供字幕附件，界面应明确显示语言和格式。在此之前，没有字幕下载按钮就是当前产品边界，而不是需要反复消耗请求的临时错误。</p>

            <h2>联系支持前准备哪些信息</h2>
            <p>请记录公开来源 URL、平台、网页字幕是人工还是自动生成、语言、Pullvio 模式、本地文件名，以及播放器菜单和 ffprobe 的检查结果，再通过<Link href="/zh-cn/contact">联系页面</Link>反馈。不要发送账号 Cookie、私人链接、访问令牌或没有权利分享的媒体。</p>
            <p>如果文件本身完全打不开，请改看<Link href="/zh-cn/blog/downloaded-mp4-wont-play">MP4 无法播放排查</Link>。视频能正常播放、只有字幕缺失时，正确目标是找到对应且获得授权的文本资源，而不是修复视频画面。</p>
          </>,
        },
        es: {
          eyebrow: "DIAGNÓSTICO DE SUBTÍTULOS",
          title: "¿Por qué mi video descargado no tiene subtítulos?",
          description: "Distingue texto grabado en la imagen, pistas internas y archivos SRT o VTT que el reproductor online cargaba por separado.",
          readingTime: "9 min de lectura",
          body: <>
            <p>Un video descargado puede quedarse sin subtítulos aunque la página los mostrara porque el texto quizá nunca formó parte del archivo multimedia. Muchos reproductores web reciben una pista de texto aparte y la dibujan sobre la imagen. Comprueba primero si el archivo local contiene una pista de subtítulos; si no existe, cambiar la extensión o repetir la misma descarga no recuperará palabras ni tiempos que no fueron guardados.</p>
            <div className="content-callout"><strong>No todos los subtítulos viven en el mismo sitio</strong><p>Los subtítulos quemados son píxeles y siempre se ven. Una pista interna está dentro del contenedor y depende del reproductor. Un SRT, VTT o ASS externo es otro archivo que debe acompañar al video. Identificar el tipo evita intentar reparar una imagen que está completa.</p></div>

            <h2>Comprueba si el texto pertenece a la imagen</h2>
            <p>Desactiva CC en la página y observa el mismo momento. Si las palabras continúan, están probablemente grabadas en los fotogramas. Si desaparecen, la web estaba activando una pista seleccionable, pero esa pista todavía puede ser interna o una petición de texto separada.</p>
            <p>MDN describe <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format">WebVTT</a> como texto con marcas de tiempo asociado a video mediante una pista. Esa separación permite ofrecer idiomas, capítulos y accesibilidad sin crear una copia completa del video por idioma; también explica por qué un MP4 válido puede llegar sin el texto visto online.</p>
            <p>Las leyendas automáticas tampoco aparecen siempre al mismo tiempo que el video. La <a href="https://support.google.com/youtube/answer/6373554?hl=es">ayuda oficial de YouTube</a> menciona procesamiento pendiente, idiomas no admitidos, audio deficiente, silencios largos y voces superpuestas. Confirma que el idioma concreto ya existe antes de buscarlo en el archivo.</p>

            <h2>Busca una pista real sin subir el archivo</h2>
            <p>Abre el menú Subtítulos del reproductor local. Un idioma disponible apunta a una pista interna o externa reconocida. Si el menú está vacío, revisa la carpeta por archivos <code>.srt</code>, <code>.vtt</code> o <code>.ass</code>. El texto que permanece con el menú desactivado está quemado y no aparecerá como pista.</p>
            <p>Con FFmpeg instalado, ffprobe puede consultar únicamente los flujos de subtítulos:</p>
            <pre><code>ffprobe -v error -select_streams s -show_entries stream=index,codec_name:stream_tags=language,title -of default=noprint_wrappers=1 tu-video.mp4</code></pre>
            <p>Si devuelve idioma o códec, hay datos de subtítulos dentro del contenedor. Una respuesta vacía significa que no encontró ese tipo de flujo. No detecta letras convertidas en píxeles ni reconstruye la dirección de una pista web que ya no está disponible.</p>

            <h2>El límite actual del resultado de Pullvio</h2>
            <p>Pullvio prepara el video público disponible y la página de YouTube ofrece además un modo Audio. El flujo actual no promete archivos SRT o VTT, traducciones ni una lista de idiomas. Por eso puede entregar imagen y sonido completos sin incluir el recurso de CC que utilizó el reproductor de la plataforma.</p>
            <p>Utiliza el <Link href="/es/youtube-video-downloader">descargador de YouTube</Link> solo para contenido propio o autorizado y evalúa lo que la interfaz ofrece. Enviar muchas veces la misma URL no transforma una pista web separada en un adjunto del MP4.</p>
            <p>La ausencia de texto tampoco equivale a un video sin audio. Cuando la imagen funciona pero no se oye nada, sigue el <Link href="/es/blog/downloaded-video-has-no-sound">diagnóstico de video sin sonido</Link>; la pista de voz y la pista de subtítulos son recursos distintos.</p>

            <h2>Recupera los subtítulos desde la cuenta del creador</h2>
            <p>Para un video que tú subiste, entra en YouTube Studio. La guía para <a href="https://support.google.com/youtube/answer/2734705?hl=es">editar y descargar subtítulos</a> indica cómo abrir el idioma y descargar su archivo. La lista oficial de <a href="https://support.google.com/youtube/answer/2734698?hl=es">formatos admitidos</a> incluye SRT, SBV y WebVTT, entre otros.</p>
            <p>Algunos servicios autorizados presentan el video y el texto como descargas distintas. La <a href="https://help.vimeo.com/hc/en-us/articles/12426105647249-Download-captions-or-subtitles-for-On-Demand-titles">documentación de Vimeo On Demand</a> pide guardar ambos y añadir después los subtítulos en un reproductor compatible; si el vendedor no habilitó la pista, recomienda solicitarla al vendedor.</p>
            <p>Para una obra ajena, pide al titular el archivo correspondiente a esa edición y permiso de uso. No importes cookies ni atravieses una cuenta privada, una compra o una restricción para obtener texto no ofrecido públicamente.</p>

            <h2>Carga un SRT o VTT que ya tienes</h2>
            <p>Guarda el video y el archivo autorizado en la misma carpeta. Nombres como <code>clase.mp4</code> y <code>clase.es.srt</code> ayudan a muchos reproductores a relacionarlos; si no, utiliza la opción para añadir subtítulos manualmente. Cuando aparecen caracteres extraños, revisa el idioma y la codificación UTF-8.</p>
            <p>Una pista puede comenzar bien y desincronizarse porque fue creada para otro montaje. Un texto de 12:04 no encaja necesariamente con una versión de 11:57. Busca la pista de esa edición o, si eres titular, reajusta una copia conservando el original.</p>
            <p>Grabar el texto en una nueva exportación facilita la reproducción en ciertos televisores, pero elimina la posibilidad de ocultarlo, cambiar idioma o corregirlo. Conserva también la pista editable para accesibilidad y futuras revisiones.</p>

            <h2>Cuándo no hay nada que activar</h2>
            <p>Si ffprobe no encuentra pistas, no existe archivo externo y las letras no están en la imagen, el video local carece de subtítulos. Renombrar el MP4 o usar un reparador genérico no conoce el diálogo original. Una transcripción automática crea texto nuevo, con posibles errores; no recupera la pista publicada por la plataforma.</p>
            <p>No envíes reuniones, material inédito o conversaciones privadas a un servicio de transcripción desconocido. Prefiere herramientas del propietario o un proceso local confiable, y revisa nombres, cifras, términos técnicos, hablantes y avisos accesibles.</p>
            <p>Si Pullvio incorpora archivos de subtítulos en el futuro, deberá mostrar idioma y formato. Mientras no aparezca esa opción, su ausencia es un límite visible del producto y no un motivo para gastar solicitudes repetidas.</p>

            <h2>Datos útiles para una consulta de soporte</h2>
            <p>Anota URL pública, plataforma, idioma, si las leyendas eran manuales o automáticas, modo de Pullvio, nombre local y resultados del menú y de ffprobe. Envíalos mediante <Link href="/es/contact">Contacto</Link>. No incluyas cookies, tokens, enlaces privados ni contenido que no puedas compartir.</p>
            <p>Si el MP4 no abre en absoluto, utiliza la guía de <Link href="/es/blog/downloaded-mp4-wont-play">MP4 que no se reproduce</Link>. Cuando el video funciona y solo falta texto, busca una pista autorizada para esa versión en lugar de alterar el flujo visual.</p>
          </>,
        },
      },
    },
  },
  {
    review: earlyEndingReview,
    post: {
      slug: "downloaded-video-ends-early",
      published: "2026-08-01",
      category: {
        en: "File completeness",
        "zh-cn": "文件完整性",
        es: "Integridad del archivo",
      },
      copy: {
        en: {
          eyebrow: "FILE COMPLETENESS",
          title: "Why does my downloaded video end early?",
          description: "Compare source and file duration, browser completion, temporary-link timing, and media metadata before repeating an incomplete download.",
          readingTime: "9 min read",
          body: <>
            <p>A downloaded video that plays normally and then ends early is usually one of two things: the source rendition itself is shorter than expected, or the browser saved only part of the result. Compare the exact source duration with the local duration, confirm the browser marked the transfer complete, and inspect the file before retrying. A Ready task and a fully saved local file are separate milestones.</p>
            <div className="content-callout"><strong>Use a duration pair, not a feeling</strong><p>Write down the source player&apos;s duration and the local player&apos;s duration in minutes and seconds. If both end at the same timestamp, investigate the source, live archive, clip, or edit. If the local file ends earlier, check browser status, byte size, temporary-link timing, and media metadata.</p></div>

            <h2>Measure where the source and local file actually stop</h2>
            <p>Play both versions near the final complete scene and record their displayed durations. Do not compare a playlist total, livestream wall-clock time, or page description with one video item. A Short, Reel, highlight, preview, or clipped post may legitimately expose less material than a longer page title suggests.</p>
            <p>Scrub the local timeline instead of watching from the beginning. If seeking jumps back, freezes after one point, or shows a duration longer than playable content, the container may describe samples that are missing or damaged. If it seeks cleanly to its final frame and that frame matches the public source, the file may simply represent the available rendition.</p>
            <p>Keep the first file while diagnosing. Repeatedly replacing it removes evidence such as size, completion time, and the exact cutoff point. The <Link href="/blog/downloaded-mp4-wont-play">unplayable MP4 guide</Link> covers files that never open; this article is for files that start correctly and finish too soon.</p>

            <h2>Ready in Pullvio is not the same as saved by the browser</h2>
            <p>Pullvio can mark a provider job Ready when a temporary result URL is available. The browser still has to fetch that result to the device. Closing the tab, losing connectivity, running out of storage, cancelling the download, or opening an expired result can interrupt this second transfer even though the processing job already succeeded.</p>
            <p>Open the browser&apos;s Downloads panel and look for Completed rather than relying on a toast or filename in the folder. A partial file may retain an MP4 name and even play its first segment. Pullvio cannot verify bytes after a third-party result has left the website and entered the user&apos;s browser download manager.</p>
            <p>The account history describes completed tasks and temporary links, not permanent cloud storage. Start the save promptly and wait for the browser to finish. See the <Link href="/blog/download-video-on-iphone-and-android">mobile file-location guide</Link> if a phone preview makes it unclear whether the item is local.</p>

            <h2>Inspect duration, size, and streams locally</h2>
            <p>With FFmpeg installed, ffprobe can read the container duration, byte size, and individual stream duration:</p>
            <pre><code>ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_type,duration -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>The official <a href="https://ffmpeg.org/ffprobe.html">ffprobe documentation</a> explains that it gathers information from multimedia streams and returns a failure code when input cannot be opened or recognized. A positive duration does not prove every sample is healthy, but missing streams, invalid data, or a duration far below the source gives you concrete evidence.</p>
            <p>Compare file size only with the same rendition. A 480p copy should be smaller than a 4K copy, so size alone is not completeness. For two attempts using the same source, format, and quality, a large unexplained size difference is a reason to inspect browser completion and provider behavior.</p>

            <h2>Why pause and resume do not always recover the rest</h2>
            <p>Download managers can resume only when the server and temporary URL support the required request. MDN&apos;s <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests">HTTP range request guide</a> explains that servers advertising byte ranges can return <code>206 Partial Content</code>; servers without range support may require a fresh full transfer. A result URL can also expire between the first bytes and a resume attempt.</p>
            <p>The HTTP <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length">Content-Length header</a> can describe a response body size in bytes when that size is known, but dynamic or streamed responses may not provide it in the same way. Users usually cannot determine completeness from the folder entry alone.</p>
            <p>Do not concatenate two partial MP4 files or add random bytes. Container indexes, timestamps, and media samples must agree. For authorized media, one clean transfer from a fresh result is safer than trying to disguise an incomplete file as complete.</p>

            <h2>Check whether the public source is already incomplete</h2>
            <p>Some apparent cutoffs exist upstream: a creator published a preview, a Story expired, a post points to a highlight, a live archive is still processing, or the platform never retained the whole broadcast. Pullvio can only request the public rendition available at submission time; it cannot reconstruct missing sections from an earlier master.</p>
            <p>YouTube notes that live streams longer than 12 hours may not be captured at all and recommends a local backup. Its <a href="https://support.google.com/youtube/answer/6247592?hl=en">live archive guidance</a> is a useful source-boundary example: the final public archive may not equal the original broadcast. For your own production, check the local recording or editing master.</p>
            <p>If the official player itself stops at the same point, another downloader is unlikely to expose the missing ending. For someone else&apos;s content, ask the rights holder for an authorized complete copy rather than probing private, paid, removed, or region-restricted versions.</p>

            <h2>When one retry is justified</h2>
            <p>One new request is reasonable when the browser explicitly says Failed, the result URL expired before saving began, connectivity dropped, storage filled, or a fresh public source now has a longer completed rendition. Keep the same requested quality so the two file sizes and durations can be compared.</p>
            <p>Do not submit a rapid series of identical jobs. Pullvio and its provider may reuse an existing public result, and repeated provider calls can cost money without changing the source. If the second clean transfer ends at the same timestamp, stop and collect evidence.</p>
            <p>For an authorized YouTube link, return to the <Link href="/youtube-video-downloader">YouTube downloader</Link> only after confirming the first browser transfer failed or the public source changed. A quality label affects resolution, not the length of a finished source video.</p>

            <h2>When remuxing helps—and when it cannot</h2>
            <p>A remux can rebuild container indexes around media samples that are already present. It cannot recreate samples that never reached the device or extend a source that was short upstream. Preserve the original before any operation and inspect the output duration and final frames.</p>
            <p>If ffprobe can read valid streams beyond the point where one player stops, try a maintained second player before changing the file. When the second player reaches the end, the issue is more likely local indexing or compatibility. When every player and ffprobe stop at the same point, the missing section is not hidden behind a player setting.</p>
            <p>Avoid anonymous online “repair” pages for private recordings. Local tools and file properties answer the first questions without uploading content, and a rights holder&apos;s master is always a better recovery source.</p>

            <h2>What to send when reporting an early ending</h2>
            <p>Record the public URL, source duration, local duration, exact cutoff timestamp, platform, requested quality, file size, browser completion state, job time, device, and ffprobe output. Send those facts through the <Link href="/contact">contact page</Link> without cookies, tokens, private links, or unauthorized media.</p>
            <p>If the durations match but the picture looks poor, use the <Link href="/blog/downloaded-video-is-blurry">blurry-video guide</Link>. An early ending is a completeness or source-boundary problem; treating it as a resolution problem wastes another request.</p>
          </>,
        },
        "zh-cn": {
          eyebrow: "下载完整性排查",
          title: "为什么下载的视频会提前结束？",
          description: "对比来源与本地时长，检查浏览器是否完成传输、临时链接是否失效，以及文件容器记录的真实时长，避免无效重复下载。",
          readingTime: "约 9 分钟",
          body: <>
            <p>下载的视频可以播放，却在原视频之前提前结束，首先要区分“来源本来就短”和“浏览器只保存了一部分”。分别记下公开播放器与本地文件的精确时长，确认浏览器下载状态是完成，再查看文件流信息。Pullvio 任务显示 Ready，只说明临时结果已经生成，不代表全部字节已经进入你的设备。</p>
            <div className="content-callout"><strong>先记两个时间点</strong><p>记录来源显示的总时长和本地播放器的总时长，再写下实际中断的分秒。如果两边都在同一处结束，应检查剪辑、预览和直播归档；如果只有本地文件更短，优先检查浏览器传输、存储空间、临时链接和文件结构。</p></div>

            <h2>不要把页面时长当成单个视频时长</h2>
            <p>先确认比较的是同一个媒体项目。播放列表总时长、直播持续时间、帖子说明中的数字，不一定等于当前公开文件。一段 Reel、Short、Spotlight、高光或预览本来就可能只是完整作品的一部分。</p>
            <p>把本地进度条拖到靠近结尾的位置。如果跳回开头、固定卡在某一帧，或显示的总时长明显长于可播放内容，容器可能记录了不存在或损坏的样本；如果能顺利跳到最后一帧，且与公开播放器一致，则下载可能已经完整保存当前可用版本。</p>
            <p>排查期间先保留第一份文件，不要立刻覆盖。文件大小、完成时间和中断位置都是证据。完全无法打开的文件应使用<Link href="/zh-cn/blog/downloaded-mp4-wont-play">MP4 无法播放指南</Link>；本篇只处理能够开始播放、但结束过早的文件。</p>

            <h2>任务完成与浏览器下载完成是两件事</h2>
            <p>Pullvio 在上游生成临时结果链接后，可以把任务标记为 Ready。随后浏览器还要从该链接把文件传到手机或电脑。此时关闭页面、断网、存储不足、手动取消，或临时链接在重试前过期，都可能留下只有前半段的文件。</p>
            <p>请打开浏览器的“下载内容”，确认状态明确为“已完成”，不要只看通知横幅或文件夹里已经出现了 MP4。部分文件可能保留正常后缀，甚至能播放开头；网站无法在文件交给浏览器下载管理器后继续验证设备最终收到多少字节。</p>
            <p>个人中心保存的是任务记录和临时结果，不是永久云盘。结果出现后应及时开始保存，并等待浏览器完成。如果手机预览与本地文件容易混淆，可以参考<Link href="/zh-cn/blog/download-video-on-iphone-and-android">手机下载位置指南</Link>。</p>

            <h2>用本地文件信息核对时长和大小</h2>
            <p>电脑安装 FFmpeg 后，可用 ffprobe 同时读取容器时长、文件字节数和各个媒体流时长：</p>
            <pre><code>ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_type,duration -of default=noprint_wrappers=1 your-video.mp4</code></pre>
            <p>FFmpeg 的 <a href="https://ffmpeg.org/ffprobe.html">ffprobe 官方文档</a>说明，它会收集媒体流信息，并在无法打开或识别输入时返回失败。正数时长不能保证每一个媒体样本都健康，但时长明显短于来源、找不到流或提示 invalid data，已经比“看起来不对”更容易定位。</p>
            <p>文件大小只能在相同来源、格式和画质之间比较。480p 本来就应比 4K 小；如果两次请求参数完全一致，文件体积却相差巨大，再结合浏览器状态判断是否有一次没有传完。</p>

            <h2>暂停后为什么不一定可以续传</h2>
            <p>是否能续传取决于服务器和临时链接。MDN 的 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests">HTTP Range 请求说明</a>指出，支持字节范围的服务器可返回 <code>206 Partial Content</code>；不支持时，下载管理器可能只能从头传输。临时地址也可能在暂停到恢复之间失效。</p>
            <p>HTTP <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length">Content-Length</a> 在响应长度已知时表示消息体的字节数，动态生成或流式响应的长度表达可能不同。普通用户不能仅凭文件夹里出现了一个文件名，就确认传输已经完整。</p>
            <p>不要把两个残缺 MP4 直接拼接，也不要随意补字节。容器索引、时间戳和媒体样本必须一致。对获得授权的内容，从新鲜结果链接完成一次干净传输，比伪装一个残缺文件更可靠。</p>

            <h2>检查公开来源是否本来就缺少结尾</h2>
            <p>部分“提前结束”发生在来源端：创作者发布的是预览或高光，Story 已过期，直播归档还没处理完，或者平台根本没有保留完整直播。Pullvio 只能请求提交当时公开可用的版本，不能从已经消失的母版还原后半段。</p>
            <p>YouTube 官方<a href="https://support.google.com/youtube/answer/6247592?hl=zh-Hans">直播归档说明</a>指出，超过 12 小时的直播可能完全无法归档，并建议创作者保留本地备份。这是典型的来源边界：最终公开视频不一定等于当时完整直播。自己的内容应回到本地录制或剪辑母版核对。</p>
            <p>如果官方播放器也在同一处结束，换另一个下载器通常也找不到结尾。对于他人内容，应向权利人索取获得授权的完整版，不要尝试探测私人、付费、已删除或地区受限版本。</p>

            <h2>什么情况下值得重新请求一次</h2>
            <p>浏览器明确显示失败、开始保存前临时链接已过期、传输时断网、存储空间用完，或公开来源后来出现更长的完整版本时，可以重新创建一次任务。保持相同画质和格式，才能有意义地比较两份文件的大小与时长。</p>
            <p>不要快速连续提交完全相同的任务。Pullvio 与上游可能复用已有公开结果，重复调用会增加成本，却不会改变来源。如果第二次干净传输仍在同一秒结束，应停止尝试并整理证据。</p>
            <p>处理获得授权的 YouTube 链接时，只有确认第一次浏览器传输失败或公开来源已更新，才返回<Link href="/zh-cn/youtube-video-downloader">YouTube 视频下载器</Link>。画质选项决定分辨率上限，不负责延长视频。</p>

            <h2>重新封装可以修复什么</h2>
            <p>重新封装可以利用已经存在的媒体样本重建容器索引，但无法补回从未到达设备的数据，也无法延长来源端本来就短的视频。操作前保留原文件，并重新核对输出时长和最后几个画面。</p>
            <p>如果 ffprobe 能读取到中断点之后的有效流，而一个播放器提前停止，先换较新的第二个播放器。第二个能播放到结尾，更像本地索引或兼容问题；所有播放器和 ffprobe 都在同一处停止，则不存在一个隐藏开关可以显示后半段。</p>
            <p>私人录像不要随意上传到匿名“修复网站”。本地工具、文件属性和权利人的母版已经能完成第一轮判断，也不会额外泄露内容。</p>

            <h2>反馈问题时提供什么</h2>
            <p>请记录公开 URL、来源时长、本地时长、具体中断时间、平台、请求画质、文件大小、浏览器完成状态、任务时间、设备和 ffprobe 输出，通过<Link href="/zh-cn/contact">联系页面</Link>提交。不要附带 Cookie、令牌、私人链接或未经授权的媒体。</p>
            <p>如果两边时长一致、只是画面模糊，请改看<Link href="/zh-cn/blog/downloaded-video-is-blurry">视频模糊排查</Link>。提前结束属于完整性或来源边界问题，把它当成分辨率问题只会浪费一次请求。</p>
          </>,
        },
        es: {
          eyebrow: "INTEGRIDAD DEL ARCHIVO",
          title: "¿Por qué el video descargado termina antes de tiempo?",
          description: "Compara duración, estado del navegador, enlace temporal y metadatos para saber si falta parte del archivo o de la fuente pública.",
          readingTime: "9 min de lectura",
          body: <>
            <p>Cuando un video descargado empieza bien pero termina antes que la fuente, suele ocurrir una de dos cosas: la versión pública ya era más corta o el navegador guardó solo parte del resultado. Anota la duración exacta de ambos, confirma que la descarga figura como completada e inspecciona el archivo antes de repetir. Que Pullvio muestre Listo y que todos los bytes estén en el dispositivo son momentos distintos.</p>
            <div className="content-callout"><strong>Compara dos tiempos concretos</strong><p>Apunta la duración del reproductor público y la del archivo local en minutos y segundos. Si ambos acaban en el mismo punto, revisa si era un clip, un avance o un archivo de directo. Si solo el local es corto, investiga la transferencia, el espacio, la caducidad y los metadatos.</p></div>

            <h2>Asegúrate de comparar el mismo contenido</h2>
            <p>La duración de una lista, de una emisión o escrita en la descripción no siempre corresponde a un único archivo. Un Reel, Short, Spotlight, avance o momento destacado puede ofrecer legítimamente solo una parte del contenido que el título menciona.</p>
            <p>Arrastra la línea local cerca del final. Si vuelve atrás, se congela en un punto o anuncia más tiempo del que realmente reproduce, puede haber muestras ausentes o un índice incorrecto. Si permite llegar al último fotograma y coincide con la fuente pública, quizá ya conserva toda la versión disponible.</p>
            <p>Guarda el primer archivo durante el diagnóstico: tamaño, hora y segundo de corte son evidencia. La guía de <Link href="/es/blog/downloaded-mp4-wont-play">MP4 que no abre</Link> trata archivos que nunca empiezan; aquí el problema es un final prematuro.</p>

            <h2>Listo no significa transferencia local completada</h2>
            <p>Pullvio puede indicar Listo cuando el proveedor entrega una dirección temporal. Después el navegador debe transferir el resultado. Cerrar la pestaña, perder conexión, quedarse sin espacio, cancelar o intentar continuar cuando el enlace caducó puede dejar un archivo que solo contiene el comienzo.</p>
            <p>Abre Descargas y busca el estado Completado. No basta con una notificación ni con ver un nombre MP4 en la carpeta: una copia parcial puede conservar la extensión y reproducir sus primeros minutos. El sitio tampoco puede comprobar los bytes una vez que la descarga pasa al gestor del dispositivo.</p>
            <p>El historial conserva la tarea y un resultado temporal, no una nube permanente. Guarda pronto y espera al final. Si en el móvil no sabes si ves una vista previa o el archivo, consulta la <Link href="/es/blog/download-video-on-iphone-and-android">guía de archivos en iPhone y Android</Link>.</p>

            <h2>Lee la duración que declara el archivo</h2>
            <p>En un ordenador con FFmpeg, ffprobe muestra duración del contenedor, tamaño y duración de cada flujo:</p>
            <pre><code>ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_type,duration -of default=noprint_wrappers=1 tu-video.mp4</code></pre>
            <p>La <a href="https://ffmpeg.org/ffprobe.html">documentación oficial de ffprobe</a> explica que analiza flujos multimedia y devuelve error cuando no reconoce la entrada. Una duración positiva no certifica todas las muestras, pero una cifra muy inferior a la fuente, flujos ausentes o “invalid data” ofrecen una señal concreta.</p>
            <p>Compara tamaños solo entre la misma fuente, formato y calidad. Un archivo 480p debe pesar menos que uno 4K. Si dos intentos idénticos tienen una diferencia enorme, relaciona el tamaño con el estado del navegador y la hora de caducidad.</p>

            <h2>Por qué una pausa no siempre permite continuar</h2>
            <p>La reanudación depende del servidor y de la URL. La guía de MDN sobre <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests">peticiones HTTP por rangos</a> indica que un servidor compatible puede contestar <code>206 Partial Content</code>; sin esa función, el gestor quizá deba empezar de cero. Además, una dirección temporal puede vencer durante la pausa.</p>
            <p>La cabecera <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length">Content-Length</a> expresa bytes cuando el tamaño del cuerpo se conoce, mientras que una respuesta dinámica o transmitida por partes puede comportarse de otra forma. La presencia del archivo en una carpeta no demuestra por sí sola que llegó entero.</p>
            <p>No unas dos copias parciales ni añadas bytes al azar. Índices, tiempos y muestras deben concordar. Para contenido autorizado, una transferencia limpia desde un resultado nuevo es más segura que intentar ocultar el daño.</p>

            <h2>La fuente pública también puede estar recortada</h2>
            <p>Un final ausente puede venir de arriba: el creador publicó un avance, la Story expiró, el directo todavía se procesa o la plataforma nunca conservó toda la emisión. Pullvio solo puede solicitar la versión pública existente en ese momento; no reconstruye un máster anterior.</p>
            <p>YouTube advierte que una transmisión de más de 12 horas puede no archivarse y recomienda conservar copia local. Su <a href="https://support.google.com/youtube/answer/6247592?hl=es">ayuda sobre archivos de directos</a> muestra por qué el video público final puede diferir de la emisión. Para una obra propia, comprueba la grabación o el proyecto original.</p>
            <p>Si el reproductor oficial termina en el mismo segundo, otro descargador difícilmente encontrará el resto. Para una obra ajena, pide al titular una copia completa autorizada; no explores versiones privadas, de pago, eliminadas o bloqueadas.</p>

            <h2>Haz un segundo intento solo con una razón</h2>
            <p>Tiene sentido crear una tarea nueva si el navegador marcó Fallido, la URL venció antes de empezar, se cortó la red, faltó espacio o la fuente pública terminó de preparar una versión más larga. Mantén formato y calidad para comparar resultados equivalentes.</p>
            <p>No envíes una serie rápida de trabajos iguales. Pullvio y el proveedor pueden reutilizar un resultado público, y las solicitudes repetidas generan coste sin cambiar la fuente. Si la segunda transferencia limpia corta en el mismo instante, detente.</p>
            <p>Para un enlace autorizado de YouTube, vuelve al <Link href="/es/youtube-video-downloader">descargador de YouTube</Link> únicamente cuando la primera transferencia falló o la fuente cambió. Elegir 4K modifica resolución, no duración.</p>

            <h2>Qué puede arreglar una nueva encapsulación</h2>
            <p>Volver a encapsular puede reconstruir índices alrededor de muestras que ya existen. No inventa las que nunca llegaron ni alarga una fuente corta. Conserva el original y revisa duración y últimos fotogramas del resultado.</p>
            <p>Si ffprobe reconoce datos después del punto donde una aplicación se detiene, prueba un segundo reproductor actualizado. Si este llega al final, investiga compatibilidad o índice local. Si todos y ffprobe terminan igual, no hay una preferencia del reproductor que revele la parte ausente.</p>
            <p>No subas grabaciones privadas a páginas anónimas de reparación. Las propiedades locales, herramientas confiables y el máster del titular responden primero sin exponer el contenido.</p>

            <h2>Cómo informar del corte con datos útiles</h2>
            <p>Anota URL pública, duración fuente y local, segundo exacto, plataforma, calidad, tamaño, estado del navegador, hora, dispositivo y salida de ffprobe. Envíalo mediante <Link href="/es/contact">Contacto</Link>, sin cookies, tokens, enlaces privados ni archivos no autorizados.</p>
            <p>Si las duraciones coinciden pero la imagen es pobre, utiliza el <Link href="/es/blog/downloaded-video-is-blurry">diagnóstico de video borroso</Link>. Un final temprano es un problema de integridad o de fuente, no de resolución.</p>
          </>,
        },
      },
    },
  },
];
