let ffmpegInstance: any | null = null;
let loadingPromise: Promise<any> | null = null;

export const loadFFmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist";
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadingPromise;
};

const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const transcodeWebMToMP4 = async (webm: Blob): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inName = "input.webm";
  const outName = "output.mp4";

  await ffmpeg.writeFile(inName, await blobToUint8Array(webm));

  await ffmpeg.exec([
    "-i", inName,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    outName,
  ]);

  const data = await ffmpeg.readFile(outName);
  try { await ffmpeg.deleteFile(inName); } catch {}
  try { await ffmpeg.deleteFile(outName); } catch {}

  return new Blob([data as Uint8Array], { type: "video/mp4" });
};

export const transcodeAudioWebMToMP3 = async (webm: Blob): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inName = "input_audio.webm";
  const outName = "output.mp3";

  await ffmpeg.writeFile(inName, await blobToUint8Array(webm));

  await ffmpeg.exec([
    "-i", inName,
    "-vn",
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    outName,
  ]);

  const data = await ffmpeg.readFile(outName);
  try { await ffmpeg.deleteFile(inName); } catch {}
  try { await ffmpeg.deleteFile(outName); } catch {}

  return new Blob([data as Uint8Array], { type: "audio/mpeg" });
};

export const transcodeAudio = async (input: Blob | File, target: "mp3" | "wav"): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inName = "in_audio";
  const outName = target === "mp3" ? "out.mp3" : "out.wav";

  await ffmpeg.writeFile(inName, await blobToUint8Array(input));

  const args = target === "mp3"
    ? [
        "-i", inName,
        "-vn",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        outName,
      ]
    : [
        "-i", inName,
        "-vn",
        "-c:a", "pcm_s16le",
        "-ar", "44100",
        "-ac", "2",
        outName,
      ];

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outName);
  try { await ffmpeg.deleteFile(inName); } catch {}
  try { await ffmpeg.deleteFile(outName); } catch {}

  return new Blob([data as Uint8Array], { type: target === "mp3" ? "audio/mpeg" : "audio/wav" });
};