export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  description: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

export interface VoicesResponse {
  voices: VoiceInfo[];
  models: ModelInfo[];
}

export interface HealthResponse {
  status: string;
  apiKeyConfigured: boolean;
  timestamp: string;
}

export interface TTSGenerateRequest {
  text: string;
  model?: string;
  voice?: string;
  format?: 'wav' | 'mp3';
  style_prompt?: string;
  voice_description?: string;
  reference_audio_data?: string;
}

export interface ScriptLine {
  id: string;
  text: string;
  tags: string[];
  characterId?: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  voice: string;
  stylePrompt: string;
  model: string;
  voiceDescription?: string;
  referenceAudioData?: string; // DataURL for voice clone
  referenceAudioName?: string;
  createdAt: string;
}

export type GenerationState =
  | 'idle'
  | 'generating'
  | 'complete'
  | 'error';

export interface GenerationResult {
  audioUrl: string;
  format: string;
  text: string;
  voice: string;
  timestamp: string;
  state: GenerationState;
  error?: string;
}

// Emotion/dialect tag presets for quick insertion
export interface TagPreset {
  label: string;
  tag: string;
  category: 'emotion' | 'dialect' | 'speed' | 'tone' | 'character';
}
