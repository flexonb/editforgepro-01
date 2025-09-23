import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let _ffmpeg: FFmpeg | null = null;
let _loading: Promise<FFmpeg> | null = null;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (_ffmpeg) return _ffmpeg;
  if (_loading) return _loading;

  const ffmpeg = new FFmpeg();
  _loading = (async () => {
    await ffmpeg.load();
    _ffmpeg = ffmpeg;
    return ffmpeg;
  })();

  return _loading;
};

export const transcodeAudio = async (file: File, outputExt: 'mp3' | 'wav'): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();

  const inputName = `input.${file.name.split('.').pop() || 'bin'}`;
  const outputName = `output.${outputExt}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  if (outputExt === 'mp3') {
    // Try libmp3lame; fallback to default if unavailable
    try {
      await ffmpeg.exec(['-i', inputName, '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', outputName]);
    } catch {
      await ffmpeg.exec(['-i', inputName, '-vn', outputName]);
    }
  } else if (outputExt === 'wav') {
    await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', outputName]);
  }

  const data = await ffmpeg.readFile(outputName);
  // Clean up
  try { await ffmpeg.deleteFile(inputName); } catch {}
  try { await ffmpeg.deleteFile(outputName); } catch {}

  const buf = (data as Uint8Array).buffer;
  const mime = outputExt === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  return new Blob([buf], { type: mime });
};