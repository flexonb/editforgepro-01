import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

export const loadFFmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist";
  const ffmpeg = new FFmpeg();
  loadingPromise = (async () => {
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
  // filenames in ffmpeg FS
  const inName = "input.webm";
  const outName = "output.mp4";

  // write input
  await ffmpeg.writeFile(inName, await blobToUint8Array(webm));

  // Transcode: copy audio if possible, encode video to H.264 baseline for broad support
  // -movflags +faststart for progressive playback
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
  // cleanup (best-effort)
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