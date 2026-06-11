// ============================================================
// POST /api/transcribe
// Body (JSON): { audioBase64, mime }   — the recorded blob, base64-encoded.
// Returns: { transcript, confidence, language }  ('high'|'medium'|'low')
//
// PROVIDER-AGNOSTIC. The real provider call lives in callProvider().
// Today: OpenAI Whisper (uses the OPENAI_API_KEY you already have).
// To switch to Deepgram later: set TRANSCRIPTION_PROVIDER=deepgram and
// DEEPGRAM_API_KEY — only callDeepgram() runs; nothing else changes.
//
// Honest placeholder behaviour: if no transcription key is configured,
// returns { status:'placeholder' } so the client falls back to the
// manual review form (tapd-sync's call() already treats that as null).
// ============================================================

export const config = {
  api: {
    bodyParser: { sizeLimit: '25mb' } // audio blobs are large; Whisper caps at 25MB
  }
};

const PROVIDER = (process.env.TRANSCRIPTION_PROVIDER || 'openai').toLowerCase();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioBase64, mime } = req.body || {};
  if (!audioBase64) {
    return res.status(400).json({ error: 'Missing audioBase64.' });
  }

  // Decide provider + key. If neither key is set, behave as a placeholder.
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  const useDeepgram = PROVIDER === 'deepgram' && !!deepgramKey;
  const useOpenAI = !useDeepgram && !!openaiKey;

  if (!useDeepgram && !useOpenAI) {
    return res.status(200).json({
      status: 'placeholder',
      message: 'No transcription provider configured. Set OPENAI_API_KEY (Whisper) or DEEPGRAM_API_KEY.'
    });
  }

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    const result = useDeepgram
      ? await callDeepgram(buffer, mime, deepgramKey)
      : await callWhisper(buffer, mime, openaiKey);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[transcribe] error:', err);
    return res.status(500).json({ error: 'Transcription failed', detail: String(err.message || err) });
  }
}

// ---------- OpenAI Whisper ----------
// No diarisation (Whisper doesn't do speaker labels) — returns flat transcript.
// For a single-blob networking capture this is enough for the structuring step.
async function callWhisper(buffer, mime, apiKey) {
  const ext = mimeToExt(mime);
  const form = new FormData();
  // Node 18+ (Vercel) has global FormData/Blob/fetch.
  form.append('file', new Blob([buffer], { type: mime || 'audio/webm' }), `audio.${ext}`);
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json'); // gives us segments + language

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Whisper ${resp.status}: ${detail.slice(0, 300)}`);
  }

  const data = await resp.json();
  const transcript = (data.text || '').trim();
  return {
    transcript,
    language: data.language || 'en',
    confidence: confidenceFromWhisper(data),
    provider: 'openai-whisper'
  };
}

// Whisper doesn't return a single confidence number. Derive a coarse band from
// avg_logprob across segments when present; otherwise infer from transcript length.
function confidenceFromWhisper(data) {
  const segs = Array.isArray(data.segments) ? data.segments : [];
  if (segs.length) {
    const avg = segs.reduce((a, s) => a + (typeof s.avg_logprob === 'number' ? s.avg_logprob : -1), 0) / segs.length;
    // avg_logprob: closer to 0 is better; typical good speech ~ -0.2, poor ~ -0.9
    if (avg >= -0.35) return 'high';
    if (avg >= -0.6) return 'medium';
    return 'low';
  }
  const len = (data.text || '').trim().length;
  return len > 200 ? 'high' : len > 40 ? 'medium' : 'low';
}

// ---------- Deepgram (ready, used when TRANSCRIPTION_PROVIDER=deepgram) ----------
// Diarisation ON — returns transcript; speaker handling can be expanded later.
async function callDeepgram(buffer, mime, apiKey) {
  const url = 'https://api.deepgram.com/v1/listen'
    + '?model=nova-2&smart_format=true&punctuate=true&diarize=true&language=en';
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': mime || 'audio/webm'
    },
    body: buffer
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Deepgram ${resp.status}: ${detail.slice(0, 300)}`);
  }

  const data = await resp.json();
  const alt = data?.results?.channels?.[0]?.alternatives?.[0] || {};
  const transcript = (alt.transcript || '').trim();
  const conf = typeof alt.confidence === 'number'
    ? (alt.confidence >= 0.85 ? 'high' : alt.confidence >= 0.6 ? 'medium' : 'low')
    : 'medium';
  return { transcript, language: 'en', confidence: conf, provider: 'deepgram-nova-2' };
}

function mimeToExt(mime) {
  if (!mime) return 'webm';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'mp4';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}
