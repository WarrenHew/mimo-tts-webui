# Progress Log

## Session: 2026-05-05

### Completed Fixes (Round 2)

**API Key Loading (FIXED)**
- Added `--env-file=.env` to backend dev script (Node.js 22 native env loading)
- Env vars loaded BEFORE any module evaluation, eliminating race conditions
- Added diagnostic logging at startup (key preview, base URL)
- Kept `import 'dotenv/config'` as fallback

**Theme Toggle (FIXED)**
- Renamed CSS variables to `--theme-*` prefix for clarity
- Dual selectors: `html.dark` and `html[data-theme='dark']` for robustness
- Lazy state initializer in React reads DOM directly (no FOUC)
- Added `data-theme` attribute for debugging
- Added `transition-colors` for smooth theme transitions

**Error Handling (IMPROVED)**
- Better error messages in frontend API client
- Backend now logs full error details before responding
- Network errors show "Cannot connect to backend" instead of "Unknown error"

**i18n System (NEW)**
- 5 languages: English, 简体中文, 繁體中文, 日本語, 한국어
- 40+ translation keys per language
- LanguageProvider context + useT() hook
- Language selector in header
- All components internationalized

### Files Changed
- backend/package.json → `--env-file=.env`
- backend/src/index.ts → diagnostic logging
- backend/src/routes/tts.ts → request logging
- frontend/src/app/globals.css → renamed CSS variables
- frontend/tailwind.config.ts → updated variable refs
- frontend/src/app/layout.tsx → added LanguageProvider
- frontend/src/app/page.tsx → full rewrite with i18n + theme fix
- frontend/src/components/* → i18n integration

### Next Steps
1. Run `pnpm dev` (must be restarted for --env-file change)
2. Verify theme toggle (sun/moon icon in header)
3. Verify language selector
4. Test TTS generation with valid API key
