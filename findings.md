# Findings

## MiMo TTS v2.5 API

### Endpoint
- POST `https://api.xiaomimimo.com/v1/chat/completions`
- OpenAI Chat Completions compatible format
- Auth: `Authorization: Bearer <MIMO_API_KEY>`

### Request Format (TTS)
```json
{
  "model": "MiMo-V2.5-TTS",
  "messages": [
    { "role": "assistant", "content": "要合成的文本内容" }
  ],
  "audio": {
    "format": "wav",
    "voice": "冰糖"
  }
}
```

### Models Available
- **MiMo-V2.5-TTS**: Preset voices with fine-grained control
- **MiMo-V2.5-TTS-VoiceDesign**: Create new voices via natural language description
- **MiMo-V2.5-TTS-VoiceClone**: Clone voices from reference audio

### Preset Voices
| Language | Voices |
|----------|--------|
| Chinese | 冰糖, 茉莉, 苏打, 白桦 |
| English | Mia, Chloe, Milo, Dean |

### Control Methods
1. **Director Mode**: Natural language style prompt
2. **Inline Tags**: `(开心)`, `(台湾腔)`, `(东北话 变快)`, `[emotion: excited]`
3. **Style prompt** in audio config

### Audio Specs
- Sample rate: 24,000 Hz
- Recommended: PCM16, WAV format
- Streaming supported (chunked transfer)

## Design Decisions
- Dark recording studio theme: amber/gold accents on deep charcoal
- Single page app for MVP (no routing complexity)
- Character profiles in localStorage
- Font: DM Mono for UI elements, Noto Serif SC for Chinese script display
