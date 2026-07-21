import type { ReactNode } from "react";
import Link from "next/link";
import type { BlogPost } from "./blog";

function TechnicalArticle({
  intro,
  takeaways,
  sections,
  faq,
  closing,
  takeawaysLabel = "Key takeaways",
  faqLabel = "Frequently asked questions",
}: {
  intro: ReactNode;
  takeaways: string[];
  sections: Array<[string, ReactNode]>;
  faq: Array<[string, ReactNode]>;
  closing?: ReactNode;
  takeawaysLabel?: string;
  faqLabel?: string;
}) {
  return (
    <>
      <p>{intro}</p>
      <div className="content-callout">
        <strong>{takeawaysLabel}</strong>
        <ul>
          {takeaways.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      {sections.map(([title, content]) => (
        <section key={title}>
          <h2>{title}</h2>
          {content}
        </section>
      ))}
      <h2>{faqLabel}</h2>
      {faq.map(([question, answer]) => (
        <section key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </section>
      ))}
      {closing && <div className="content-callout">{closing}</div>}
    </>
  );
}

export const technicalBlogPosts: BlogPost[] = [
  {
    slug: "soundcloud-mp3-quality-and-bitrate",
    published: "2026-07-21",
    modified: "2026-07-21",
    category: { en: "SoundCloud", "zh-cn": "SoundCloud", es: "SoundCloud" },
    copy: {
      en: {
        eyebrow: "SOUNDCLOUD AUDIO QUALITY",
        title: "SoundCloud MP3 quality and bitrate explained.",
        description: "Learn how SoundCloud source streams, 128 and 320 kbps labels, MP3 re-encoding, and original downloads affect real audio quality.",
        readingTime: "7 min read",
        body: (
          <TechnicalArticle
            intro={
              <>
                SoundCloud MP3 quality is determined first by the audio that is
                actually available from the source—not by the number written on
                the exported file. SoundCloud creates streaming versions of an
                upload, while an uploader-enabled official download can provide
                the original uploaded file. Re-encoding a compressed stream as
                a 320 kbps MP3 makes a larger file, but it cannot restore detail
                removed before that conversion.
              </>
            }
            takeaways={[
              "The original upload, an official download, and a public playback stream are not necessarily the same file.",
              "A 320 kbps output label describes the new encoding rate, not proof of 320 kbps source quality.",
              "Lossy-to-lossy conversion can add artifacts and never recreates missing frequencies or detail.",
              "Use SoundCloud’s official Download file option when the creator enables it and you need the uploaded original.",
            ]}
            sections={[
              [
                "Original download versus SoundCloud streaming audio",
                <>
                  <p>
                    SoundCloud says that creators can enable or disable direct
                    downloads for individual tracks. When enabled, the official
                    <em> Download file</em> action gives the listener a copy in
                    the original format uploaded by the creator. Not every
                    track enables that option, and whole playlists cannot be
                    downloaded through it. See SoundCloud&apos;s official guide to{" "}
                    <a href="https://help.soundcloud.com/hc/en-us/articles/115003448787-Downloading-tracks">
                      downloading tracks
                    </a>
                    .
                  </p>
                  <p>
                    Playback is different. SoundCloud transcodes uploads into
                    streaming renditions so they can play across devices and
                    connections. Its upload documentation currently describes
                    128 kbps MP3 and 64 kbps Opus streaming versions, plus a 256
                    kbps AAC version for eligible audio. Those renditions are
                    delivery formats; they do not tell you the bit depth,
                    sample rate, or quality of the creator&apos;s uploaded master.
                  </p>
                </>,
              ],
              [
                "What 128 kbps and 320 kbps really mean",
                <>
                  <p>
                    Bitrate is the amount of encoded data used per second. For
                    a constant-bitrate MP3, 320 kbps uses about 2.5 times as
                    much data per second as 128 kbps. That can allow a new
                    encoder to retain more information when both files start
                    from the same clean master, but the comparison changes
                    when the input has already been compressed.
                  </p>
                  <p>
                    Suppose a public source has already passed through lossy
                    encoding. Exporting it again at 320 kbps cannot infer the
                    discarded signal. The output may report 320 kbps in a file
                    inspector, yet its audible ceiling still comes from the
                    earlier source. The higher number is therefore not evidence
                    of a lossless or original-quality SoundCloud download.
                  </p>
                </>,
              ],
              [
                "Why MP3 conversion cannot improve the source",
                <>
                  <p>
                    MP3 is a lossy codec. Encoding analyzes the audio and
                    removes information according to its psychoacoustic model
                    and target settings. Decoding reconstructs playable audio,
                    not the exact data that was removed. A second encode makes
                    another set of decisions from that already altered signal.
                  </p>
                  <p>
                    FFmpeg&apos;s official libmp3lame documentation distinguishes
                    target bitrate from quality-based variable bitrate and
                    exposes encoder-quality controls. These settings influence
                    how the new MP3 is made; none is an upscaler for lost audio.
                    Review the{" "}
                    <a href="https://ffmpeg.org/ffmpeg-codecs.html#libmp3lame">
                      FFmpeg MP3 encoder options
                    </a>{" "}
                    for the technical distinction.
                  </p>
                </>,
              ],
              [
                "How to judge a downloaded SoundCloud MP3",
                <>
                  <ul>
                    <li>
                      Identify whether the file came from the creator-enabled
                      official download or from an authorized public playback
                      source.
                    </li>
                    <li>
                      Check codec, bitrate mode, sample rate, channels, and
                      duration with a trusted media inspector.
                    </li>
                    <li>
                      Listen for pre-echo, smeared transients, watery high
                      frequencies, clipping, and unexpected silence.
                    </li>
                    <li>
                      Compare against a source you control when quality matters;
                      do not judge by file size or filename alone.
                    </li>
                  </ul>
                  <p>
                    Spectrograms can reveal obvious bandwidth limits or
                    discontinuities, but they do not prove provenance and
                    should not be treated as a simple “lossless detector.” For
                    production work, ask the creator for the original WAV,
                    FLAC, or other master instead of converting a playback
                    stream repeatedly.
                  </p>
                </>,
              ],
              [
                "Choose the right SoundCloud download path",
                <>
                  <p>
                    If the creator has enabled SoundCloud&apos;s official download,
                    use it when you need the uploaded file. If you are saving
                    your own public track or another track you are authorized
                    to keep as a convenient MP3, Pullvio&apos;s{" "}
                    <Link href="/soundcloud-downloader">
                      SoundCloud downloader
                    </Link>{" "}
                    provides an audio-only browser workflow. It does not claim
                    that a converted public source is lossless or a genuine 320
                    kbps master.
                  </p>
                  <p>
                    Downloading does not grant publishing, sampling, remixing,
                    or commercial rights. Keep the artist, source URL, license,
                    and permission record with the file, and review the{" "}
                    <Link href="/guides/save-online-media-legally">
                      responsible media-saving guide
                    </Link>{" "}
                    before reuse.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "Is a SoundCloud MP3 always 128 kbps?",
                <>
                  No. SoundCloud documents multiple streaming renditions, and
                  an official creator-enabled download can be the original
                  uploaded format. Inspect the specific file and identify how
                  it was obtained rather than assuming one bitrate.
                </>,
              ],
              [
                "Does converting SoundCloud to 320 kbps improve quality?",
                <>
                  Not when the available input is already compressed. A 320
                  kbps encode may reduce additional damage compared with a
                  lower-rate new encode, but it cannot restore information that
                  the source no longer contains.
                </>,
              ],
              [
                "Is a SoundCloud MP3 lossless?",
                <>
                  MP3 is a lossy format. An official download could instead be
                  WAV, FLAC, or another original format if that is what the
                  creator uploaded and chose to share.
                </>,
              ],
              [
                "Can I download an entire SoundCloud playlist?",
                <>
                  SoundCloud&apos;s official download feature applies to individual
                  tracks, not whole playlists. Pullvio likewise focuses on
                  direct, public track links and does not bypass private or
                  login-only access.
                </>,
              ],
            ]}
          />
        ),
      },
      "zh-cn": {
        eyebrow: "SOUNDCLOUD 音质",
        title: "SoundCloud MP3 音质与码率：下载后到底得到什么？",
        description: "了解 SoundCloud 来源音频、128 与 320 kbps 标签、MP3 再次编码和原始文件下载如何影响真实音质。",
        readingTime: "约 7 分钟",
        body: (
          <TechnicalArticle
            takeawaysLabel="核心结论"
            faqLabel="常见问题"
            intro={
              <>
                SoundCloud MP3
                的真实音质首先取决于来源实际提供的音频，而不是导出文件上写着多少
                kbps。SoundCloud 会为上传内容生成流媒体版本；如果上传者开启官方下载，用户也可能获得原始上传文件。把已经压缩的音频再次编码成
                320 kbps，只会生成更大的文件，不能恢复此前已经丢失的声音细节。
              </>
            }
            takeaways={[
              "原始上传文件、官方下载文件与公开播放流不一定是同一个文件。",
              "输出显示 320 kbps，只说明这次编码使用的码率，不证明来源具有 320 kbps 的真实细节。",
              "有损格式再次转成有损格式可能增加失真，无法重建已经丢失的频率与细节。",
              "当创作者开放官方下载且您需要上传原件时，应优先使用 SoundCloud 官方的下载文件功能。",
            ]}
            sections={[
              [
                "原始文件下载与 SoundCloud 播放流有什么区别",
                <>
                  <p>
                    SoundCloud
                    允许创作者为单条音轨开启或关闭直接下载。开启后，网页上的“下载文件”会向听众提供创作者最初上传的文件格式。并非所有音轨都开放这一功能，播放列表也不能整体通过官方下载。具体规则可查看 SoundCloud 官方的
                    <a href="https://help.soundcloud.com/hc/en-us/articles/115003448787-Downloading-tracks">
                      音轨下载说明
                    </a>
                    。
                  </p>
                  <p>
                    在线播放是另一条路径。SoundCloud
                    会将上传内容转码为适合不同设备与网络的流媒体版本。其上传文档目前列出
                    128 kbps MP3、64 kbps Opus，以及符合条件音频的 256 kbps AAC。这些是播放交付格式，不能反推创作者母带的位深、采样率或制作质量。
                  </p>
                </>,
              ],
              [
                "128 kbps 与 320 kbps 真正代表什么",
                <>
                  <p>
                    码率表示编码音频每秒使用的数据量。对于恒定码率 MP3，320 kbps 每秒使用的数据约为 128 kbps 的 2.5 倍。如果两次编码都从同一个干净母带开始，更高码率通常能让编码器保留更多信息；但输入已经压缩时，情况不同。
                  </p>
                  <p>
                    假设公开来源已经经过有损压缩，再导出为 320 kbps
                    无法推测或恢复被丢弃的信号。文件检测工具可能显示 320 kbps，但可听细节上限仍由前一个来源决定。因此，更大的数字不等于无损，也不等于拿到了 SoundCloud 原始文件。
                  </p>
                </>,
              ],
              [
                "为什么 MP3 转换不能提升来源音质",
                <>
                  <p>
                    MP3 属于有损编码。编码器会分析声音，并根据听觉模型与目标设置移除部分信息；解码只能重建可播放信号，无法找回被删除的原始数据。再次编码会在已经改变的信号上做新一轮取舍。
                  </p>
                  <p>
                    FFmpeg 官方 libmp3lame
                    文档区分目标码率、可变码率与编码器质量设置。这些参数决定新的 MP3
                    如何生成，却都不是音频细节“放大器”。技术差异可参考
                    <a href="https://ffmpeg.org/ffmpeg-codecs.html#libmp3lame">
                      FFmpeg MP3 编码器文档
                    </a>
                    。
                  </p>
                </>,
              ],
              [
                "如何判断下载后的 SoundCloud MP3",
                <>
                  <ul>
                    <li>先确认文件来自创作者开放的官方下载，还是获得授权的公开播放来源。</li>
                    <li>用可信工具检查编码、码率模式、采样率、声道和时长。</li>
                    <li>试听瞬态模糊、高频水声、削波、异常静音等问题。</li>
                    <li>重要文件应与您掌握的来源对比，不要只看文件名和大小。</li>
                  </ul>
                  <p>
                    频谱图能帮助发现明显的带宽限制或中断，但不能单独证明文件来源，也不是简单的“无损检测器”。用于制作时，应向创作者索取 WAV、FLAC 或其他母带，而不是反复转换播放流。
                  </p>
                </>,
              ],
              [
                "选择正确的 SoundCloud 保存方式",
                <>
                  <p>
                    如果创作者开放了 SoundCloud 官方下载，并且您需要上传文件本身，应优先使用官方入口。如果您要保存自己的公开音轨，或有权把其他公开音轨保存为方便使用的 MP3，可使用 Pullvio 的
                    <Link href="/zh-cn/soundcloud-downloader">
                      SoundCloud 下载器
                    </Link>
                    。它不会把公开来源转换后的文件宣传成无损或真正的 320 kbps 母带。
                  </p>
                  <p>
                    下载不会自动授予发布、采样、混音或商业使用权。请保留艺术家、来源链接、许可与授权记录，并在复用前阅读
                    <Link href="/zh-cn/guides/save-online-media-legally">
                      负责任保存在线媒体指南
                    </Link>
                    。
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "SoundCloud MP3 都是 128 kbps 吗？",
                <>
                  不是。SoundCloud 官方列出了多个流媒体版本；创作者开放的官方下载还可能提供原始上传格式。应检查具体文件及其获取方式，而不是默认一个码率。
                </>,
              ],
              [
                "转成 320 kbps 会提升 SoundCloud 音质吗？",
                <>
                  如果输入已经压缩，就不会恢复音质。相较于更低码率的再次编码，320 kbps
                  可能减少这一轮新增损失，但无法找回来源中已经不存在的信息。
                </>,
              ],
              [
                "SoundCloud MP3 是无损的吗？",
                <>
                  不是，MP3 是有损格式。如果创作者上传并开放的是 WAV、FLAC
                  等格式，官方原始文件下载可能提供无损文件。
                </>,
              ],
              [
                "可以下载整个 SoundCloud 播放列表吗？",
                <>
                  SoundCloud 官方下载只针对单条音轨，不支持整张播放列表。Pullvio
                  也只处理直接的公开音轨链接，不绕过私人或登录访问。
                </>,
              ],
            ]}
          />
        ),
      },
      es: {
        eyebrow: "CALIDAD DE AUDIO SOUNDCLOUD",
        title: "Calidad y bitrate de SoundCloud MP3.",
        description: "Descubre cómo la fuente de SoundCloud, 128 y 320 kbps, la recodificación MP3 y la descarga original afectan la calidad real.",
        readingTime: "7 min de lectura",
        body: (
          <TechnicalArticle
            takeawaysLabel="Conclusiones clave"
            faqLabel="Preguntas frecuentes"
            intro={
              <>
                La calidad de un MP3 de SoundCloud depende primero del audio que
                ofrece la fuente, no del número escrito en el archivo final.
                SoundCloud crea versiones para streaming, mientras que una
                descarga oficial habilitada por el autor puede entregar el
                archivo original. Recodificar un flujo comprimido a 320 kbps
                aumenta el tamaño, pero no recupera el detalle eliminado antes.
              </>
            }
            takeaways={[
              "La subida original, la descarga oficial y el audio público de reproducción pueden ser archivos distintos.",
              "Una salida de 320 kbps describe la nueva codificación, no demuestra que la fuente tenga esa calidad.",
              "Convertir entre formatos con pérdida puede añadir artefactos y no reconstruye información eliminada.",
              "Usa Descargar archivo de SoundCloud cuando el creador lo habilite y necesites el original subido.",
            ]}
            sections={[
              [
                "Descarga original frente al audio de streaming",
                <>
                  <p>
                    SoundCloud permite que el creador active o desactive la
                    descarga directa de cada pista. Cuando está disponible,
                    <em> Descargar archivo</em> entrega una copia en el formato
                    original subido. No todas las pistas lo permiten y no se
                    pueden descargar listas completas mediante esa función.
                    Consulta la guía oficial para{" "}
                    <a href="https://help.soundcloud.com/hc/es/articles/115003448787-Descargando-pistas">
                      descargar pistas
                    </a>
                    .
                  </p>
                  <p>
                    La reproducción sigue otra ruta. SoundCloud transcodifica
                    las subidas para diferentes dispositivos y conexiones. Su
                    documentación menciona versiones de 128 kbps MP3 y 64 kbps
                    Opus, además de 256 kbps AAC para audio compatible. Son
                    formatos de entrega y no revelan la calidad del máster del
                    creador.
                  </p>
                </>,
              ],
              [
                "Qué significan realmente 128 y 320 kbps",
                <>
                  <p>
                    El bitrate indica cuántos datos codificados se usan por
                    segundo. En MP3 de bitrate constante, 320 kbps usa unas 2,5
                    veces más información por segundo que 128 kbps. Desde un
                    mismo máster limpio, el valor superior puede conservar más
                    información; con una entrada ya comprimida, no recupera lo
                    perdido.
                  </p>
                  <p>
                    Un archivo recodificado puede mostrar 320 kbps en un
                    inspector, pero su techo audible sigue limitado por la
                    fuente anterior. Esa cifra no demuestra que sea una
                    descarga sin pérdida ni el original de SoundCloud.
                  </p>
                </>,
              ],
              [
                "Por qué convertir a MP3 no mejora la fuente",
                <>
                  <p>
                    MP3 es un códec con pérdida. El codificador descarta
                    información según un modelo psicoacústico y los ajustes
                    elegidos. Al decodificar se reconstruye audio reproducible,
                    no los datos exactos eliminados. Una segunda codificación
                    toma nuevas decisiones sobre una señal ya modificada.
                  </p>
                  <p>
                    La documentación oficial de libmp3lame en FFmpeg distingue
                    bitrate objetivo, bitrate variable y calidad del
                    codificador. Esos controles cambian cómo se crea el nuevo
                    MP3, pero no aumentan el detalle perdido. Consulta las{" "}
                    <a href="https://ffmpeg.org/ffmpeg-codecs.html#libmp3lame">
                      opciones del codificador MP3 de FFmpeg
                    </a>
                    .
                  </p>
                </>,
              ],
              [
                "Cómo evaluar un MP3 descargado de SoundCloud",
                <>
                  <ul>
                    <li>
                      Identifica si procede de la descarga oficial del creador
                      o de una fuente pública que puedes guardar.
                    </li>
                    <li>
                      Revisa códec, modo de bitrate, frecuencia de muestreo,
                      canales y duración.
                    </li>
                    <li>
                      Escucha transitorios borrosos, agudos acuosos, clipping y
                      silencios inesperados.
                    </li>
                    <li>
                      Compara con una fuente conocida; no confíes solo en el
                      nombre o el tamaño.
                    </li>
                  </ul>
                  <p>
                    Un espectrograma puede mostrar límites claros de ancho de
                    banda, pero no demuestra por sí solo el origen ni si un
                    archivo es realmente sin pérdida. Para producción, solicita
                    al creador el WAV, FLAC u otro máster.
                  </p>
                </>,
              ],
              [
                "Elige la ruta correcta para descargar de SoundCloud",
                <>
                  <p>
                    Si el autor habilitó la descarga oficial y necesitas la
                    subida original, usa esa opción. Para descargar de
                    SoundCloud una pista pública propia o autorizada como MP3,
                    abre el{" "}
                    <Link href="/es/soundcloud-downloader">
                      descargador de SoundCloud
                    </Link>
                    . Pullvio no presenta una conversión de audio público como
                    máster sin pérdida o 320 kbps genuinos.
                  </p>
                  <p>
                    Descargar música de SoundCloud no concede derechos para
                    publicar, samplear, remezclar o usar comercialmente. Guarda
                    artista, URL, licencia y permiso, y consulta la{" "}
                    <Link href="/es/guides/save-online-media-legally">
                      guía de uso responsable
                    </Link>{" "}
                    antes de reutilizar.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "¿Todos los MP3 de SoundCloud son de 128 kbps?",
                <>
                  No. SoundCloud documenta varias versiones de streaming y una
                  descarga oficial puede ser el formato original. Inspecciona
                  el archivo y su procedencia en vez de asumir un bitrate.
                </>,
              ],
              [
                "¿Convertir SoundCloud a 320 kbps mejora la calidad?",
                <>
                  No si la entrada ya está comprimida. Puede limitar daños
                  adicionales frente a una nueva codificación de menor bitrate,
                  pero no recupera información ausente.
                </>,
              ],
              [
                "¿Un MP3 de SoundCloud es sin pérdida?",
                <>
                  MP3 tiene pérdida. Una descarga oficial podría ser WAV, FLAC
                  u otro formato original si el creador lo subió y decidió
                  compartirlo.
                </>,
              ],
              [
                "¿Puedo descargar una lista completa de SoundCloud?",
                <>
                  La descarga oficial se aplica a pistas individuales, no a
                  listas completas. Pullvio también se centra en enlaces
                  directos y públicos, sin evitar accesos privados.
                </>,
              ],
            ]}
          />
        ),
      },
    },
  },
  {
    slug: "how-online-video-downloaders-work",
    published: "2026-07-16",
    category: { en: "Engineering", "zh-cn": "工程原理", es: "Ingeniería" },
    copy: {
      en: {
        eyebrow: "INSIDE THE PIPELINE",
        title: "How online video downloaders work: an engineering view.",
        description:
          "A practical look at URL analysis, stream selection, remuxing, temporary storage, and browser delivery inside an online video downloader.",
        readingTime: "9 min read",
        body: (
          <TechnicalArticle
            intro={
              <>
                An online video downloader is usually a small media-processing
                pipeline, not one download command. It validates a URL,
                discovers the media available to an authorized session, selects
                compatible tracks, packages them into a usable file, and
                delivers that file to the browser. Those stages explain why some
                links finish quickly while others fail, take longer, or offer
                fewer formats.
              </>
            }
            takeaways={[
              "A watch-page URL is often only the starting point; a manifest may describe the real media.",
              "Video, audio, captions, and thumbnails can be separate resources.",
              "Remuxing can preserve encoded quality, while transcoding creates new encoded streams.",
              "A responsible service isolates jobs, expires temporary data, and never treats a public URL as permission.",
            ]}
            sections={[
              [
                "Stage 1: validate the URL and define the job",
                <>
                  <p>
                    The first engineering task is input control. A service
                    should accept only supported HTTP or HTTPS URLs, normalize
                    harmless variations, reject malformed input, and block
                    requests to private network addresses. A backend fetcher
                    must not become a route into internal services.
                  </p>
                  <p>
                    The system also creates a job with a user, quota, requested
                    output, and expiration time. A video request and an
                    audio-only request may share the same source URL but follow
                    different stream-selection rules. Rate limits protect both
                    the service and the source from abusive traffic.
                  </p>
                </>,
              ],
              [
                "Stage 2: discover metadata and media streams",
                <>
                  <p>
                    A watch page is commonly HTML rather than the media file.
                    The processing layer may identify a direct file or read a
                    manifest listing representations by codec, resolution,
                    bitrate, language, and track type. FFmpeg describes demuxers
                    as components that read inputs and expose their elementary
                    streams and metadata. Its DASH demuxer similarly presents
                    streams found in a manifest. See the{" "}
                    <a href="https://ffmpeg.org/ffmpeg-formats.html">
                      official FFmpeg formats documentation
                    </a>
                    .
                  </p>
                  <p>
                    This stage should produce a truthful choice list. If a
                    source exposes 720p and 1080p but no 4K representation, the
                    interface should not advertise 4K. If the best video
                    representation has no sound, the processor must also find
                    compatible audio.
                  </p>
                </>,
              ],
              [
                "Stage 3: select a compatible combination",
                <>
                  <p>
                    Resolution alone is not enough. Selection must consider
                    video codec, audio codec, container, duration, estimated
                    size, and target-device support. MP4 names a container; it
                    does not guarantee that every player can decode every codec
                    inside it. MDN’s{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Video_processing_concepts">
                      video processing overview
                    </a>{" "}
                    explains containers, demuxing, and decoding.
                  </p>
                  <p>
                    A 3840 × 2160 frame contains 8,294,400 pixels—four times the
                    2,073,600 pixels in 1920 × 1080. Higher-resolution jobs
                    therefore tend to transfer more data, but bitrate, duration,
                    frame rate, codec, and image complexity still determine the
                    final size.
                  </p>
                </>,
              ],
              [
                "Stage 4: transfer, verify, and assemble",
                <>
                  <p>
                    A worker downloads selected resources into an isolated
                    temporary location, verifies the expected tracks, and
                    packages them. When source codecs fit the destination
                    container, stream copy can move encoded packets without
                    decoding and encoding. The{" "}
                    <a href="https://ffmpeg.org/ffmpeg.html">
                      FFmpeg documentation
                    </a>{" "}
                    notes that stream copy is fast and avoids quality loss,
                    although it cannot solve every compatibility problem.
                  </p>
                  <p>
                    Transcoding decodes and encodes again. It can resize video
                    or change an unsupported codec, but it consumes more CPU and
                    is usually lossy. A sound pipeline remuxes when possible and
                    transcodes only when the requested output requires it.
                  </p>
                </>,
              ],
              [
                "Stage 5: deliver and expire temporary data",
                <>
                  <p>
                    After verification, the service can create a short-lived
                    delivery URL or stream the result through an authenticated
                    endpoint. The browser writes the response to its Downloads
                    location. Account history may keep job metadata, but source
                    segments and finished files should have a defined retention
                    window.
                  </p>
                  <p>
                    Good architecture separates metadata from large binary
                    objects, records enough events to diagnose failures without
                    logging sensitive tokens, and prevents one user from
                    guessing another user’s job or download URL.
                  </p>
                </>,
              ],
              [
                "Why links fail—and what good errors explain",
                <>
                  <ul>
                    <li>
                      The page is private, deleted, region restricted, age
                      restricted, or requires a session.
                    </li>
                    <li>
                      The source is still live and has no final media asset.
                    </li>
                    <li>
                      The platform changed its page or manifest structure.
                    </li>
                    <li>
                      Tracks cannot enter the requested container without
                      conversion.
                    </li>
                    <li>
                      A request timed out, was rate-limited, or returned
                      incomplete segments.
                    </li>
                    <li>
                      The source uses DRM or another access control that the
                      service must not bypass.
                    </li>
                  </ul>
                  <p>
                    Look for honest format labels, source-quality limits, useful
                    errors, predictable quotas, and published privacy and
                    acceptable-use policies. Our{" "}
                    <Link href="/blog/online-video-downloader-safety-checklist">
                      online downloader safety checklist
                    </Link>{" "}
                    covers the user-facing signals.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "Does everything happen inside the browser?",
                <>
                  Usually not. The interface runs in the browser, but discovery,
                  large transfers, track assembly, and format conversion
                  commonly run on backend workers. Browser-only processing is
                  limited by cross-origin rules, memory, battery, and codec
                  support.
                </>,
              ],
              [
                "Does remuxing reduce quality?",
                <>
                  Stream-copy remuxing changes packaging without re-encoding
                  tracks, so it normally preserves encoded quality. Transcoding
                  creates new streams and can change quality, bitrate,
                  resolution, and size.
                </>,
              ],
              [
                "Why can a short video take longer than a long one?",
                <>
                  Duration is only one variable. Source speed, segment count,
                  resolution, conversion, queue load, and retries all matter. A
                  short 4K transcode can require more work than a long 720p
                  remux.
                </>,
              ],
            ]}
            closing={
              <>
                <strong>Try the workflow responsibly</strong>
                <p>
                  Use Pullvio’s{" "}
                  <Link href="/vimeo-video-downloader">
                    Vimeo video downloader
                  </Link>{" "}
                  or{" "}
                  <Link href="/tiktok-video-downloader">
                    TikTok video downloader
                  </Link>{" "}
                  only for media you own or are authorized to save.
                </p>
              </>
            }
          />
        ),
      },
      "zh-cn": {
        eyebrow: "走进处理管线",
        title: "在线视频下载器如何工作：从工程角度拆解。",
        description:
          "从 URL 解析、媒体流选择、转封装、临时存储到浏览器交付，拆解在线视频下载器的处理管线。",
        readingTime: "约 9 分钟",
        body: (
          <TechnicalArticle
            takeawaysLabel="核心结论"
            faqLabel="常见问题"
            intro={
              <>
                在线视频下载器通常是一条小型媒体处理管线，而不是简单执行一次“下载”。它需要验证
                URL、发现授权会话可访问的媒体来源、选择兼容轨道、打包文件，再交付给浏览器。理解这些阶段，就能解释为什么有些链接很快完成，而另一些会失败、等待更久或提供较少格式。
              </>
            }
            takeaways={[
              "观看页 URL 往往只是入口，真实媒体可能由清单文件描述。",
              "视频、音频、字幕和缩略图可以是独立资源。",
              "转封装可以保留编码质量，转码则创建新的编码流。",
              "负责任的服务应隔离任务、清理临时数据，也不会把公开链接当成许可。",
            ]}
            sections={[
              [
                "阶段一：验证 URL 并定义任务",
                <>
                  <p>
                    第一项工程工作是输入控制。服务应只接受受支持的 HTTP 或 HTTPS
                    URL，统一无害差异，拒绝错误输入，并阻止后端访问私有网络地址。负责抓取来源的服务器不应成为进入内部系统的通道。
                  </p>
                  <p>
                    系统还会记录用户、额度、输出格式和过期时间。视频任务与纯音频任务可以共享来源
                    URL，但媒体流选择规则不同；速率限制则保护服务与来源平台。
                  </p>
                </>,
              ],
              [
                "阶段二：发现元数据与媒体流",
                <>
                  <p>
                    观看页面通常是
                    HTML，而非媒体文件。处理层需要定位直接文件，或读取包含编码、分辨率、码率、语言和轨道类型的清单。FFmpeg
                    将 demuxer
                    描述为读取输入并暴露基本媒体流与元数据的组件，可参考
                    <a href="https://ffmpeg.org/ffmpeg-formats.html">
                      官方格式文档
                    </a>
                    。
                  </p>
                  <p>
                    系统应生成真实列表：来源只有 720p 和 1080p 时不能虚构
                    4K；高分辨率来源只有画面时，还必须找到兼容音轨。
                  </p>
                </>,
              ],
              [
                "阶段三：选择兼容组合",
                <>
                  <p>
                    仅看分辨率不够，还要考虑音视频编码、容器、时长、预估大小和目标设备。MP4
                    是容器，不代表内部所有编码都能被每台设备播放。MDN 的
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Video_processing_concepts">
                      视频处理概念
                    </a>
                    解释了容器、解复用与解码。
                  </p>
                  <p>
                    3840 × 2160 每帧包含 8,294,400 个像素，是 1920 × 1080
                    的四倍；但最终大小仍取决于码率、时长、帧率、编码与画面复杂度。
                  </p>
                </>,
              ],
              [
                "阶段四：传输、校验与合并",
                <>
                  <p>
                    工作节点把资源下载到隔离目录，确认轨道完整，再进行打包。来源编码适合目标容器时，可以通过
                    stream copy 移动编码数据包，无需重新编码。
                    <a href="https://ffmpeg.org/ffmpeg.html">FFmpeg 官方文档</a>
                    说明，这种方式速度快且不会造成质量损失。
                  </p>
                  <p>
                    转码会先解码再编码，可以调整分辨率或转换不兼容编码，但更耗
                    CPU，而且通常有损。良好管线会优先安全转封装。
                  </p>
                </>,
              ],
              [
                "阶段五：交付并清理临时数据",
                <>
                  <p>
                    校验通过后，服务生成短期有效的交付
                    URL，或通过鉴权端点发送文件。账户历史可以保留任务元数据，但来源片段和成品应有明确清理期限。
                  </p>
                  <p>
                    合理架构还会把元数据与大文件分开存储，记录足以诊断失败但不暴露敏感令牌的事件，并阻止用户猜测他人的任务地址。
                  </p>
                </>,
              ],
              [
                "为什么链接会失败",
                <>
                  <ul>
                    <li>内容是私人、已删除、地区或年龄限制，或者需要登录。</li>
                    <li>来源仍在直播，最终文件尚未形成。</li>
                    <li>平台修改了页面或清单结构。</li>
                    <li>轨道必须转码才能进入目标容器。</li>
                    <li>请求超时、限速或片段不完整。</li>
                    <li>来源存在服务不应绕过的 DRM 与访问控制。</li>
                  </ul>
                  <p>
                    还可以参考
                    <Link href="/zh-cn/blog/online-video-downloader-safety-checklist">
                      在线视频下载工具安全检查清单
                    </Link>
                    。
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "处理是否全部发生在浏览器？",
                <>
                  通常不是。界面在浏览器运行，但来源发现、大文件传输、轨道合并与转换一般由后端工作节点完成。
                </>,
              ],
              [
                "转封装会降低质量吗？",
                <>
                  stream copy
                  不重新编码轨道，通常能保留编码质量；转码会创建新媒体流，可能改变画质、码率和大小。
                </>,
              ],
              [
                "为什么短视频有时更慢？",
                <>
                  时长只是一个变量。来源速度、片段数量、分辨率、转码、队列与重试都会影响时间。
                </>,
              ],
            ]}
            closing={
              <>
                <strong>负责任地体验处理流程</strong>
                <p>
                  请仅使用{" "}
                  <Link href="/zh-cn/vimeo-video-downloader">
                    Vimeo 视频下载器
                  </Link>
                  或{" "}
                  <Link href="/zh-cn/tiktok-video-downloader">
                    TikTok 视频下载器
                  </Link>
                  处理您拥有或获得授权的媒体。
                </p>
              </>
            }
          />
        ),
      },
      es: {
        eyebrow: "DENTRO DEL PROCESO",
        title: "Cómo funciona un descargador de video online: visión técnica.",
        description:
          "URL, pistas, remuxing, almacenamiento temporal y entrega: la ingeniería de un descargador de video online.",
        readingTime: "9 min de lectura",
        body: (
          <TechnicalArticle
            takeawaysLabel="Ideas clave"
            faqLabel="Preguntas frecuentes"
            intro={
              <>
                Un descargador de video online es una pequeña cadena de
                procesamiento, no una sola orden. Valida la URL, descubre
                fuentes accesibles para una sesión autorizada, selecciona pistas
                compatibles, las empaqueta y entrega el archivo al navegador.
                Estas etapas explican diferencias de velocidad, formatos y
                errores.
              </>
            }
            takeaways={[
              "La URL de la página suele ser solo el inicio; un manifiesto puede describir el contenido.",
              "Video, audio, subtítulos y miniaturas pueden estar separados.",
              "El remuxing conserva la codificación; transcodificar crea pistas nuevas.",
              "Un servicio responsable aísla trabajos y elimina datos temporales.",
            ]}
            sections={[
              [
                "Etapa 1: validar la URL",
                <>
                  <p>
                    El servicio debe aceptar solo HTTP o HTTPS compatibles,
                    rechazar entradas mal formadas e impedir solicitudes a redes
                    privadas. También crea un trabajo con usuario, cuota, salida
                    y caducidad.
                  </p>
                </>,
              ],
              [
                "Etapa 2: descubrir pistas",
                <>
                  <p>
                    Una página suele ser HTML, no el archivo. El procesador lee
                    un archivo directo o un manifiesto con códec, resolución,
                    tasa e idioma. La{" "}
                    <a href="https://ffmpeg.org/ffmpeg-formats.html">
                      documentación de formatos de FFmpeg
                    </a>{" "}
                    explica cómo los demultiplexores exponen pistas y metadatos.
                  </p>
                  <p>
                    La lista debe ser real: si no hay 4K, no debe anunciarse. Si
                    la mejor imagen no contiene sonido, hay que elegir audio
                    compatible.
                  </p>
                </>,
              ],
              [
                "Etapa 3: elegir compatibilidad",
                <>
                  <p>
                    Hay que considerar códecs, contenedor, duración, tamaño y
                    dispositivo. MP4 es un contenedor, no una garantía
                    universal. La guía de{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Video_processing_concepts">
                      procesamiento de video de MDN
                    </a>{" "}
                    diferencia contenedor y decodificación.
                  </p>
                </>,
              ],
              [
                "Etapa 4: transferir y ensamblar",
                <>
                  <p>
                    El trabajador descarga, verifica y empaqueta. Stream copy
                    mueve paquetes sin recodificar; la{" "}
                    <a href="https://ffmpeg.org/ffmpeg.html">
                      documentación de FFmpeg
                    </a>{" "}
                    indica que es rápido y sin pérdida. Transcodificar consume
                    más CPU y suele ser con pérdida.
                  </p>
                </>,
              ],
              [
                "Etapa 5: entregar y caducar",
                <>
                  <p>
                    El resultado se entrega mediante una URL corta o endpoint
                    autenticado. El historial puede conservar metadatos, pero
                    segmentos y archivos deben caducar. Un usuario nunca debe
                    poder adivinar el trabajo de otro.
                  </p>
                </>,
              ],
              [
                "Por qué falla un enlace",
                <>
                  <ul>
                    <li>
                      Contenido privado, eliminado, regional o con sesión.
                    </li>
                    <li>Directo sin archivo final.</li>
                    <li>Cambio de manifiesto.</li>
                    <li>Códecs incompatibles.</li>
                    <li>Tiempo agotado o segmentos incompletos.</li>
                    <li>DRM o control que no debe eludirse.</li>
                  </ul>
                  <p>
                    Consulta nuestra{" "}
                    <Link href="/es/blog/online-video-downloader-safety-checklist">
                      lista de seguridad
                    </Link>
                    .
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "¿Todo ocurre en el navegador?",
                <>
                  Normalmente no. La interfaz es web, pero las transferencias,
                  la unión y las conversiones suelen ejecutarse en servidores.
                </>,
              ],
              [
                "¿El remuxing reduce calidad?",
                <>
                  No cuando copia las pistas sin recodificar. Transcodificar sí
                  puede cambiar calidad y tamaño.
                </>,
              ],
              [
                "¿Por qué un video corto puede tardar más?",
                <>
                  También influyen resolución, segmentos, conversión, cola,
                  origen y reintentos.
                </>,
              ],
            ]}
            closing={
              <>
                <strong>Utiliza fuentes autorizadas</strong>
                <p>
                  Prueba el{" "}
                  <Link href="/es/vimeo-video-downloader">
                    descargador de Vimeo
                  </Link>{" "}
                  o el{" "}
                  <Link href="/es/tiktok-video-downloader">
                    descargador de TikTok
                  </Link>{" "}
                  solo con contenido permitido.
                </p>
              </>
            }
          />
        ),
      },
    },
  },
  {
    slug: "why-4k-video-needs-separate-audio",
    published: "2026-07-16",
    category: { en: "Streaming", "zh-cn": "流媒体工程", es: "Streaming" },
    copy: {
      en: {
        eyebrow: "ADAPTIVE STREAMING",
        title: "Why 4K video often uses separate audio streams.",
        description:
          "Why high-resolution video can arrive without sound, how adaptive streaming separates tracks, and how a downloader assembles them.",
        readingTime: "8 min read",
        body: (
          <TechnicalArticle
            intro={
              <>
                A 4K source can arrive as video without audio because modern
                streaming systems often store picture and sound as separate
                representations. A player chooses a video level for the current
                screen and bandwidth, then synchronizes it with audio. A
                downloader preparing one ordinary MP4 must retrieve both tracks
                and package them together.
              </>
            }
            takeaways={[
              "Separate tracks let one audio stream serve several video resolutions.",
              "Adaptive manifests describe representations, segments, languages, and codecs.",
              "Merging compatible tracks can preserve quality without re-encoding.",
              "4K has four times the pixels of 1080p, but bitrate and codec still determine file size.",
            ]}
            sections={[
              [
                "Adaptive streaming is built for playback",
                <>
                  <p>
                    Traditional files place audio and video in one container.
                    Adaptive streaming describes many short segments and
                    multiple representations in a manifest. A player can change
                    bitrate when network conditions change. Apple’s{" "}
                    <a href="https://developer.apple.com/documentation/HTTP-Live-Streaming">
                      HTTP Live Streaming overview
                    </a>{" "}
                    describes alternate streams and intelligent switching based
                    on bandwidth.
                  </p>
                  <p>
                    This helps a phone on a weak connection and a television on
                    fast broadband share the same catalog. It also means the
                    highest video representation may not carry sound.
                  </p>
                </>,
              ],
              [
                "Why audio is stored separately",
                <>
                  <p>
                    Audio needs much less bandwidth than 4K video and does not
                    need a new copy for 480p, 720p, 1080p, 1440p, and 2160p.
                    Separation also allows independent languages, commentary,
                    descriptive audio, and multichannel mixes.
                  </p>
                  <p>
                    Apple’s{" "}
                    <a href="https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices/">
                      HLS authoring specification
                    </a>{" "}
                    recommends separate video and audio and requires separate
                    streams for multichannel or alternative audio. This is a
                    delivery design, not a broken file.
                  </p>
                </>,
              ],
              [
                "What the manifest tells the processor",
                <>
                  <p>
                    A manifest can list a representation identifier, codec,
                    bitrate, frame size, segment template, audio group, and
                    language. The processor chooses authorized, compatible
                    tracks, downloads initialization data and segments, and
                    verifies their timelines.
                  </p>
                  <p>
                    The 4K label only describes dimensions. Codec, frame rate,
                    dynamic range, bitrate, and container support can differ
                    between two 2160p representations.
                  </p>
                </>,
              ],
              [
                "Merging is not recompressing",
                <>
                  <p>
                    When codecs fit the output container, a tool can remux: copy
                    encoded packets and write synchronized timestamps. FFmpeg
                    calls this stream copy. If codecs are incompatible, one or
                    both tracks may need transcoding.
                  </p>
                  <p>
                    This is why processing can continue after transfer: the
                    system may be writing indexes, correcting timestamps,
                    attaching metadata, or converting audio.
                  </p>
                </>,
              ],
              [
                "Why 4K jobs can take longer",
                <>
                  <p>
                    UHD 4K is 3840 × 2160, about 8.29 million pixels per frame.
                    Full HD is 1920 × 1080, about 2.07 million. Four times the
                    pixels often means more transfer and storage, although size
                    depends on codec, bitrate, frame rate, duration, and image
                    complexity.
                  </p>
                  <p>
                    More segments, disk writes, integrity checks, and possible
                    transcoding make one universal completion-time promise
                    unrealistic.
                  </p>
                </>,
              ],
              [
                "Common causes of video without sound",
                <>
                  <ul>
                    <li>Only the video representation was downloaded.</li>
                    <li>
                      The audio codec does not fit the container or player.
                    </li>
                    <li>Segments are missing or timelines do not match.</li>
                    <li>No default audio group was selected.</li>
                    <li>Delivery began before final muxing completed.</li>
                  </ul>
                  <p>
                    Our{" "}
                    <Link href="/guides/video-resolution-guide">
                      video resolution guide
                    </Link>{" "}
                    explains when 1080p is a better trade-off than 4K.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "Is separate audio unique to 4K?",
                <>
                  No. Adaptive systems can separate tracks at any resolution. It
                  is more noticeable at high resolutions because the best
                  representation is commonly video-only.
                </>,
              ],
              [
                "Does merging lower quality?",
                <>
                  Not when tracks can be stream-copied into the target
                  container. Remuxing changes packaging; transcoding changes
                  encoded data.
                </>,
              ],
              [
                "Why do 4K options sometimes disappear?",
                <>
                  The source may not provide 4K for that upload, device, region,
                  codec, or authorization state. A trustworthy tool shows only
                  accessible representations.
                </>,
              ],
            ]}
          />
        ),
      },
      "zh-cn": {
        eyebrow: "自适应流媒体",
        title: "为什么 4K 视频经常需要单独的音频流？",
        description:
          "解释高清视频为什么可能没有声音、自适应流如何拆分轨道，以及下载器怎样合并画面与音频。",
        readingTime: "约 8 分钟",
        body: (
          <TechnicalArticle
            takeawaysLabel="核心结论"
            faqLabel="常见问题"
            intro={
              <>
                4K
                来源可能只有画面没有声音，因为现代流媒体经常把视频和音频保存为独立表示。播放器根据屏幕与带宽选择视频档位，再与音轨同步。下载器若要生成一个普通
                MP4，就必须分别取得两个轨道并正确打包。
              </>
            }
            takeaways={[
              "一条音频可以服务多个视频分辨率。",
              "自适应清单描述表示、片段、语言与编码。",
              "兼容轨道可以通过转封装无损合并。",
              "4K 像素是 1080p 的四倍，但文件大小仍由码率与编码决定。",
            ]}
            sections={[
              [
                "自适应流媒体为播放而设计",
                <>
                  <p>
                    传统文件把音视频放在同一容器；自适应流则通过清单描述多个片段和表示，网络变化时可切换码率。Apple
                    的{" "}
                    <a href="https://developer.apple.com/documentation/HTTP-Live-Streaming">
                      HLS 概览
                    </a>
                    介绍了备用媒体流和智能切换。
                  </p>
                  <p>
                    弱网手机和高速电视因此可以共享同一内容体系，但最高分辨率视频不一定自带声音。
                  </p>
                </>,
              ],
              [
                "为什么音频要分开",
                <>
                  <p>
                    音频带宽远小于 4K，也无需为 480p、720p、1080p、1440p 和
                    2160p
                    各复制一份。分离还便于独立选择语言、评论、无障碍描述与多声道版本。
                  </p>
                  <p>
                    Apple 的{" "}
                    <a href="https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices/">
                      HLS 制作规范
                    </a>
                    建议将音视频分开，多声道或替代音频则必须独立。这是传输设计，不是文件损坏。
                  </p>
                </>,
              ],
              [
                "媒体清单提供什么",
                <>
                  <p>
                    清单可以列出表示
                    ID、编码、码率、画面尺寸、片段模板、音频组与语言。处理器选择兼容且获得授权的轨道，下载初始化数据和片段，再校验时间线。
                  </p>
                  <p>
                    4K
                    只说明尺寸，编码、帧率、动态范围、码率和容器支持仍可能不同。
                  </p>
                </>,
              ],
              [
                "合并不等于重新压缩",
                <>
                  <p>
                    编码适合目标容器时，可以复制数据包并写入同步时间戳，也就是
                    stream copy。编码不兼容时，才可能需要转码。
                  </p>
                  <p>
                    因此网络传输完成后仍可能继续“处理”：系统还要写索引、修正时间戳、附加元数据或转换音轨。
                  </p>
                </>,
              ],
              [
                "为什么 4K 更慢",
                <>
                  <p>
                    3840 × 2160 每帧约 829 万像素，1920 × 1080 约 207
                    万，是四倍关系。但大小仍取决于编码、码率、帧率、时长与画面复杂度。
                  </p>
                  <p>
                    更多传输、写入、校验与可能的转码，让统一完成时间并不现实。
                  </p>
                </>,
              ],
              [
                "视频没有声音的常见原因",
                <>
                  <ul>
                    <li>只取得了视频表示。</li>
                    <li>音频编码不被容器或播放器支持。</li>
                    <li>片段缺失或时间线不匹配。</li>
                    <li>没有选择音频组。</li>
                    <li>最终封装尚未完成。</li>
                  </ul>
                  <p>
                    可阅读
                    <Link href="/zh-cn/guides/video-resolution-guide">
                      视频分辨率指南
                    </Link>
                    判断何时 1080p 比 4K 更合理。
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "音视频分离只出现在 4K 吗？",
                <>
                  不是。任何分辨率都可能分离，只是最高画质更常采用纯视频表示。
                </>,
              ],
              [
                "合并会降低质量吗？",
                <>
                  可以直接 stream copy
                  时不会；转封装改变包装，转码才会改变编码数据。
                </>,
              ],
              [
                "为什么 4K 选项会消失？",
                <>
                  来源可能没有为当前上传、设备、地区、编码或授权状态提供 4K。
                </>,
              ],
            ]}
          />
        ),
      },
      es: {
        eyebrow: "STREAMING ADAPTATIVO",
        title: "Por qué el video 4K suele usar audio separado.",
        description:
          "Por qué el video de alta resolución puede llegar sin sonido y cómo un descargador ensambla pistas adaptativas.",
        readingTime: "8 min de lectura",
        body: (
          <TechnicalArticle
            takeawaysLabel="Ideas clave"
            faqLabel="Preguntas frecuentes"
            intro={
              <>
                Una fuente 4K puede llegar sin audio porque el streaming moderno
                guarda imagen y sonido como representaciones separadas. El
                reproductor elige video según pantalla y red y lo sincroniza con
                audio. Para producir un MP4, el procesador debe recuperar ambas
                pistas.
              </>
            }
            takeaways={[
              "Un audio puede servir a varias resoluciones.",
              "El manifiesto describe segmentos, idiomas y códecs.",
              "El remuxing puede unir pistas sin recodificar.",
              "4K tiene cuatro veces los píxeles de 1080p, pero el códec determina el tamaño.",
            ]}
            sections={[
              [
                "Streaming adaptativo",
                <>
                  <p>
                    Un manifiesto describe segmentos y variantes que cambian con
                    la red. La{" "}
                    <a href="https://developer.apple.com/documentation/HTTP-Live-Streaming">
                      guía HLS de Apple
                    </a>{" "}
                    explica el cambio inteligente según ancho de banda.
                  </p>
                </>,
              ],
              [
                "Por qué separar audio",
                <>
                  <p>
                    Evita duplicar el mismo sonido para 480p, 720p, 1080p, 1440p
                    y 2160p y permite idiomas o mezclas. La{" "}
                    <a href="https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices/">
                      especificación HLS
                    </a>{" "}
                    recomienda pistas independientes.
                  </p>
                </>,
              ],
              [
                "Qué indica el manifiesto",
                <>
                  <p>
                    Incluye identificador, códec, tasa, tamaño, segmentos, grupo
                    de audio e idioma. 4K solo describe dimensiones;
                    compatibilidad y tasa pueden variar.
                  </p>
                </>,
              ],
              [
                "Unir no es recomprimir",
                <>
                  <p>
                    Si los códecs caben en el contenedor, stream copy copia
                    paquetes y tiempos. Si no, hay que transcodificar.
                  </p>
                </>,
              ],
              [
                "Por qué 4K tarda más",
                <>
                  <p>
                    3840 × 2160 son 8,29 millones de píxeles por fotograma,
                    frente a 2,07 millones en 1080p. También importan códec,
                    tasa, duración y complejidad.
                  </p>
                </>,
              ],
              [
                "Causas de video sin sonido",
                <>
                  <ul>
                    <li>Solo se obtuvo video.</li>
                    <li>Audio incompatible.</li>
                    <li>Segmentos o tiempos incorrectos.</li>
                    <li>No se eligió audio.</li>
                    <li>El multiplexado no terminó.</li>
                  </ul>
                  <p>
                    Consulta la{" "}
                    <Link href="/es/guides/video-resolution-guide">
                      guía de resolución
                    </Link>
                    .
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "¿Solo ocurre en 4K?",
                <>No. Cualquier resolución puede separar pistas.</>,
              ],
              [
                "¿Unir reduce calidad?",
                <>
                  No cuando se copian las pistas; transcodificar sí cambia
                  datos.
                </>,
              ],
              [
                "¿Por qué desaparece 4K?",
                <>
                  La fuente puede no ofrecerlo para esa subida, región,
                  dispositivo o autorización.
                </>,
              ],
            ]}
          />
        ),
      },
    },
  },
  {
    slug: "online-vs-desktop-video-downloader",
    published: "2026-07-16",
    category: { en: "Comparison", "zh-cn": "工具测评", es: "Comparativa" },
    copy: {
      en: {
        eyebrow: "CHOOSING A TOOL",
        title: "Online vs desktop video downloaders: which is better?",
        description:
          "Compare web tools, desktop apps, and browser extensions by privacy, permissions, batch work, maintenance, and device support.",
        readingTime: "10 min read",
        body: (
          <TechnicalArticle
            intro={
              <>
                An online video downloader is usually best for occasional,
                no-install use; a desktop app is stronger for long, repeated, or
                configurable jobs; and a browser extension is useful when direct
                page integration outweighs its extra permission surface. The
                right choice depends on frequency, file size, privacy
                expectations, and devices—not marketing claims.
              </>
            }
            takeaways={[
              "Choose web for a few authorized links and cross-device access.",
              "Choose desktop for large queues, long files, codecs, and local automation.",
              "Choose an extension only when every requested permission serves its narrow purpose.",
              "Test successful output, failure behavior, policies, and cleanup—not speed alone.",
            ]}
            sections={[
              [
                "Online downloader: low friction",
                <>
                  <p>
                    A browser tool opens from a URL and requires no
                    installation. It works on shared computers, managed devices,
                    phones, and tablets. Updates happen centrally, so users do
                    not download a new installer.
                  </p>
                  <p>
                    Processing may happen on remote infrastructure. Review how
                    URLs, temporary files, history, and analytics are handled.
                    Daily limits and queue rules are also common because
                    providers pay for bandwidth, CPU, and storage.
                  </p>
                </>,
              ],
              [
                "Desktop app: control for sustained workloads",
                <>
                  <p>
                    A desktop app can use the local file system, CPU, and disk,
                    expose codec choices, and maintain large queues. It suits
                    creators archiving their own channels, researchers using
                    licensed datasets, and teams with repeatable naming or
                    post-processing.
                  </p>
                  <p>
                    Users must verify the publisher and installer source, keep
                    the application patched, and review bundled components.
                    Local transcoding also consumes battery, memory, disk, and
                    CPU.
                  </p>
                </>,
              ],
              [
                "Extension: convenient but permission-sensitive",
                <>
                  <p>
                    An extension can add controls to supported pages, but may
                    request access to tabs, page contents, downloads, cookies,
                    or websites. Chrome’s{" "}
                    <a href="https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions">
                      official permission documentation
                    </a>{" "}
                    explains that host permissions can allow URL access, script
                    injection, cross-origin requests, and network interaction.
                  </p>
                  <p>
                    Prefer a single-purpose extension, optional permissions
                    requested when needed, a clear publisher, active
                    maintenance, and an explanation for every warning. Remove
                    unused extensions.
                  </p>
                </>,
              ],
              [
                "Six factors to compare",
                <>
                  <ol>
                    <li>
                      <strong>Setup:</strong> web needs a browser; desktop needs
                      installation; extensions need installation and
                      permissions.
                    </li>
                    <li>
                      <strong>Processing:</strong> web commonly uses remote
                      workers; desktop commonly works locally; extensions may
                      use either.
                    </li>
                    <li>
                      <strong>Batch work:</strong> desktop offers deep
                      automation, while paid web plans can manage queues without
                      local CPU use.
                    </li>
                    <li>
                      <strong>Mobile:</strong> responsive web tools are
                      portable; desktop apps and mobile extensions are not.
                    </li>
                    <li>
                      <strong>Maintenance:</strong> web updates centrally; apps
                      and extensions need authentic update channels.
                    </li>
                    <li>
                      <strong>Recovery:</strong> look for queue state, retries,
                      resumable transfers, and clear quota rules.
                    </li>
                  </ol>
                </>,
              ],
              [
                "A repeatable evaluation method",
                <>
                  <ol>
                    <li>Test one self-owned or public-domain clip in MP4.</li>
                    <li>Test one authorized audio-only output.</li>
                    <li>
                      Compare reported resolution and duration with the source.
                    </li>
                    <li>Open the result on two players or devices.</li>
                    <li>
                      Review every permission and decline unrelated access.
                    </li>
                    <li>Find privacy, terms, copyright, and contact pages.</li>
                    <li>Delete the test job or file and verify the control.</li>
                  </ol>
                  <p>
                    Do not call a product fastest after one link. Network route,
                    source throttling, queue load, cache, resolution, and
                    transcoding change results. Repeat the same authorized
                    sources and report failures as well as successes.
                  </p>
                </>,
              ],
              [
                "Which option should you choose?",
                <>
                  <p>
                    Use web when convenience and cross-device access matter
                    most. Use desktop when local control, advanced output, or
                    sustained batch work matters more. Use an extension only
                    when page integration solves a real recurring problem and
                    its access matches that purpose.
                  </p>
                  <p>
                    Start with our{" "}
                    <Link href="/blog/online-video-downloader-safety-checklist">
                      online downloader safety checklist
                    </Link>
                    , and avoid tools that promise to bypass subscriptions,
                    private accounts, DRM, or access controls.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "Are desktop downloaders always more private?",
                <>
                  No. Some process locally; others send URLs, telemetry,
                  accounts, or jobs to remote services. Review the specific
                  product rather than assuming privacy from installation type.
                </>,
              ],
              [
                "Is an extension faster than a website?",
                <>
                  Not necessarily. It reduces interaction steps, but speed
                  depends on processing location, source connection, format,
                  queue, and conversion.
                </>,
              ],
              [
                "What is best for a phone?",
                <>
                  A responsive browser tool is usually most portable because it
                  avoids app installation and mobile extension limitations.
                </>,
              ],
            ]}
          />
        ),
      },
      "zh-cn": {
        eyebrow: "选择合适工具",
        title: "在线下载器、桌面软件与浏览器扩展，哪个更好？",
        description:
          "从隐私、权限、批量任务、性能、维护与设备支持角度，对比在线下载器、桌面应用和扩展。",
        readingTime: "约 10 分钟",
        body: (
          <TechnicalArticle
            takeawaysLabel="核心结论"
            faqLabel="常见问题"
            intro={
              <>
                偶尔使用、希望免安装时，在线下载器通常更合适；长期、重复或高度自定义任务更适合桌面软件；只有当页面集成的价值确实超过权限风险时，扩展才值得选择。正确答案取决于频率、文件大小、隐私预期和设备，而不是广告口号。
              </>
            }
            takeaways={[
              "少量授权链接和跨设备访问：选择网页工具。",
              "大队列、长文件、编码与本地自动化：选择桌面软件。",
              "只有权限范围小且用途明确时才选择扩展。",
              "测评要同时检查成功、失败、政策与清理行为。",
            ]}
            sections={[
              [
                "在线下载器：门槛低",
                <>
                  <p>
                    网页工具通过 URL
                    打开，无需安装，适合共享电脑、受管理设备、手机和平板。更新由服务端统一完成。
                  </p>
                  <p>
                    处理可能发生在远程设施上，因此要了解
                    URL、临时文件、历史和分析数据如何处理。由于服务商承担带宽与计算成本，也可能存在次数和队列限制。
                  </p>
                </>,
              ],
              [
                "桌面软件：适合持续负载",
                <>
                  <p>
                    桌面应用可以使用本地文件系统、CPU
                    与磁盘，提供编码选项和大型队列，适合归档自有内容或运行固定后处理流程。
                  </p>
                  <p>
                    用户必须核对发布者与安装来源、及时更新并检查捆绑组件。本地转码也会消耗电量、内存和
                    CPU。
                  </p>
                </>,
              ],
              [
                "浏览器扩展：方便但依赖权限",
                <>
                  <p>
                    扩展可在页面中直接增加操作，但可能请求标签页、页面、下载、Cookie
                    或网站权限。Chrome{" "}
                    <a href="https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions">
                      官方权限文档
                    </a>
                    说明，主机权限可能允许查看
                    URL、注入脚本、跨域请求与网络交互。
                  </p>
                  <p>
                    优先选择用途单一、按需申请权限、发布者明确、持续维护且能解释每条警告的扩展。
                  </p>
                </>,
              ],
              [
                "六项比较因素",
                <>
                  <ol>
                    <li>
                      <strong>安装：</strong>
                      网页只要浏览器，桌面要安装，扩展还要授权。
                    </li>
                    <li>
                      <strong>处理：</strong>
                      网页通常远程，桌面通常本地，扩展两者皆可能。
                    </li>
                    <li>
                      <strong>批量：</strong>
                      桌面自动化更深，付费网页队列不占本地 CPU。
                    </li>
                    <li>
                      <strong>移动端：</strong>响应式网页最通用。
                    </li>
                    <li>
                      <strong>维护：</strong>
                      网页集中更新，软件与扩展需要可信渠道。
                    </li>
                    <li>
                      <strong>恢复：</strong>关注队列、重试、断点和额度规则。
                    </li>
                  </ol>
                </>,
              ],
              [
                "可重复测评方法",
                <>
                  <ol>
                    <li>测试一个自有或公共领域短视频。</li>
                    <li>测试一个授权纯音频输出。</li>
                    <li>核对分辨率与时长。</li>
                    <li>在两种设备打开成品。</li>
                    <li>检查并拒绝无关权限。</li>
                    <li>找到隐私、条款、版权和联系页面。</li>
                    <li>删除测试任务并确认行为。</li>
                  </ol>
                  <p>
                    不要凭一个链接就称“最快”。网络、来源限速、队列、缓存、画质与转码都会改变结果。
                  </p>
                </>,
              ],
              [
                "最终怎么选",
                <>
                  <p>
                    重视方便和跨设备就选网页；重视本地控制、高级输出和持续批量就选桌面；只有页面集成解决真实问题且权限匹配时才选扩展。
                  </p>
                  <p>
                    建议先阅读
                    <Link href="/zh-cn/blog/online-video-downloader-safety-checklist">
                      安全检查清单
                    </Link>
                    。
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "桌面软件一定更保护隐私吗？",
                <>
                  不一定。有些本地处理，另一些仍会发送
                  URL、遥测或任务。应检查具体产品。
                </>,
              ],
              [
                "扩展一定比网站快吗？",
                <>
                  不一定。扩展减少操作，但速度仍取决于处理位置、来源、格式、队列与转换。
                </>,
              ],
              [
                "手机上哪种更好？",
                <>响应式网页通常最通用，因为无需安装，也不受移动扩展限制。</>,
              ],
            ]}
          />
        ),
      },
      es: {
        eyebrow: "ELEGIR HERRAMIENTA",
        title: "Descargador online, programa o extensión: comparativa.",
        description:
          "Compara web, programas y extensiones por privacidad, permisos, lotes, mantenimiento y dispositivos.",
        readingTime: "10 min de lectura",
        body: (
          <TechnicalArticle
            takeawaysLabel="Ideas clave"
            faqLabel="Preguntas frecuentes"
            intro={
              <>
                La web suele ser mejor para uso ocasional sin instalación; un
                programa para trabajos largos o repetidos; y una extensión
                cuando la integración compensa permisos adicionales. La elección
                depende de frecuencia, tamaño, privacidad y dispositivos.
              </>
            }
            takeaways={[
              "Web para pocos enlaces y varios dispositivos.",
              "Escritorio para colas, archivos largos y automatización.",
              "Extensión solo con permisos estrechos y explicados.",
              "Evalúa fallos y políticas, no solo velocidad.",
            ]}
            sections={[
              [
                "Herramienta online",
                <>
                  <p>
                    No necesita instalación y funciona en móvil y ordenador.
                    Puede procesar de forma remota, así que revisa URLs,
                    archivos temporales e historial.
                  </p>
                </>,
              ],
              [
                "Programa de escritorio",
                <>
                  <p>
                    Ofrece sistema de archivos, CPU local, opciones de códec y
                    colas. Hay que verificar editor, instalador, actualizaciones
                    y componentes.
                  </p>
                </>,
              ],
              [
                "Extensión",
                <>
                  <p>
                    Integra controles, pero puede pedir pestañas, contenido,
                    cookies o sitios. La{" "}
                    <a href="https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions">
                      documentación de Chrome
                    </a>{" "}
                    explica el alcance de permisos de host.
                  </p>
                </>,
              ],
              [
                "Seis factores",
                <>
                  <ol>
                    <li>Instalación.</li>
                    <li>Lugar de procesamiento.</li>
                    <li>Lotes y automatización.</li>
                    <li>Compatibilidad móvil.</li>
                    <li>Actualizaciones.</li>
                    <li>Reanudación y errores.</li>
                  </ol>
                </>,
              ],
              [
                "Prueba repetible",
                <>
                  <ol>
                    <li>Usa un clip propio.</li>
                    <li>Prueba audio autorizado.</li>
                    <li>Compara resolución y duración.</li>
                    <li>Abre en dos dispositivos.</li>
                    <li>Revisa permisos.</li>
                    <li>Localiza políticas.</li>
                    <li>Prueba la eliminación.</li>
                  </ol>
                  <p>
                    No declares un ganador por un solo enlace; red, fuente, cola
                    y conversión cambian el resultado.
                  </p>
                </>,
              ],
              [
                "Cuál elegir",
                <>
                  <p>
                    Web para comodidad, escritorio para control, extensión para
                    integración justificada. Revisa nuestra{" "}
                    <Link href="/es/blog/online-video-downloader-safety-checklist">
                      lista de seguridad
                    </Link>
                    .
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "¿El escritorio siempre es más privado?",
                <>
                  No. Algunos programas también envían telemetría o trabajos
                  remotos.
                </>,
              ],
              [
                "¿Una extensión siempre es más rápida?",
                <>No. Reduce clics, pero no necesariamente el procesamiento.</>,
              ],
              [
                "¿Qué es mejor para móvil?",
                <>
                  Una herramienta web adaptable suele ser la opción más
                  portátil.
                </>,
              ],
            ]}
          />
        ),
      },
    },
  },
  {
    slug: "mp4-vs-webm-video-format",
    published: "2026-07-16",
    category: { en: "Formats", "zh-cn": "格式测评", es: "Formatos" },
    copy: {
      en: {
        eyebrow: "CONTAINER COMPARISON",
        title: "MP4 vs WebM: which video format should you choose?",
        description:
          "Compare MP4 and WebM by codecs, compatibility, file size, quality, editing, browser playback, and media workflow.",
        readingTime: "9 min read",
        body: (
          <TechnicalArticle
            intro={
              <>
                Choose MP4 when broad playback and editing compatibility matter
                most. Choose WebM when you want an open, web-focused container
                and target devices support VP9 or AV1 video with Opus audio.
                Neither extension determines quality by itself: codecs, bitrate,
                resolution, frame rate, and encoding settings do.
              </>
            }
            takeaways={[
              "Phones, televisions, messaging, presentations, and common editors: start with MP4.",
              "Modern websites and open codecs: consider WebM.",
              "Container and codec are different decisions.",
              "Keep a verified source and avoid repeated lossy conversion.",
            ]}
            sections={[
              [
                "Container and codec are not the same",
                <>
                  <p>
                    MP4 and WebM are containers holding encoded video, audio,
                    timestamps, and metadata. A codec defines compression. MDN’s{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers">
                      container guide
                    </a>{" "}
                    recommends considering use, codec support, licensing, and
                    target compatibility rather than the extension alone.
                  </p>
                  <p>
                    Common MP4 files use H.264 with AAC, though the container
                    can hold other codecs. WebM commonly uses VP8, VP9, or AV1
                    with Vorbis or Opus. A player must understand both container
                    and codecs.
                  </p>
                </>,
              ],
              [
                "Compatibility: MP4 is the safer default",
                <>
                  <p>
                    MP4 with H.264 and AAC is broadly supported across browsers
                    and consumer devices. It is practical when a file must work
                    in an unknown editor, television, phone, presentation, or
                    messaging app.
                  </p>
                  <p>
                    WebM works well in modern browsers and uses open,
                    web-oriented codecs. Compatibility gaps are more likely on
                    older Apple devices, legacy editors, and hardware players.
                  </p>
                </>,
              ],
              [
                "Quality and size depend on encoding",
                <>
                  <p>
                    It is misleading to say WebM is always smaller or MP4 always
                    looks better without naming codecs and settings. AV1 can use
                    fewer bits than H.264 for similar perceived quality, but it
                    is more computationally demanding and not every device has
                    hardware decoding.
                  </p>
                  <p>
                    MDN’s{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">
                      video codec guide
                    </a>{" "}
                    describes AV1 as an efficient open option and MP4 with
                    H.264/AAC as a broad compatibility choice. Motion, grain,
                    screen text, and gradients also change bitrate needs.
                  </p>
                </>,
              ],
              [
                "Web publishing and editing",
                <>
                  <p>
                    A website can offer WebM first and MP4 as fallback with
                    multiple <code>&lt;source&gt;</code> elements. That costs
                    storage and encoding time but improves coverage. For one
                    offline file, two versions are usually unnecessary.
                  </p>
                  <p>
                    Many editors accept MP4/H.264, though highly compressed
                    delivery codecs may be slow to seek. WebM support varies
                    more. Import a representative file, scrub the timeline,
                    confirm sync, and export a ten-second sample before a large
                    workflow.
                  </p>
                </>,
              ],
              [
                "Remuxing versus transcoding",
                <>
                  <p>
                    Renaming <code>.webm</code> to <code>.mp4</code> converts
                    nothing. Remuxing works only when existing tracks are valid
                    in the target container. VP9 and Opus may need conversion to
                    H.264 and AAC for broad MP4 support, which takes time and
                    can reduce quality.
                  </p>
                  <p>
                    Avoid repeated lossy encoding. Keep the source when it
                    already works, or make one intentional conversion for the
                    destination.
                  </p>
                </>,
              ],
              [
                "A practical format checklist",
                <>
                  <ol>
                    <li>List playback and editing devices.</li>
                    <li>Inspect actual video and audio codecs.</li>
                    <li>
                      Check resolution, frame rate, bitrate, duration, and size.
                    </li>
                    <li>Test seeking, sync, subtitles, and thumbnails.</li>
                    <li>Decide whether open-format requirements apply.</li>
                    <li>
                      Keep one verified source before making delivery copies.
                    </li>
                  </ol>
                  <p>
                    If the decision is video versus audio-only, read our{" "}
                    <Link href="/guides/mp4-vs-mp3">MP4 vs MP3 guide</Link>. MP3
                    removes the visual track; WebM remains a multimedia
                    container.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "Can WebM contain 4K?",
                <>
                  Yes. It can carry high-resolution VP9 or AV1. Smooth playback
                  depends on codec profile, bitrate, frame rate, software, and
                  hardware decoding.
                </>,
              ],
              [
                "Can WebM become MP4 without quality loss?",
                <>
                  Only when tracks can be remuxed and remain compatible. If a
                  track needs transcoding, new encoded data is created.
                </>,
              ],
              [
                "Which is better for an ordinary download?",
                <>
                  MP4 is the safer default for unknown devices. WebM is strong
                  for tested modern web workflows and open codecs.
                </>,
              ],
            ]}
          />
        ),
      },
      "zh-cn": {
        eyebrow: "视频容器比较",
        title: "MP4 与 WebM 对比：应该选择哪种视频格式？",
        description:
          "从编码、兼容性、文件大小、画质、剪辑和浏览器播放角度，比较 MP4 与 WebM。",
        readingTime: "约 9 分钟",
        body: (
          <TechnicalArticle
            takeawaysLabel="核心结论"
            faqLabel="常见问题"
            intro={
              <>
                最重视播放与剪辑兼容性时选择 MP4；希望使用开放、面向 Web
                的容器，且目标设备支持 VP9 或 AV1 与 Opus 时，可以选择
                WebM。扩展名本身不决定画质，真正影响结果的是编码、码率、分辨率、帧率和设置。
              </>
            }
            takeaways={[
              "手机、电视、聊天、演示与常见剪辑软件：优先 MP4。",
              "现代网站与开放编码：考虑 WebM。",
              "容器和编码是两个不同决定。",
              "保留经过验证的来源，避免反复有损转换。",
            ]}
            sections={[
              [
                "容器与编码不是一回事",
                <>
                  <p>
                    MP4 和 WebM
                    是容器，负责保存编码后的音视频、时间戳与元数据；编码定义压缩方式。MDN
                    的
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers">
                      容器指南
                    </a>
                    建议根据用途、编码支持、许可与目标兼容性选择。
                  </p>
                  <p>
                    常见 MP4 使用 H.264 与 AAC，WebM 常见 VP8、VP9、AV1 与
                    Vorbis、Opus。播放器必须同时理解容器和编码。
                  </p>
                </>,
              ],
              [
                "兼容性：MP4 更稳妥",
                <>
                  <p>
                    MP4/H.264/AAC
                    被主流浏览器和消费设备广泛支持，适合未知剪辑软件、电视、手机、演示或聊天应用。
                  </p>
                  <p>
                    WebM 在现代浏览器表现很好，但旧 Apple
                    设备、老剪辑软件和硬件播放器更可能存在兼容差异。
                  </p>
                </>,
              ],
              [
                "画质与大小取决于编码",
                <>
                  <p>
                    不说明编码就声称 WebM 总是更小或 MP4 总是更清晰并不准确。AV1
                    在相近感知质量下可能比 H.264
                    使用更少比特，但计算量更高，也不是每台设备都有硬件解码。
                  </p>
                  <p>
                    MDN 的
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">
                      视频编码指南
                    </a>
                    将 AV1 视为高效开放选项，而 MP4/H.264/AAC 是广泛兼容方案。
                  </p>
                </>,
              ],
              [
                "网站发布与剪辑",
                <>
                  <p>
                    网站可以优先提供 WebM，再用 MP4
                    后备。代价是额外存储与编码时间。对于单个离线文件，通常不必保留两个版本。
                  </p>
                  <p>
                    许多剪辑软件支持 MP4/H.264，但高度压缩编码可能拖动不顺。WebM
                    支持差异更大，应先导入样本、检查音画同步并导出十秒测试。
                  </p>
                </>,
              ],
              [
                "转封装与转码",
                <>
                  <p>
                    把 <code>.webm</code> 改名为 <code>.mp4</code>{" "}
                    不会转换。只有轨道适合目标容器时才能转封装；VP9 与 Opus
                    可能需要转成 H.264 与 AAC 才能获得广泛 MP4 支持。
                  </p>
                  <p>
                    避免反复有损编码。来源已经可用时直接保留，必须转换时只做一次。
                  </p>
                </>,
              ],
              [
                "实用格式清单",
                <>
                  <ol>
                    <li>列出播放和剪辑设备。</li>
                    <li>检查真实音视频编码。</li>
                    <li>核对分辨率、帧率、码率、时长和大小。</li>
                    <li>测试拖动、同步、字幕和缩略图。</li>
                    <li>确认是否需要开放格式。</li>
                    <li>创建交付副本前保留验证来源。</li>
                  </ol>
                  <p>
                    如果要比较视频与纯音频，请阅读
                    <Link href="/zh-cn/guides/mp4-vs-mp3">MP4 与 MP3 指南</Link>
                    。
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "WebM 可以保存 4K 吗？",
                <>
                  可以。能否流畅播放取决于编码配置、码率、帧率、软件和硬件解码。
                </>,
              ],
              [
                "WebM 转 MP4 可以无损吗？",
                <>
                  只有轨道可以直接转封装且目标播放器兼容时可以；需要转码时会创建新的编码数据。
                </>,
              ],
              [
                "普通下载应该选哪个？",
                <>
                  面对未知设备时 MP4 更稳妥；现代 Web 工作流和开放编码则适合
                  WebM。
                </>,
              ],
            ]}
          />
        ),
      },
      es: {
        eyebrow: "COMPARAR CONTENEDORES",
        title: "MP4 vs WebM: qué formato de video elegir.",
        description:
          "Compara MP4 y WebM por códecs, compatibilidad, tamaño, calidad, edición y reproducción web.",
        readingTime: "9 min de lectura",
        body: (
          <TechnicalArticle
            takeawaysLabel="Ideas clave"
            faqLabel="Preguntas frecuentes"
            intro={
              <>
                Elige MP4 para máxima compatibilidad. Elige WebM para un
                contenedor abierto orientado a la web cuando el destino admite
                VP9 o AV1 con Opus. La extensión no decide la calidad: importan
                códecs, tasa, resolución y ajustes.
              </>
            }
            takeaways={[
              "Móviles, TV y editores comunes: MP4.",
              "Web moderna y códecs abiertos: WebM.",
              "Contenedor y códec son decisiones distintas.",
              "Evita recodificar varias veces.",
            ]}
            sections={[
              [
                "Contenedor y códec",
                <>
                  <p>
                    MP4 y WebM contienen pistas y metadatos; el códec define
                    compresión. La{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers">
                      guía de MDN
                    </a>{" "}
                    recomienda decidir por uso y compatibilidad.
                  </p>
                </>,
              ],
              [
                "Compatibilidad",
                <>
                  <p>
                    MP4/H.264/AAC tiene soporte amplio. WebM funciona bien en
                    navegadores modernos, pero puede variar en dispositivos
                    Apple antiguos y editores heredados.
                  </p>
                </>,
              ],
              [
                "Calidad y tamaño",
                <>
                  <p>
                    No dependen de la extensión. AV1 puede usar menos bits que
                    H.264 para calidad similar, pero exige más cálculo. Consulta
                    la{" "}
                    <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs">
                      guía de códecs de MDN
                    </a>
                    .
                  </p>
                </>,
              ],
              [
                "Web y edición",
                <>
                  <p>
                    Una web puede ofrecer WebM y MP4 como alternativa. Para
                    editar, importa un ejemplo, revisa sincronización y exporta
                    diez segundos antes de un lote.
                  </p>
                </>,
              ],
              [
                "Remuxing y transcodificación",
                <>
                  <p>
                    Cambiar el nombre no convierte. El remuxing requiere pistas
                    válidas en MP4; VP9 y Opus pueden necesitar conversión a
                    H.264 y AAC.
                  </p>
                </>,
              ],
              [
                "Lista práctica",
                <>
                  <ol>
                    <li>Enumera dispositivos.</li>
                    <li>Comprueba códecs.</li>
                    <li>Revisa resolución y tasa.</li>
                    <li>Prueba búsqueda y audio.</li>
                    <li>Valora formatos abiertos.</li>
                    <li>Conserva una fuente.</li>
                  </ol>
                  <p>
                    Para video frente a audio, consulta{" "}
                    <Link href="/es/guides/mp4-vs-mp3">MP4 vs MP3</Link>.
                  </p>
                </>,
              ],
            ]}
            faq={[
              [
                "¿WebM puede contener 4K?",
                <>
                  Sí. La reproducción depende de perfil, tasa, frecuencia y
                  hardware.
                </>,
              ],
              [
                "¿WebM a MP4 puede ser sin pérdida?",
                <>
                  Solo cuando las pistas se pueden remultiplexar sin cambiar
                  códecs.
                </>,
              ],
              [
                "¿Cuál elegir normalmente?",
                <>
                  MP4 para dispositivos desconocidos; WebM para flujos web
                  modernos probados.
                </>,
              ],
            ]}
          />
        ),
      },
    },
  },
];
