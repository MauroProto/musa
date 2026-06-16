import type { EnergyPoint } from './types';

export type StemEnergyResult = {
  energy: EnergyPoint[];
  source: 'lalal' | 'estimated';
};

export function hasLalalKey(): boolean {
  return Boolean(process.env.LALAL_API_KEY);
}

export function lalalBaseUrl(): string {
  return process.env.LALAL_BASE_URL ?? 'https://www.lalal.ai/api';
}

type LalalJobState = {
  id: string;
  status: 'success' | 'processing' | 'error';
  split?: { drums?: string; bass?: string; vocals?: string };
};

async function uploadAndSplit(audioSource: { url?: string; bytes?: Buffer }): Promise<LalalJobState> {
  const key = process.env.LALAL_API_KEY!;
  const form = new FormData();
  form.set('api_key', key);
  form.set('stem', 'drums+bass+vocals');
  if (audioSource.url) form.set('link', audioSource.url);
  else if (audioSource.bytes) form.set('file', new Blob([new Uint8Array(audioSource.bytes)]));

  const res = await fetch(`${lalalBaseUrl()}/upload/`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`LALAL upload HTTP ${res.status}`);
  const json = (await res.json()) as { id?: string; error?: string };
  if (json.error) throw new Error(`LALAL: ${json.error}`);
  if (!json.id) throw new Error('LALAL: missing job id');
  return pollJob(json.id);
}

async function pollJob(id: string): Promise<LalalJobState> {
  const key = process.env.LALAL_API_KEY!;
  const deadline = Date.now() + 6 * 60 * 1000;
  while (Date.now() < deadline) {
    const res = await fetch(`${lalalBaseUrl()}/result/?api_key=${encodeURIComponent(key)}&id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`LALAL result HTTP ${res.status}`);
    const json = (await res.json()) as Partial<LalalJobState> & { error?: string };
    if (json.error) throw new Error(`LALAL: ${json.error}`);
    if (json.status === 'success' || json.status === 'error') return json as LalalJobState;
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error('LALAL: job timed out');
}

async function downloadStemEnvelope(stemUrl: string): Promise<EnergyPoint[]> {
  const { spawn } = await import('node:child_process');

  const audioRes = await fetch(stemUrl);
  if (!audioRes.ok) throw new Error(`stem download HTTP ${audioRes.status}`);
  const buf = Buffer.from(await audioRes.arrayBuffer());

  const windowMs = 500;
  const args = [
    '-i', 'pipe:0',
    '-filter:a', `astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level`,
    '-f', 'null', '-',
  ];

  return new Promise<EnergyPoint[]>((resolve, reject) => {
    const child = spawn('ffmpeg', args);
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ffmpeg timed out'));
    }, 120000);

    child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    child.on('error', (e: Error) => {
      clearTimeout(timer);
      reject(new Error(`ffmpeg failed: ${e.message}`));
    });
    child.on('close', (code: number) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-400)}`));
        return;
      }
      const points: EnergyPoint[] = [];
      const lines = stdout.split(/\r?\n/);
      let t = 0;
      for (const ln of lines) {
        const m = ln.match(/lavfi\.astats\.Overall\.RMS_level=(-?\d+(?:\.\d+)?)/);
        if (m) {
          const db = Number(m[1]);
          const value = Math.max(0, Math.min(1, Math.pow(10, (db + 40) / 40)));
          points.push({ t, value });
          t += windowMs;
        }
      }
      resolve(points);
    });

    child.stdin.on('error', () => { /* pipe may close early */ });
    child.stdin.end(buf);
  });
}

export async function getStemEnergy(
  audioSource: { url?: string; bytes?: Buffer } | null,
  fallback?: () => EnergyPoint[],
): Promise<StemEnergyResult> {
  if (!hasLalalKey() || !audioSource) {
    return { energy: fallback?.() ?? [], source: 'estimated' };
  }
  try {
    const job = await uploadAndSplit(audioSource);
    if (job.status !== 'success' || !job.split) {
      return { energy: fallback?.() ?? [], source: 'estimated' };
    }
    const drums = job.split.drums ? await downloadStemEnvelope(job.split.drums) : [];
    const bass = job.split.bass ? await downloadStemEnvelope(job.split.bass) : [];
    const byT = new Map<number, number>();
    for (const p of [...drums, ...bass]) {
      const key = Math.round(p.t / 250) * 250;
      byT.set(key, Math.max(byT.get(key) ?? 0, p.value));
    }
    const energy = [...byT.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([t, value]) => ({ t, value: Math.max(0.05, Math.min(1, value)) as number }));
    return { energy, source: 'lalal' };
  } catch {
    return { energy: fallback?.() ?? [], source: 'estimated' };
  }
}
