# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

```
ai-meeting-notes/
├── bot/      # Telegram bot — the live, functional part of the project
└── web/      # Next.js dashboard — currently a scaffold, not yet integrated
```

The root `package.json` and `src/` directories are unused placeholders. All real work happens inside `bot/` (and eventually `web/`).

---

## bot/

### Commands

```bash
cd bot
npm install          # install deps
npm run dev          # tsx watch — hot reload for development
npm run prod         # tsx without watch — run directly in production
npm run build        # tsc compile to dist/
npm start            # run compiled dist/index.js
```

No test runner is configured. There is no lint script.

All env vars are loaded from `bot/.env` (copy `bot/.env.example`). Required vars: `TELEGRAM_BOT_TOKEN`, `GROQ_API_KEY`, `GROQ_TRANSCRIPTION_MODEL`, `GROQ_ANALYSIS_MODEL`, `POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`.

### Architecture

**Entry point and middleware order — `src/index.ts`**

Grammy middleware must be registered in this order to work correctly:
1. Logging middleware (`bot.use`)
2. Error handler (`bot.use`)
3. Command handlers (`bot.command`)
4. Media handlers (`bot.on(':voice')`, `bot.on(':audio')`)
5. Text router (`bot.on('message:text')`) — this is a single handler that branches to: menu buttons → commands → adjustment handler → text/transcript handler

**PocketBase auth — `src/pbAdmin.ts`**

`getPocketBase()` returns a module-level singleton. `initializeAdminAuth()` is called once at startup. Re-auth on demand uses `pb.admins.authWithPassword()` (PocketBase SDK 0.26.x compatibility shim). The correct stale-token check is `!pb.authStore.isValid` — **do not use** `pb.authStore.isAdmin` which was removed in SDK 0.20 and evaluates to `undefined`.

**Data flow — voice/audio message**

```
Telegram voice/audio
  → downloadFileFromTelegram (axios, helpers.ts)
  → transcribeAudio (Groq Whisper, aiService.ts)
  → analyzeMeeting (Groq Llama → JSON, aiService.ts)
  → getOrCreateUserAI (PocketBase user_ai collection, meetingService.ts)
  → createMeetingRecord + createActionItem (meetingService.ts)
  → uploadAudioFile [non-critical, wrapped in try-catch] (storageService.ts)
  → ctx.reply formatted notes
```

Text transcripts skip the first two steps. The adjustment flow (`adjustHandler.ts`) fetches the latest meeting from DB, re-runs `analyzeMeeting` with instruction flags, then calls `reanalyzeMeeting` which deletes old action items and creates new ones.

**PocketBase collections**

| Collection | Key fields | Notes |
|---|---|---|
| `user_ai` | `telegram_id` (Number), `telegram_username`, `full_name` | Auth collection; created with random password |
| `meetings` | `user_ai` (relation), `telegram_user_id`, `transcript`, `summary`, `decisions` (JSON), `topics` (JSON), `project_tag`, `audio_file` (File), `duration`, `ai_model_used` | |
| `action_items` | `user_ai` (relation), `meeting` (relation), `task`, `assignee`, `due_date`, `priority` (select), `completed` (bool) | |

**Relation filters** — when filtering `action_items` by user, use `user_ai.telegram_id = ${telegramId}` (dot-notation through the relation). Using `user_ai.id` with a Telegram integer ID will never match.

**In-flight context tracking**

`voiceHandler.ts`, `textHandler.ts`, and `adjustHandler.ts` each maintain a module-level `Map<userId, BotContext>` to track the status message ID and processing state for concurrent users. A user sending a second message while one is processing gets a "please wait" reply.

**AI service — `src/aiService.ts`**

`analyzeMeeting` uses `response_format: { type: 'json_object' }` with Groq chat completions. The system prompt in `buildSystemPrompt()` specifies the exact JSON schema. Adjustment instructions are appended to the same prompt as `ADJUSTMENT INSTRUCTIONS:` lines. Models are read from env: `GROQ_TRANSCRIPTION_MODEL` (Whisper), `GROQ_ANALYSIS_MODEL` (Llama).

**File uploads — `src/services/storageService.ts`**

PocketBase expects a `File` object (not a bare `Blob`) for file field uploads. Always construct `new File([arrayBuffer], fileName, { type: mimeType })` before passing to `pb.collection('meetings').update()`. Audio upload is non-critical and must not block note delivery — always wrap in try-catch in callers.

---

## web/

### Commands

```bash
cd web
npm install
npm run dev     # Next.js dev server
npm run build   # production build
npm run lint    # eslint
```

**Important:** This project uses Next.js 16 with breaking changes from earlier versions. Read `web/node_modules/next/dist/docs/` before writing any Next.js code — APIs, file conventions, and component behavior may differ from training data.

The dashboard is currently a scaffold with no PocketBase integration. When building it out, connect to the same PocketBase instance defined in `bot/.env` (or a shared `.env`).
