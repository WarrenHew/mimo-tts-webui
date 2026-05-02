'use client';

import type { VoiceInfo, ModelInfo } from '@/types';
import { useT } from '@/lib/i18n/LanguageContext';
import { Mic, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  models: ModelInfo[];
  selectedVoice: string;
  selectedModel: string;
  onVoiceChange: (voice: string) => void;
  onModelChange: (model: string) => void;
}

export function VoiceSelector({
  voices,
  models,
  selectedVoice,
  selectedModel,
  onVoiceChange,
  onModelChange,
}: VoiceSelectorProps) {
  const { t } = useT();
  const zhVoices = voices.filter((v) => v.language === 'zh-CN');
  const enVoices = voices.filter((v) => v.language === 'en-US');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-mono text-studio-muted uppercase tracking-wider mb-2">
          {t('voice.model')}
        </label>
        <div className="grid gap-1.5">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm border transition-all duration-200 relative ${
                selectedModel === model.id
                  ? 'border-studio-amber bg-studio-amber/15 text-studio-text shadow-sm'
                  : 'border-studio-border bg-studio-surface hover:border-studio-muted text-studio-text'
              }`}
            >
              <div className="flex items-center gap-2">
                {model.id.includes('VoiceDesign') ? <Sparkles className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="font-medium">{model.name}</span>
              </div>
              <p className="text-xs text-studio-muted mt-0.5">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preset voices — only relevant for the Preset Voices model */}
      {selectedModel === 'mimo-v2.5-tts' && (
        <div>
          <label className="block text-xs font-mono text-studio-muted uppercase tracking-wider mb-2">
            {t('voice.preset')}
          </label>
          <div className="mb-3">
            <span className="text-[10px] font-mono text-studio-muted uppercase tracking-widest mb-1.5 block">中文</span>
            <div className="grid grid-cols-2 gap-1.5">
              {zhVoices.map((voice) => (
                <VoiceButton key={voice.id} voice={voice} selected={selectedVoice === voice.name} onClick={() => onVoiceChange(voice.name)} />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-studio-muted uppercase tracking-widest mb-1.5 block">English</span>
            <div className="grid grid-cols-2 gap-1.5">
              {enVoices.map((voice) => (
                <VoiceButton key={voice.id} voice={voice} selected={selectedVoice === voice.name} onClick={() => onVoiceChange(voice.name)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceButton({ voice, selected, onClick }: { voice: VoiceInfo; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
        selected
          ? 'border-studio-amber bg-studio-amber/15 text-studio-text font-medium shadow-sm'
          : 'border-studio-border bg-studio-surface hover:border-studio-muted text-studio-text'
      }`}
    >
      <div className="font-medium">{voice.name}</div>
      <div className="text-[10px] text-studio-muted mt-0.5 leading-tight">{voice.description}</div>
    </button>
  );
}
