/**
 * AI Service — multi-provider analysis with automatic fallback.
 *
 * Provider chain (analysis):  Groq → Cerebras → Gemini
 * Transcription:              Groq Whisper (best-in-class for audio)
 *
 * On rate-limit or server error the next provider is tried automatically.
 */

import Groq, { toFile } from 'groq-sdk';
import axios from 'axios';
import { MeetingData } from './types.js';
import { type Language, tr, DEFAULT_LANGUAGE } from './i18n.js';

// ─── Groq client (shared for transcription + primary analysis) ────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Transcription ─────────────────────────────────────────────────────────────

/**
 * Transcribe audio using Groq Whisper.
 * Language is intentionally auto-detected — handles Uzbek, Russian, English, and mixed speech.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string = 'audio.ogg',
  mimeType: string = 'audio/ogg'
): Promise<string> {
  try {
    console.log(`[transcribe] file=${fileName} size=${audioBuffer.length}B`);

    const file = await toFile(audioBuffer, fileName, { type: mimeType });

    const result = await groq.audio.transcriptions.create({
      file,
      model: process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo',
      // No language param → Whisper auto-detects (handles uz/ru/en and mixed)
      response_format: 'json',
    });

    const text = (result.text || '').trim();
    console.log(`[transcribe] done — ${text.length} chars`);

    if (!text) {
      throw new Error(
        'The recording appears to be silent or could not be transcribed. ' +
        'Please try a clearer recording and make sure the microphone is working.'
      );
    }

    return text;
  } catch (error) {
    console.error('[transcribe] error:', error);
    if (error instanceof Error) throw new Error(`Transcription failed: ${error.message}`);
    throw new Error('Transcription failed');
  }
}

// ─── Analysis provider implementations ─────────────────────────────────────────

/** Returns true for errors that should trigger a fallback to the next provider. */
function isRetryable(error: any): boolean {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  const msg = String(error?.message ?? error?.response?.data?.error?.message ?? '').toLowerCase();
  return (
    status === 429 || status === 500 || status === 502 || status === 503 || status === 524 ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('too many requests') ||
    msg.includes('overloaded') ||
    msg.includes('service unavailable') ||
    msg.includes('timeout') ||
    msg.includes('exceeded') ||
    msg.includes('capacity')
  );
}

/** Primary: Groq (llama-3.3-70b-versatile — strong multilingual support) */
async function analyzeWithGroq(systemPrompt: string, userContent: string): Promise<string> {
  const model = process.env.GROQ_ANALYSIS_MODEL || 'llama-3.3-70b-versatile';
  console.log(`[groq] model=${model}`);

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    model,
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return text;
}

/** Fallback 1: Cerebras — Qwen-3-235b, excellent multilingual + Central Asian context */
async function analyzeWithCerebras(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw Object.assign(new Error('No Cerebras key'), { status: 503 });

  const model = process.env.CEREBRAS_MODEL || 'qwen-3-235b-a22b-instruct-2507';
  console.log(`[cerebras] model=${model}`);

  const res = await axios.post(
    'https://api.cerebras.ai/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 90_000,
    }
  );

  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return text;
}

/** Fallback 2: Gemini 2.0 Flash — strong at code-switching and multilingual tasks */
async function analyzeWithGemini(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('No Gemini key'), { status: 503 });

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  console.log(`[gemini] model=${model}`);

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userContent }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    },
    { timeout: 90_000 }
  );

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');
  return text;
}

// ─── Provider chain ────────────────────────────────────────────────────────────

const PROVIDERS: Array<{ name: string; fn: (s: string, u: string) => Promise<string> }> = [
  { name: 'Groq',     fn: analyzeWithGroq },
  { name: 'Cerebras', fn: analyzeWithCerebras },
  { name: 'Gemini',   fn: analyzeWithGemini },
];

// ─── Public: analyzeMeeting ────────────────────────────────────────────────────

/**
 * Analyze a meeting transcript with automatic provider fallback.
 * Understands Uzbek, Russian, English, and any mix.
 * Always outputs in English.
 */
