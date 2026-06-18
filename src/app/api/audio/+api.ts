import { Readable } from 'node:stream';
import { resolveStemPath, stemFileSize, type StemAudioKind } from '../../../lib/stem-assets';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const VALID_STEMS = new Set<StemAudioKind>(['bass', 'drums', 'guitar', 'vocals', 'no_vocals']);

async function streamResponse(filePath: string, start: number, end: number, size: number, partial: boolean): Promise<Response> {
  const { createReadStream } = await import('node:fs');
  const nodeStream = createReadStream(filePath, { start, end });
  const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  const headers: Record<string, string> = {
    'content-type': 'audio/mpeg',
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
  };
  if (partial) {
    headers['content-length'] = String(end - start + 1);
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
  } else {
    headers['content-length'] = String(size);
  }
  return new Response(body, { status: partial ? 206 : 200, headers });
}

/**
 * Streams a LALAL stem MP3 for a demo track, with HTTP Range support so the
 * player can seek. Used by useStemAudio to play/isolate stems in sync with
 * the haptic score.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const trackId = Number(url.searchParams.get('trackId') ?? 0);
  const stem = (url.searchParams.get('stem') ?? '') as StemAudioKind;

  if (!trackId) return json({ error: 'trackId required' }, 400);
  if (!VALID_STEMS.has(stem)) return json({ error: 'stem must be bass|drums|guitar|vocals|no_vocals' }, 400);

  const filePath = resolveStemPath(trackId, stem);
  if (!filePath) {
    return json({ error: 'stems not available for this track' }, 404);
  }

  const size = stemFileSize(filePath);
  if (size <= 0) return json({ error: 'stem file unreadable' }, 500);

  const range = req.headers.get('range');
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : size - 1;
      const clampedEnd = Math.min(end, size - 1);
      if (start > clampedEnd || start >= size) {
        return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
      }
      return streamResponse(filePath, start, clampedEnd, size, true);
    }
  }

  return streamResponse(filePath, 0, size - 1, size, false);
}
