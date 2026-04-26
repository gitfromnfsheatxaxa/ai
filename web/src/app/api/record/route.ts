import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const GROQ_KEY     = process.env.GROQ_API_KEY            || '';
const WHISPER      = process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo';
const LLM          = process.env.GROQ_ANALYSIS_MODEL      || 'llama-3.3-70b-versatile';
const PB_URL       = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://34.56.67.158:8090';
const PB_EMAIL     = process.env.POCKETBASE_ADMIN_EMAIL    || '';
const PB_PASS      = process.env.POCKETBASE_ADMIN_PASSWORD  || '';

const SYSTEM_PROMPT = `You are an expert meeting analyst. Analyze the transcript and return a JSON object with:
{
  "summary": "2-4 sentences covering what was discussed and decided",
  "decisions": ["decision 1", "decision 2"],
  "topics": ["topic 1", "topic 2"],
  "project_tag": "short project name or General",
  "action_items": [
    { "task": "task description", "assignee": "name or null", "due_date": null, "priority": "high|medium|low" }
  ]
}
Be thorough. Return valid JSON only. Understand Uzbek, Russian, English and any mix.`;

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured on server.' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request — expected multipart/form-data.' }, { status: 400 });
  }

  const audioFile = formData.get('audio') as File | null;
  const userAiId  = formData.get('userAiId') as string | null;
  const duration  = Number(formData.get('duration') ?? 0);

  if (!audioFile) {
    return NextResponse.json({ error: 'No audio file received.' }, { status: 400 });
  }

  // ── 1. Transcribe with Groq Whisper ──────────────────────────────────────────
  let transcript = '';
  try {
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile);
    whisperForm.append('model', WHISPER);
    whisperForm.append('response_format', 'json');

    const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}` },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message || `Whisper ${whisperRes.status}`);
    }

    const whisperData = await whisperRes.json() as { text: string };
    transcript = (whisperData.text || '').trim();

    if (!transcript) {
      return NextResponse.json({ error: 'The recording appears to be silent or too short. Try again.' }, { status: 422 });
    }
  } catch (err: any) {
    console.error('[record] transcription failed:', err.message);
    return NextResponse.json({ error: `Transcription failed: ${err.message}` }, { status: 500 });
  }

  // ── 2. Analyze with Groq LLM ─────────────────────────────────────────────────
  let analysis: any = { summary: '', decisions: [], topics: [], project_tag: 'General', action_items: [] };
  try {
    const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM,
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: `Analyze this meeting transcript:\n\n${transcript}` },
        ],
      }),
    });

    if (chatRes.ok) {
      const chatData = await chatRes.json() as { choices: { message: { content: string } }[] };
      const raw = chatData.choices?.[0]?.message?.content || '{}';
      try { analysis = JSON.parse(raw); } catch { /* keep defaults */ }
    }
  } catch (err: any) {
    console.warn('[record] analysis failed, skipping:', err.message);
    // Non-fatal — return transcript without analysis
  }

  // ── 3. Save to PocketBase (only if user is logged in) ────────────────────────
  let meetingId: string | null = null;
  if (userAiId && PB_EMAIL && PB_PASS) {
    try {
      const pb = new PocketBase(PB_URL);
      await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);

      const meeting = await pb.collection('meetings').create({
        user_ai:       userAiId,
        transcript:    transcript,
        summary:       analysis.summary     || '',
        decisions:     analysis.decisions   || [],
        topics:        analysis.topics      || [],
        project_tag:   analysis.project_tag || 'General',
        duration,
        ai_model_used: LLM,
      });

      meetingId = meeting.id;

      // Create action items
      for (const item of (analysis.action_items || [])) {
        await pb.collection('action_items').create({
          user_ai:  userAiId,
          meeting:  meetingId,
          task:     item.task     || '',
          assignee: item.assignee || '',
          due_date: item.due_date || null,
          priority: item.priority || 'medium',
          completed: false,
        }).catch(() => {/* non-fatal */});
      }
    } catch (err: any) {
      console.warn('[record] PocketBase save failed:', err.message);
    }
  }

  return NextResponse.json({
    transcript,
    summary:      analysis.summary     || '',
    decisions:    analysis.decisions   || [],
    topics:       analysis.topics      || [],
    project_tag:  analysis.project_tag || 'General',
    action_items: analysis.action_items || [],
    meetingId,
  });
}
