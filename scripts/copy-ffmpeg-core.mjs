#!/usr/bin/env node
import { mkdirSync, copyFileSync, existsSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, '../node_modules/@ffmpeg/core/dist');
const destDir = resolve(__dirname, '../public/ffmpeg');

const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js',
];

const cdnBases = [
  'https://cdn.jsdelivr.net/gh/ffmpegwasm/core@v0.12.10/dist',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist',
  'https://fastly.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist',
  'https://unpkg.com/@ffmpeg/core@0.12.10/dist',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@latest/dist',
  'https://unpkg.com/@ffmpeg/core@latest/dist',
];

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirects
        return resolve(download(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function downloadFromCDNs(filename, destPath) {
  let lastErr;
  for (const base of cdnBases) {
    const url = `${base}/${filename}`;
    try {
      const buf = await download(url);
      writeFileSync(destPath, buf);
      console.log(`[copy-ffmpeg-core] Downloaded ${filename} from ${base}`);
      return true;
    } catch (e) {
      lastErr = e;
    }
  }
  console.warn(`[copy-ffmpeg-core] Failed to download ${filename}: ${lastErr?.message || lastErr}`);
  return false;
}

async function run() {
  try {
    ensureDir(destDir);
    let copied = 0;

    // Try copy from node_modules first
    for (const f of files) {
      const from = resolve(srcDir, f);
      const to = resolve(destDir, f);
      if (existsSync(from)) {
        copyFileSync(from, to);
        copied++;
        console.log(`[copy-ffmpeg-core] Copied ${f} from node_modules`);
      }
    }

    // Download missing ones from CDNs
    for (const f of files) {
      const to = resolve(destDir, f);
      if (!existsSync(to)) {
        const ok = await downloadFromCDNs(f, to);
        if (ok) copied++;
      }
    }

    console.log(`[copy-ffmpeg-core] Ensured ${copied}/${files.length} files in /public/ffmpeg`);
  } catch (err) {
    console.error('[copy-ffmpeg-core] Failed to prepare ffmpeg core files:', err);
    process.exitCode = 1;
  }
}

run();