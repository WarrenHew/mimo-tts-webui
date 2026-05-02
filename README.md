# MiMo Studio — Character Voice Dubbing

A professional web UI for MiMo TTS v2.5, designed for character voice dubbing (配音) workflows.

**MiMo Studio** brings the power of MiMo's text-to-speech models into a recording-studio-inspired interface. Create characters, write scripts with emotion and dialect tags, and generate expressive voice audio — all without touching the command line.

## Features

- **Character Profiles** — Save voice configurations per character (voice, style, model)
- **Script Editor** — Write multi-line scripts with inline emotion/dialect tags
- **Voice Selection** — 8 preset voices (Chinese & English) + Voice Design & Voice Clone models
- **Style Control** — Natural language style prompts for fine-grained delivery control
- **Tag Bar** — Quick-insert emotion (开心, 悲伤...), dialect (东北话, 粤语...), speed, and tone tags
- **Audio Playback** — Built-in player with waveform visualization, volume control, and download
- **Dark Studio Theme** — Warm amber accents on deep charcoal, inspired by professional recording studios

## Architecture

```
mimo-tts-webui/
├── backend/          # Fastify API proxy
│   └── src/
│       ├── providers/mimo.ts   # MiMo TTS API client
│       ├── routes/tts.ts       # TTS + voices + health routes
│       └── index.ts            # Server entry
├── frontend/         # Next.js App Router
│   └── src/
│       ├── app/                # Page + layout + globals
│       ├── components/         # VoiceSelector, TagBar, AudioPlayer, CharacterForm
│       ├── hooks/              # useCharacters (localStorage persistence)
│       ├── lib/                # API client, tag presets
│       └── types/              # TypeScript type defs
```

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- A MiMo TTS API key from [Xiaomi MiMo Platform](https://platform.xiaomimimo.com)

### Setup

```bash
# Clone and enter directory
cd mimo-tts-webui

# Install dependencies
pnpm install

# Configure your API key
cp backend/.env.example backend/.env
# Edit backend/.env → set MIMO_API_KEY=your_key_here

# Start development servers
pnpm dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MIMO_API_KEY` | Yes | — | MiMo API token |
| `MIMO_BASE_URL` | No | `https://api.xiaomimimo.com` | API base URL |
| `PORT` | No | `3001` | Backend port |
| `CORS_ORIGINS` | No | — | Additional CORS origins |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/tts/generate` | Generate TTS audio |
| `GET` | `/api/voices` | List voices and models |
| `GET` | `/api/health` | Health check + API key status |

## Docker

```bash
docker-compose up -d
```

## Models

| Model | Description |
|-------|-------------|
| `MiMo-V2.5-TTS` | 8 preset voices with emotion/speed control |
| `MiMo-V2.5-TTS-VoiceDesign` | Create custom voices from natural language description |
| `MiMo-V2.5-TTS-VoiceClone` | Clone voices from reference audio |

## License

MIT
