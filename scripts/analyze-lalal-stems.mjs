import { spawn } from 'node:child_process';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const root = process.cwd();
const inputDir = path.join(root, 'assets', 'lalalai');
const outputFile = path.join(root, 'src', 'lib', 'generated', 'dani-california-stem-analysis.ts');
const sampleRate = 1000;
const windowMs = 500;
const samplesPerWindow = Math.round((sampleRate * windowMs) / 1000);

const stems = {
  bass: '_bass_',
  drums: '_drum_',
  guitar: '_electric_guitar_',
  vocals: '_vocals_',
};

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

async function findStemFiles() {
  const files = await readdir(inputDir);
  const found = {};
  for (const [name, marker] of Object.entries(stems)) {
    const file = files.find((candidate) => candidate.includes(marker) && candidate.endsWith('.mp3'));
    if (!file) throw new Error(`Missing LALAL stem with marker ${marker}`);
    found[name] = path.join(inputDir, file);
  }
  return found;
}

async function decodeMonoPcm(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      '-v', 'error',
      '-i', file,
      '-ac', '1',
      '-ar', String(sampleRate),
      '-f', 's16le',
      'pipe:1',
    ]);
    const chunks = [];
    let stderr = '';
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}

function rmsWindows(buffer) {
  const samples = [];
  for (let i = 0; i + 1 < buffer.length; i += 2) {
    samples.push(buffer.readInt16LE(i) / 32768);
  }

  const rms = [];
  for (let start = 0; start < samples.length; start += samplesPerWindow) {
    const end = Math.min(samples.length, start + samplesPerWindow);
    let sum = 0;
    for (let i = start; i < end; i++) sum += samples[i] * samples[i];
    rms.push(Math.sqrt(sum / Math.max(1, end - start)));
  }

  const ref = Math.max(0.001, percentile(rms, 0.95));
  return rms.map((v) => {
    const normalized = clamp01(v / ref);
    return normalized < 0.04 ? 0 : Number(normalized.toFixed(2));
  });
}

function buildFrames(envelopes) {
  const maxLength = Math.max(...Object.values(envelopes).map((v) => v.length));
  const frames = [];
  for (let i = 0; i < maxLength; i++) {
    frames.push({
      t: i * windowMs,
      bass: envelopes.bass[i] ?? 0,
      drums: envelopes.drums[i] ?? 0,
      guitar: envelopes.guitar[i] ?? 0,
      vocals: envelopes.vocals[i] ?? 0,
    });
  }
  return frames;
}

function trimSilentTail(frames) {
  let lastActiveIndex = frames.length - 1;
  for (; lastActiveIndex >= 0; lastActiveIndex--) {
    const frame = frames[lastActiveIndex];
    const total = frame.bass + frame.drums + frame.guitar + frame.vocals;
    if (total > 0.04) break;
  }
  return frames.slice(0, Math.max(1, lastActiveIndex + 2));
}

async function main() {
  if (!ffmpegPath) throw new Error('ffmpeg-static did not resolve a binary');
  const files = await findStemFiles();
  const envelopes = {};
  for (const [name, file] of Object.entries(files)) {
    const pcm = await decodeMonoPcm(file);
    envelopes[name] = rmsWindows(pcm);
  }

  const frames = trimSilentTail(buildFrames(envelopes));
  const durationMs = frames.at(-1)?.t ? frames.at(-1).t + windowMs : 0;
  const body = `import type { StemAnalysis } from '../types';\n\n` +
    `export const DANI_CALIFORNIA_TRACK_IDS = new Set([95574135]);\n\n` +
    `export const DANI_CALIFORNIA_STEM_ANALYSIS: StemAnalysis = ${JSON.stringify({
      source: 'lalal-local',
      durationMs,
      bpm: 96,
      frames,
    }, null, 2)};\n`;

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, body);
  console.log(`Wrote ${path.relative(root, outputFile)} with ${frames.length} frames`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
