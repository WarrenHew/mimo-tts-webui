# Task Plan: MiMo TTS WebUI for Character Voice Dubbing

## Goal
Build a production-ready web UI for MiMo TTS v2.5 API, targeting character voice dubbing (配音) professionals. Users can manage characters, write scripts with per-line emotion/dialect tags, generate speech, and download audio.

## API Understanding
- Endpoint: POST https://api.xiaomimimo.com/v1/chat/completions
- Model: MiMo-V2.5-TTS (preset voices), MiMo-V2.5-TTS-VoiceDesign (custom voices), MiMo-V2.5-TTS-VoiceClone (cloning)
- Preset voices: 冰糖、茉莉、苏打、白桦 (CN), Mia、Chloe、Milo、Dean (EN)
- Control: natural language director mode + inline tags (e.g. `(开心)`, `[emotion: excited]`)
- Auth: Bearer token via MIMO_API_KEY
- Format: OpenAI Chat Completions compatible

## Phases

### Phase 1: Project Structure (pending)
- [ ] Initialize monorepo with pnpm
- [ ] Create backend/ (Fastify + TypeScript)
- [ ] Create frontend/ (Next.js App Router + TypeScript + TailwindCSS)
- [ ] Create shared types

### Phase 2: Backend Implementation (pending)
- [ ] MiMo API provider service (mimo.ts)
- [ ] TTS generation route (POST /api/tts/generate)
- [ ] Voice list route (GET /api/voices)
- [ ] Health check route
- [ ] CORS + error handling middleware

### Phase 3: Frontend Implementation (pending)
- [ ] Layout with dark "recording studio" aesthetic
- [ ] Voice selector (preset + custom)
- [ ] Script editor with inline tag support
- [ ] Character manager (save/load character profiles)
- [ ] Audio player + download
- [ ] Generation history

### Phase 4: Polish & Testing (pending)
- [ ] Error states and loading UI
- [ ] Responsive design
- [ ] README + env example
- [ ] Docker configuration

## Design Direction
**Recording Studio Aesthetic**: Deep charcoal backgrounds, warm amber/gold accents, subtle glow effects (like VU meters and studio equipment lights), refined typography. Professional yet creative — a tool for voice artists.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Decisions Made
| Decision | Reason | Date |
|----------|--------|------|
| Single page app (no routing) for MVP | Users need fast access to generate + play audio | 2026-05-05 |
| Character profiles stored in localStorage | Simple persistence without database for MVP | 2026-05-05 |
| Per-line emotion tags via text prefixes | Natural workflow for script editing | 2026-05-05 |