export async function analyzeMeeting(
  transcript: string,
  adjustmentInstructions?: Record<string, boolean>,
  outputLanguage: Language = DEFAULT_LANGUAGE
): Promise<MeetingData> {
  const trimmed = transcript.trim();
  if (trimmed.length < 15) {
    throw new Error(
      'The transcript is too short to analyze. Please send a longer recording or paste more text.'
    );
  }

  const systemPrompt = buildSystemPrompt(adjustmentInstructions, outputLanguage);
  const userContent = `Analyze the following meeting transcript:\n\n${trimmed}`;

  const failures: string[] = [];

  for (const provider of PROVIDERS) {
    try {
      console.log(`[analysis] trying ${provider.name}…`);
      const raw = await provider.fn(systemPrompt, userContent);
      const data = parseMeetingData(raw);
      console.log(`[analysis] ✅ ${provider.name} — ${data.action_items.length} action items`);
      return data;
    } catch (err: any) {
      if (isRetryable(err)) {
        const reason = err?.response?.data?.error?.message || err?.message || 'unavailable';
        console.warn(`[analysis] ⚠️ ${provider.name} failed (${reason?.slice(0, 80)}), trying next…`);
        failures.push(`${provider.name}: ${reason?.slice(0, 100)}`);
        continue;
      }
      // Non-retryable (bad prompt, parse error, etc.) — propagate immediately
      console.error(`[analysis] ❌ ${provider.name} non-retryable:`, err.message);
      throw new Error(`Analysis failed: ${err.message}`);
    }
  }

  throw new Error(
    'All AI providers are currently unavailable. Please try again in a moment.\n' +
    failures.join('\n')
  );
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(adjustmentInstructions?: Record<string, boolean>, outputLanguage: Language = DEFAULT_LANGUAGE): string {
  const outputInstruction = tr(outputLanguage).ai_output_lang;
  let prompt = `You are an expert multilingual meeting analyst. You are fluent in Uzbek, Russian, and English, and you deeply understand how speakers naturally mix these languages in real conversations.

LANGUAGE UNDERSTANDING:
- Transcripts may be in Uzbek, Russian, English, or any combination of these languages
- Code-switching is common and natural — speakers often mix mid-sentence, for example:
  "Bu project deadline Tuesday, давай обсудим budget allocation"
  "Mana bu feature uchun я возьму на себя, okay?"
  "Pipeline ready bo'ldi, нужно deployment qilish"
- Uzbek may appear in Latin script (bu, va, uchun, kerak, qilish, bo'ldi) or Cyrillic (бу, ва, учун, керак)
- Understand ALL input regardless of language mixing — treat it as one coherent conversation
- Recognize Uzbek phrases that signal commitments: "men qilaman / qilib beraman" (I will do it), "tayyor" (ready), "kerak" (needed), "ertaga" (tomorrow), "keyingi hafta" (next week), "bugun" (today)
- Recognize Russian commitment phrases: "я займусь" (I'll handle it), "возьму на себя" (I'll take it on), "сделаю" (I'll do it), "к среде/пятнице" (by Wednesday/Friday)

OUTPUT LANGUAGE:
${outputInstruction} Keep names and proper nouns in their original spelling.

EXTRACTION — be thorough, capture every important point:
- summary: 3-5 sentences covering what was discussed, what was decided, and what happens next. Be specific, not generic.
- decisions: Every agreement, choice, or conclusion reached — even briefly mentioned ones.
- action_items: Every task, commitment, or follow-up. Include who is responsible if named. Convert relative dates (ertaga → "tomorrow", keyingi hafta → "next week", в среду → "Wednesday") to their English equivalent.
- topics: The main subjects or agenda points covered.
- project_tag: The most specific project, team, or context name mentioned (single word or short phrase).

Return ONLY a valid JSON object in this exact structure:
{
  "summary": "...",
  "decisions": ["...", "..."],
  "action_items": [
    {
      "task": "...",
      "assignee": "Name if mentioned",
      "due_date": "Date/deadline if mentioned",
      "priority": "high or medium or low"
    }
  ],
  "topics": ["...", "..."],
  "project_tag": "..."
}

RULES:
- Base EVERYTHING only on what is actually said — never hallucinate or invent
- If no decisions: "decisions": []
- If no action items: "action_items": []
- Omit "assignee" and "due_date" from an action item if not mentioned
- project_tag must be 1-3 words maximum`;

  if (adjustmentInstructions) {
    const parts: string[] = [];
    if (adjustmentInstructions.shorter)       parts.push('- Make the summary MORE CONCISE (2-3 sentences)');
    if (adjustmentInstructions.longer)        parts.push('- Make the summary MORE DETAILED (5-7 sentences)');
    if (adjustmentInstructions.formal)        parts.push('- Use FORMAL, professional language');
    if (adjustmentInstructions.casual)        parts.push('- Use CASUAL, conversational language');
    if (adjustmentInstructions.focus_action)  parts.push('- Maximize ACTION ITEM extraction — be exhaustive');
    if (adjustmentInstructions.focus_decisions) parts.push('- Emphasize DECISIONS prominently');
    if (adjustmentInstructions.simplify)      parts.push('- Use SIMPLE language, avoid jargon');
    if (parts.length > 0) {
      prompt += '\n\nADJUSTMENT INSTRUCTIONS:\n' + parts.join('\n');
    }
  }

  return prompt;
}

// ─── JSON parsing ──────────────────────────────────────────────────────────────

function parseMeetingData(content: string): MeetingData {
  try {
    const parsed = JSON.parse(content.trim());
    return {
      summary:      parsed.summary || 'No summary available',
      decisions:    Array.isArray(parsed.decisions)    ? parsed.decisions.filter(Boolean)    : [],
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items.map(parseActionItem) : [],
      topics:       Array.isArray(parsed.topics)       ? parsed.topics.filter(Boolean)       : [],
      project_tag:  parsed.project_tag || 'General',
    };
  } catch (err) {
    console.error('[parse] failed — raw:', content?.slice(0, 300));
    throw new Error('Failed to parse AI response as JSON');
  }
}

function parseActionItem(item: unknown): {
  task: string;
  assignee?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
} {
  if (typeof item === 'string') return { task: item };

  if (typeof item === 'object' && item !== null) {
    const o = item as Record<string, unknown>;
    return {
      task:     (o.task as string) || 'Unspecified task',
      assignee: o.assignee  ? (o.assignee  as string) : undefined,
      due_date: o.due_date  ? (o.due_date  as string) : undefined,
      priority: o.priority  ? (o.priority  as 'low' | 'medium' | 'high') : undefined,
    };
  }

  return { task: 'Unspecified task' };
}

// ─── Re-analysis (for adjustment commands) ────────────────────────────────────

export async function reanalyzeWithAdjustments(
  originalTranscript: string,
  adjustmentInstructions: Record<string, boolean>,
  outputLanguage: Language = DEFAULT_LANGUAGE
): Promise<MeetingData> {
  return analyzeMeeting(originalTranscript, adjustmentInstructions, outputLanguage);
}

export { groq };
