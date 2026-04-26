# AI Meeting Notes Telegram Bot

A professional Telegram bot that transcribes voice messages and audio files using Groq Whisper, analyzes them with LLM to extract structured meeting notes, and saves everything to PocketBase.

## Features

- 🎤 **Voice Message Transcription**: Convert voice messages to text using Groq Whisper
- 📁 **Audio File Processing**: Support for MP3, MP4, WAV, and other audio formats
- 🤖 **AI-Powered Analysis**: Extract structured meeting notes using Llama 3.3
- 💾 **PocketBase Integration**: Save all data to your PocketBase instance
- 📝 **Structured Output**: Summary, decisions, action items, topics, and project tags
- 🔧 **Adjustment Commands**: Re-analyze with different instructions (e.g., "make it shorter")
- ⚡ **Progressive Status Updates**: Real-time feedback during processing

## Tech Stack

- **Node.js** + **TypeScript**
- **Grammy.js** - Telegram Bot Framework
- **Groq SDK** - Whisper transcription + Llama analysis
- **PocketBase JS SDK** - Database and file storage
- **dotenv** - Environment variable management
- **axios** - HTTP client for file downloads

## Project Structure

```
bot/
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Template for environment variables
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file
└── src/
    ├── index.ts            # Main entry point
    ├── pbAdmin.ts          # PocketBase admin authentication
    ├── aiService.ts        # Groq API (transcription + analysis)
    ├── handlers/
    │   ├── commandHandler.ts   # /start, /help, /adjust commands
    │   ├── voiceHandler.ts     # Voice message processing
    │   ├── textHandler.ts      # Direct text transcript input
    │   └── adjustHandler.ts    # Adjustment commands
    ├── services/
    │   ├── storageService.ts   # File upload to PocketBase
    │   └── meetingService.ts   # Meeting record management
    ├── utils/
    │   ├── formatters.ts       # Message formatting utilities
    │   └── helpers.ts          # Helper functions
    └── types.ts            # TypeScript type definitions
```

## Setup

### 1. Install Dependencies

```bash
cd bot
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Required variables:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from BotFather
- `TELEGRAM_BOT_USERNAME` - Your bot's username
- `GROQ_API_KEY` - Your Groq API key
- `POCKETBASE_URL` - Your PocketBase instance URL
- `POCKETBASE_ADMIN_EMAIL` - PocketBase admin email
- `POCKETBASE_ADMIN_PASSWORD` - PocketBase admin password

### 3. PocketBase Schema Setup

Create the following collections in your PocketBase instance:

**Collection: `meetings`**
| Field | Type | Options |
|-------|------|---------|
| `telegram_user_id` | Number | Required |
| `telegram_username` | Text | - |
| `full_name` | Text | - |
| `audio_file` | File | Max 1 file |
| `transcript` | Text | Required |
| `summary` | Text | Required |
| `decisions` | JSON | - |
| `action_items` | JSON | - |
| `topics` | JSON | - |
| `project_tag` | Text | - |
| `duration` | Number | - |
| `ai_model_used` | Text | - |

**Collection: `action_items`**
| Field | Type | Options |
|-------|------|---------|
| `meeting` | Relation | Link to `meetings` |
| `task` | Text | Required |
| `assignee` | Text | - |
| `due_date` | Text | - |
| `priority` | Select | high, medium, low |
| `completed` | Bool | Default: false |

## Usage

### Running the Bot

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

**Direct production run** (with tsx):
```bash
npm run prod
```

### Bot Commands

- `/start` - Welcome message and introduction
- `/help` - Show help and usage instructions
- `/adjust` - Enter adjustment mode for re-analyzing notes
- `/status` - Check bot status

### How It Works

1. **Send a voice message or audio file** to the bot
2. **Wait for processing** (~30-60 seconds):
   - ⬇️ Downloading audio
   - 🎙️ Transcribing with Whisper
   - 🤖 Analyzing with Llama
   - 💾 Saving to database
3. **Receive formatted notes** with:
   - Summary
   - Topics discussed
   - Decisions made
   - Action items (with assignees and priorities)
   - Project tag

### Adjustment Commands

After receiving notes, send adjustment instructions:
- "make it shorter"
- "more formal"
- "focus on action items"
- "add more details"
- "simplify the language"

## API Reference

### Groq Models Used

- **Transcription**: `whisper-large-v3-turbo`
- **Analysis**: `llama-3.1-8b-instant` (or `llama-3.3-70b` for better results)

## Error Handling

The bot includes comprehensive error handling:
- Network timeouts with retry logic
- API rate limiting
- Invalid file formats
- Authentication failures
- Graceful degradation

## Logging

Console logging includes:
- Request timestamps
- User IDs and usernames
- Processing duration
- Error details

## Security Notes

- Never commit `.env` file to version control
- Use strong admin password for PocketBase
- Restrict bot access if needed
- Monitor API usage limits

## License

MIT