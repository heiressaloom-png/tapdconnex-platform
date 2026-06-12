// ============================================================
// POST /api/process-capture
// Body (JSON): { transcript, template, ownerStyle, userIntent, eventContext, transcriptConfidence }
// Returns: the structured relationship draft JSON (the schema in tapd-master-ai-prompt.md),
// which maps 1:1 onto the Hub capture object.
// ============================================================

import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildCapturePrompt } from './_prompt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    // No key yet — frontend will fall back to its local draft generator.
    return res.status(200).json({ status: 'placeholder', message: 'OpenAI key not configured.' });
  }

  const ctx = req.body || {};
  if (!ctx.transcript) {
    return res.status(400).json({ error: 'Missing transcript.' });
  }

  // Cost gate: the user's own gut feel is a cheap human signal captured
  // before this (expensive) structuring call. If they felt it was "just a
  // hello", skip the model entirely — the capture is still saved client-side
  // with the transcript preserved; it just doesn't get deep AI structuring.
  if (ctx.gutFeel === 'light') {
    return res.status(200).json({ status: 'gated', reason: 'gut_feel_light' });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildCapturePrompt(ctx) }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Defensive: strip any stray fences and retry once.
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    }

    // Minimal schema guard so the Hub never receives something it can't read.
    if (!parsed.person) {
      return res.status(200).json({ status: 'placeholder', message: 'Model returned an unusable shape.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[process-capture] error:', err);
    return res.status(500).json({ error: 'Structuring failed', detail: String(err.message || err) });
  }
}
