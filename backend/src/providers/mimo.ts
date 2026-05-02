// CRITICAL: Load .env before ANY other code — this module is a leaf in the import graph,
// so it evaluates before routes and server code. Combined with --env-file=.env in package.json,
// this guarantees process.env is populated regardless of pnpm working directory.
import 'dotenv/config';

/**
 * MiMo TTS API Provider
 *
 * Handles communication with Xiaomi MiMo TTS v2.5 API.
 * Endpoint: POST https://api.xiaomimimo.com/v1/chat/completions
 *
 * Models:
 *  - mimo-v2.5-tts: preset voices
 *  - mimo-v2.5-tts-voicedesign: natural language voice creation
 *  - mimo-v2.5-tts-voiceclone: voice cloning from reference audio
 */

// IMPORTANT: Use getter functions instead of module-level constants
// because dotenv/config may not have executed yet at module load time in ESM.
function getApiBaseUrl(): string {
  // Base URL should include the API version prefix (e.g. /v1)
  // The endpoint path will be appended directly.
  return process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
}

function getApiKey(): string {
  return process.env.MIMO_API_KEY || '';
}

export interface TTSRequest {
  text: string;
  model?: string;
  voice?: string;
  format?: 'wav' | 'mp3';
  style_prompt?: string;
  voice_description?: string;
  reference_audio_url?: string;
  reference_audio_data?: string; // base64-encoded audio for voice clone
}

export interface TTSResponse {
  audioData: Buffer;
  format: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  description: string;
}

export const PRESET_VOICES: VoiceInfo[] = [
  { id: 'bingtang', name: '冰糖', language: 'zh-CN', description: '甜美女声，适合日常叙述' },
  { id: 'moli', name: '茉莉', language: 'zh-CN', description: '温柔知性女声' },
  { id: 'suda', name: '苏打', language: 'zh-CN', description: '清新活泼男声' },
  { id: 'baihua', name: '白桦', language: 'zh-CN', description: '沉稳大气男声' },
  { id: 'mia', name: 'Mia', language: 'en-US', description: 'Warm and natural female voice' },
  { id: 'chloe', name: 'Chloe', language: 'en-US', description: 'Bright and energetic female voice' },
  { id: 'milo', name: 'Milo', language: 'en-US', description: 'Friendly male voice' },
  { id: 'dean', name: 'Dean', language: 'en-US', description: 'Deep and authoritative male voice' },
];

/**
 * Build the MiMo TTS chat completion request body.
 */
function buildRequestBody(req: TTSRequest): Record<string, unknown> {
  // Normalize old model names (just in case)
  let model = req.model || 'mimo-v2.5-tts';
  model = model.replace(/MiMo-V2\.5-TTS-VoiceDesign/i, 'mimo-v2.5-tts-voicedesign');
  model = model.replace(/MiMo-V2\.5-TTS-VoiceClone/i, 'mimo-v2.5-tts-voiceclone');
  model = model.replace(/MiMo-V2\.5-TTS/i, 'mimo-v2.5-tts');

  // Build messages per API spec:
  // - user: natural language style control (director instructions, NOT spoken)
  // - assistant: text to speak + optional inline audio tags
  const messages: Array<{ role: string; content: string }> = [];

  if (model === 'mimo-v2.5-tts-voicedesign') {
    // Voice Design: user = voice description, assistant = text
    const voiceDesc = req.voice_description || req.style_prompt || 'A natural, clear voice.';
    messages.push({ role: 'user', content: voiceDesc });
  } else if (model === 'mimo-v2.5-tts-voiceclone') {
    // Voice Clone: API requires a user message (can be empty or style prompt)
    messages.push({ role: 'user', content: req.style_prompt || '' });
  } else {
    // Preset Voice: user = optional style prompt
    if (req.style_prompt) {
      messages.push({ role: 'user', content: req.style_prompt });
    }
  }

  // Assistant message = the text to speak (with inline tags from frontend)
  messages.push({ role: 'assistant', content: req.text });

  const body: Record<string, unknown> = {
    model,
    messages,
    audio: {
      format: req.format || 'wav',
    },
    stream: false,
  };

  // Voice field per model
  if (model === 'mimo-v2.5-tts-voiceclone' && req.reference_audio_data) {
    // Voice Clone: audio.voice = DataURL of reference audio
    (body.audio as Record<string, unknown>).voice = req.reference_audio_data;
  } else if (model === 'mimo-v2.5-tts-voicedesign') {
    // Voice Design: no voice field needed (voice is created from description)
  } else if (req.voice) {
    // Preset Voice: audio.voice = preset voice name (e.g. "冰糖")
    (body.audio as Record<string, unknown>).voice = req.voice;
  }

  return body;
}

/**
 * Call the MiMo TTS API to generate speech.
 */
export async function generateSpeech(request: TTSRequest): Promise<TTSResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MIMO_API_KEY environment variable is not set');
  }

  const body = buildRequestBody(request);
  const url = `${getApiBaseUrl()}/chat/completions`;

  console.log('[MiMo] Request:', JSON.stringify({ url, model: body.model, voice: (body.audio as any)?.voice, textLen: request.text.length }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiMo API error (${response.status}): ${errorText}`);
  }

  // MiMo returns audio in the response as a chat completion with audio data
  const result = await response.json() as Record<string, unknown>;

  // Extract audio data from the response.
  // MiMo returns audio in choices[0].message.audio.data (OpenAI Chat Completions format)
  let audioData: string | undefined;

  const extractAudio = (obj: Record<string, unknown>): string | undefined => {
    if (obj.data && typeof obj.data === 'string') return obj.data;
    return undefined;
  };

  // Path 1: result.audio.data
  if (result.audio && typeof result.audio === 'object') {
    audioData = extractAudio(result.audio as Record<string, unknown>);
  }

  // Path 2: result.choices[0].audio.data
  if (!audioData && result.choices && Array.isArray(result.choices) && result.choices.length > 0) {
    const choice = result.choices[0] as Record<string, unknown>;
    if (choice.audio && typeof choice.audio === 'object') {
      audioData = extractAudio(choice.audio as Record<string, unknown>);
    }
    // Path 3: result.choices[0].message.audio.data (OpenAI format)
    if (!audioData && choice.message && typeof choice.message === 'object') {
      const msg = choice.message as Record<string, unknown>;
      if (msg.audio && typeof msg.audio === 'object') {
        audioData = extractAudio(msg.audio as Record<string, unknown>);
      }
    }
  }

  if (!audioData) {
    throw new Error(`No audio data found in MiMo response: ${JSON.stringify(result).slice(0, 500)}`);
  }

  return {
    audioData: Buffer.from(audioData, 'base64'),
    format: request.format || 'wav',
  };
}

/**
 * Validate that the API key is configured.
 */
export function checkApiKey(): boolean {
  return getApiKey().length > 0;
}
