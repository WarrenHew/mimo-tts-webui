'use client';

import { useState, useEffect, useCallback } from 'react';
import { VoiceSelector } from '@/components/VoiceSelector';
import { TagBar } from '@/components/TagBar';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AudioRecorder } from '@/components/AudioRecorder';
import { CharacterForm } from '@/components/CharacterForm';
import { fetchVoices, generateAudio, downloadAudio, checkHealth } from '@/lib/api';
import { useCharacters } from '@/hooks/useCharacters';
import { useT } from '@/lib/i18n/LanguageContext';
import type { Locale } from '@/lib/i18n/translations';
import type { VoiceInfo, ModelInfo, CharacterProfile } from '@/types';
import {
  Mic, Zap, Users, Plus, ChevronLeft, ChevronRight,
  Music, AlertCircle, CheckCircle2, Loader2, Wand2,
  Sun, Moon, Globe, Trash2,
} from 'lucide-react';

export default function Home() {
  const { t, locale, setLocale, locales } = useT();

  // ── Theme ──
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document !== 'undefined') return document.documentElement.classList.contains('dark');
    return false;
  });
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('mimo-theme', next ? 'dark' : 'light'); } catch {}
  };

  // ── Language ──
  const [showLangMenu, setShowLangMenu] = useState(false);

  // ── Data ──
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [apiReady, setApiReady] = useState<boolean | null>(null);

  // ── Selection ──
  const [selectedVoice, setSelectedVoice] = useState('冰糖');
  const [selectedModel, setSelectedModel] = useState('mimo-v2.5-tts');
  const [stylePrompt, setStylePrompt] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [referenceAudio, setReferenceAudio] = useState<string | null>(null);
  const [referenceAudioName, setReferenceAudioName] = useState('');

  // ── Script ──
  const [scriptText, setScriptText] = useState('');
  const [scriptLines, setScriptLines] = useState<{ id: string; text: string }[]>([]);

  // ── Generation ──
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Characters ──
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load data
  useEffect(() => {
    fetchVoices()
      .then((d) => { setVoices(d.voices); setModels(d.models); })
      .catch(console.error);
    checkHealth()
      .then((h) => setApiReady(h.apiKeyConfigured))
      .catch(() => setApiReady(false));
  }, []);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (model !== 'mimo-v2.5-tts-voiceclone') {
      setReferenceAudio(null);
      setReferenceAudioName('');
    }
    if (model !== 'mimo-v2.5-tts-voicedesign') {
      setVoiceDescription('');
    }
  };

  const applyCharacter = useCallback((c: CharacterProfile) => {
    setSelectedCharacter(c);
    setSelectedVoice(c.voice);
    handleModelChange(c.model);
    setStylePrompt(c.stylePrompt);
    setVoiceDescription(c.voiceDescription || '');
    setReferenceAudio(c.referenceAudioData || null);
    setReferenceAudioName(c.referenceAudioName || '');
  }, []);

  const handleGenerate = async () => {
    const text = scriptText.trim();
    if (!text) return;
    setGenerating(true); setError(null); setAudioUrl(null);
    try {
      const url = await generateAudio({
        text, model: selectedModel,
        voice: selectedVoice,
        style_prompt: stylePrompt || undefined,
        voice_description: selectedModel === 'mimo-v2.5-tts-voicedesign' ? voiceDescription || undefined : undefined,
        reference_audio_data: selectedModel === 'mimo-v2.5-tts-voiceclone' ? referenceAudio || undefined : undefined,
        format: 'wav',
      });
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally { setGenerating(false); }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    downloadAudio(audioUrl, `mimo-tts-${ts}.wav`);
  };

  const insertTag = useCallback((tag: string) => {
    setScriptText((prev) => prev + tag);
  }, []);

  // Auto-save settings changes to active character
  useEffect(() => {
    if (!selectedCharacter) return;
    const timer = setTimeout(() => {
      updateCharacter(selectedCharacter.id, {
        voice: selectedVoice,
        model: selectedModel,
        stylePrompt,
        voiceDescription: voiceDescription || undefined,
        referenceAudioData: referenceAudio || undefined,
        referenceAudioName: referenceAudioName || undefined,
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedVoice, selectedModel, stylePrompt, voiceDescription, referenceAudio, referenceAudioName]);

  useEffect(() => {
    setScriptLines(scriptText.split('\n').filter(Boolean).map((t, i) => ({ id: `l${i}`, text: t })));
  }, [scriptText]);

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col transition-colors duration-300">
      {/* ══════ HEADER ══════ */}
      <header className="border-b border-studio-border bg-studio-surface/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-studio-amber/20 border border-studio-amber/30 flex items-center justify-center">
              <Music className="w-4 h-4 text-studio-amber" />
            </div>
            <div>
              <h1 className="text-base font-medium text-studio-text tracking-tight">{t('app.title')}</h1>
              <p className="text-[10px] font-mono text-studio-muted uppercase tracking-wider">{t('app.subtitle')}</p>
            </div>
            <div className="hidden sm:flex items-end gap-0.5 h-5 ml-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`w-1 rounded-full bg-studio-amber/60 vu-bar-${i}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono text-studio-muted hover:text-studio-amber hover:bg-studio-surface transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentLocale?.nativeLabel ?? locale}</span>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-studio-elevated border border-studio-border rounded-xl shadow-2xl z-[100] py-1 min-w-[160px] animate-fade-in ring-1 ring-studio-border/50">
                    {locales.map((l) => (
                      <button key={l.code}
                        onClick={() => { setLocale(l.code as Locale); setShowLangMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-studio-surface transition-all ${locale === l.code ? 'text-studio-amber font-medium' : 'text-studio-text'}`}>
                        <span>{l.nativeLabel}</span>
                        <span className="text-studio-muted text-xs ml-2">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-1.5 rounded-lg text-studio-muted hover:text-studio-amber hover:bg-studio-surface transition-all"
              title={darkMode ? t('theme.switchLight') : t('theme.switchDark')}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* API status */}
            {apiReady === null ? (
              <span className="flex items-center gap-1.5 text-xs font-mono text-studio-muted"><Loader2 className="w-3 h-3 animate-spin" /> {t('app.checking')}</span>
            ) : apiReady ? (
              <span className="flex items-center gap-1.5 text-xs font-mono text-studio-green"><CheckCircle2 className="w-3 h-3" /> {t('app.apiReady')}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-studio-rose"><AlertCircle className="w-3 h-3" /> {t('app.apiKeyRequired')}</span>
            )}
          </div>
        </div>
      </header>

      {/* ══════ BODY ══════ */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full">
        {/* Left sidebar: Characters */}
        <aside className={`border-r border-studio-border bg-studio-surface/30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        }`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono text-studio-muted uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {t('sidebar.characters')}
              </h2>
              <button
                onClick={() => setShowCharacterForm(true)}
                className="p-1 rounded-md text-studio-muted hover:text-studio-amber hover:bg-studio-surface transition-all"
                title={t('sidebar.addCharacter')}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {characters.length === 0 ? (
                <p className="text-xs text-studio-muted/50 py-4 text-center leading-relaxed">{t('sidebar.noCharacters')}</p>
              ) : (
                characters.map((char) => (
                  <div key={char.id} className="group relative">
                    <button onClick={() => applyCharacter(char)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                        selectedCharacter?.id === char.id
                          ? 'border-studio-amber bg-studio-amber/15 shadow-sm'
                          : 'border-transparent bg-studio-surface hover:border-studio-border'
                      }`}>
                      <div className="text-sm font-medium text-studio-text pr-6">{char.name}</div>
                      <div className="text-[10px] font-mono text-studio-muted mt-0.5">
                        {char.model.includes('voiceclone') ? 'Voice Clone' : char.model.includes('voicedesign') ? 'Voice Design' : `${char.voice} · Preset`}
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Delete "${char.name}"?`)) return;
                        if (selectedCharacter?.id === char.id) setSelectedCharacter(null);
                        deleteCharacter(char.id);
                      }}
                      className="absolute right-2 top-2.5 p-1 rounded-md text-studio-muted/0 group-hover:text-studio-rose hover:bg-studio-rose/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete character"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="self-start mt-4 -ml-0 p-1 rounded-r-md bg-studio-surface border border-l-0 border-studio-border text-studio-muted hover:text-studio-amber transition-all z-30">
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Center: Script Editor */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Script */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-studio-muted uppercase tracking-wider">{t('script.label')}</label>
                <span className="text-[10px] font-mono text-studio-muted">
                  {t('script.chars', { count: scriptText.length })} · {t('script.lines', { count: scriptLines.length })}
                </span>
              </div>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder={t('script.placeholder')}
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/40 font-serif text-sm leading-relaxed focus:outline-none focus:border-studio-amber/40 focus:ring-1 focus:ring-studio-amber/10 transition-all resize-y min-h-[220px]"
              />
              <div className="mt-3">
                <TagBar onInsertTag={insertTag} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-studio-rose/10 border border-studio-rose/30 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-studio-rose mt-0.5 shrink-0" />
                <p className="text-sm text-studio-rose whitespace-pre-wrap break-all">{error}</p>
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <AudioPlayer audioUrl={audioUrl} filename="mimo-tts-output.wav" onDownload={handleDownload} />
            )}
          </div>
        </main>

        {/* Right sidebar: Controls */}
        <aside className="w-80 border-l border-studio-border bg-studio-surface/30 p-4 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <h2 className="text-xs font-mono text-studio-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Mic className="w-3 h-3" /> {t('voice.label')}
              </h2>
              <VoiceSelector
                voices={voices} models={models}
                selectedVoice={selectedVoice} selectedModel={selectedModel}
                onVoiceChange={setSelectedVoice} onModelChange={handleModelChange}
              />
            </div>

            {selectedModel === 'mimo-v2.5-tts-voicedesign' && (
              <div>
                <label className="block text-xs font-mono text-studio-muted uppercase tracking-wider mb-1.5">
                  {t('voice.description')}
                </label>
                <textarea
                  value={voiceDescription} onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder={t('voice.descriptionPlaceholder')}
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/40 text-sm focus:outline-none focus:border-studio-amber/40 transition-all resize-none"
                />
              </div>
            )}

            {selectedModel === 'mimo-v2.5-tts-voiceclone' && (
              <div>
                <label className="block text-xs font-mono text-studio-muted uppercase tracking-wider mb-1.5">
                  {t('voice.referenceAudio')}
                </label>

                {/* Record or Upload */}
                {!referenceAudio && (
                  <div className="flex items-center gap-3 mb-3">
                    <AudioRecorder
                      onAudioReady={(base64, name) => {
                        setReferenceAudio(base64);
                        setReferenceAudioName(name);
                      }}
                      onClear={() => {
                        setReferenceAudio(null);
                        setReferenceAudioName('');
                      }}
                      hasAudio={!!referenceAudio}
                    />
                    <span className="text-[10px] text-studio-muted">·</span>
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-studio-border text-studio-muted hover:text-studio-amber hover:border-studio-amber/40 transition-all text-xs cursor-pointer">
                      <Music className="w-3.5 h-3.5" />
                      {t('voice.upload')}
                      <input
                        type="file"
                        accept="audio/wav,audio/mpeg,audio/mp3,.wav,.mp3"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            setError('Reference audio must be under 10 MB');
                            return;
                          }
                          setReferenceAudioName(file.name);
                          const reader = new FileReader();
                          reader.onload = () => {
                            setReferenceAudio(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Selected audio display */}
                {referenceAudio && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-studio-green/5 border border-studio-green/30">
                    <Music className="w-4 h-4 text-studio-green" />
                    <span className="text-xs text-studio-text flex-1 truncate">{referenceAudioName}</span>
                    <button
                      onClick={() => { setReferenceAudio(null); setReferenceAudioName(''); }}
                      className="text-[10px] text-studio-rose hover:underline"
                    >
                      {t('voice.removeRef')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-studio-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Wand2 className="w-3 h-3" /> {t('voice.stylePrompt')}
              </label>
              <textarea
                value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
                placeholder={t('voice.stylePromptPlaceholder')}
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-border text-studio-text placeholder:text-studio-muted/40 text-sm focus:outline-none focus:border-studio-amber/40 transition-all resize-none"
              />
              <p className="text-[10px] text-studio-muted mt-1 font-mono">{t('voice.styleHint')}</p>
            </div>

            {selectedCharacter && (
              <div className="p-3 rounded-xl bg-studio-amber/5 border border-studio-amber/20">
                <div className="text-[10px] font-mono text-studio-amber uppercase tracking-wider mb-1">{t('character.active')}</div>
                <div className="text-sm font-medium text-studio-text">{selectedCharacter.name}</div>
                <div className="text-[10px] font-mono text-studio-muted mt-0.5">
                  {selectedCharacter.model.includes('voiceclone')
                    ? 'Voice Clone'
                    : selectedCharacter.model.includes('voicedesign')
                      ? 'Voice Design'
                      : selectedCharacter.voice}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!scriptText.trim() || generating}
              className="w-full py-3.5 rounded-xl bg-studio-amber text-white font-semibold text-sm hover:bg-studio-amber-glow transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-studio-amber/20"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('generate.generating')}</>
              ) : (
                <><Zap className="w-4 h-4" /> {t('generate.button')}</>
              )}
            </button>

            <div className="p-3 rounded-xl bg-studio-surface border border-studio-border">
              <p className="text-[10px] font-mono text-studio-muted uppercase tracking-wider mb-1.5">{t('tips.title')}</p>
              <ul className="space-y-1 text-[10px] text-studio-muted/80">
                <li>· {t('tips.tag')}</li>
                <li>· {t('tips.style')}</li>
                <li>· {t('tips.characters')}</li>
                <li>· {t('tips.voiceDesign')}</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Character form modal */}
      {showCharacterForm && (
        <CharacterForm
          voices={voices}
          onSave={(c) => { const created = addCharacter(c); applyCharacter(created); }}
          onClose={() => setShowCharacterForm(false)}
        />
      )}
    </div>
  );
}
