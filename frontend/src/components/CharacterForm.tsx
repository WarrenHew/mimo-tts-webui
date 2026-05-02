'use client';

import { useState } from 'react';
import type { VoiceInfo, CharacterProfile } from '@/types';
import { useT } from '@/lib/i18n/LanguageContext';
import { Save, X, User, Sparkles } from 'lucide-react';

interface CharacterFormProps {
  voices: VoiceInfo[];
  onSave: (character: Omit<CharacterProfile, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  initial?: CharacterProfile;
  preset?: { voice: string; model: string; stylePrompt: string; voiceDescription?: string };
}

export function CharacterForm({ voices, onSave, onClose, initial, preset }: CharacterFormProps) {
  const { t } = useT();
  const defaults = initial || preset;
  const [name, setName] = useState(initial?.name || '');
  const [voice, setVoice] = useState(defaults?.voice || '冰糖');
  const [model, setModel] = useState(defaults?.model || 'mimo-v2.5-tts');
  const [stylePrompt, setStylePrompt] = useState(defaults?.stylePrompt || '');
  const [voiceDescription, setVoiceDescription] = useState(defaults?.voiceDescription || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      voice,
      model,
      stylePrompt: stylePrompt.trim(),
      voiceDescription: voiceDescription.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-studio-elevated border border-studio-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium text-studio-text flex items-center gap-2">
            <User className="w-4 h-4 text-studio-amber" />
            {initial ? t('character.edit') : t('character.new')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-surface transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-studio-muted mb-1.5">{t('character.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('character.namePlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/50 text-sm focus:outline-none focus:border-studio-amber/50 focus:ring-1 focus:ring-studio-amber/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-studio-muted mb-1.5">{t('voice.model')}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text text-sm focus:outline-none focus:border-studio-amber/50 transition-all"
            >
              <option value="mimo-v2.5-tts">Preset Voices</option>
              <option value="mimo-v2.5-tts-voicedesign">Voice Design</option>
              <option value="mimo-v2.5-tts-voiceclone">Voice Clone</option>
            </select>
          </div>

          {model === 'mimo-v2.5-tts' && (
            <div>
              <label className="block text-xs font-mono text-studio-muted mb-1.5">{t('voice.preset')}</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text text-sm focus:outline-none focus:border-studio-amber/50 transition-all"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.name}>{v.name} ({v.language})</option>
                ))}
              </select>
            </div>
          )}

          {model === 'mimo-v2.5-tts-voicedesign' && (
            <div>
              <label className="block text-xs font-mono text-studio-muted mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> {t('voice.description')}
              </label>
              <textarea
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                placeholder={t('voice.descriptionPlaceholder')}
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/50 text-sm focus:outline-none focus:border-studio-amber/50 transition-all resize-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-studio-muted mb-1.5">{t('character.defaultStyle')}</label>
            <textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder={t('voice.stylePromptPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/50 text-sm focus:outline-none focus:border-studio-amber/50 transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-5 w-full py-2.5 rounded-xl bg-studio-amber text-studio-bg font-medium text-sm hover:bg-studio-amber-glow transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {initial ? t('character.save') : t('character.create')}
        </button>
      </form>
    </div>
  );
}
