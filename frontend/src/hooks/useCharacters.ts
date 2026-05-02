'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CharacterProfile } from '@/types';

const STORAGE_KEY = 'mimo-characters';

function loadCharacters(): CharacterProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old model names
    let migrated = false;
    const fixed = parsed.map((c: any) => {
      if (typeof c.model === 'string') {
        const old = c.model;
        c.model = c.model.replace(/MiMo-V2\.5-TTS-VoiceDesign/i, 'mimo-v2.5-tts-voicedesign');
        c.model = c.model.replace(/MiMo-V2\.5-TTS-VoiceClone/i, 'mimo-v2.5-tts-voiceclone');
        c.model = c.model.replace(/MiMo-V2\.5-TTS/i, 'mimo-v2.5-tts');
        if (c.model !== old) migrated = true;
      }
      return c;
    });
    if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
    return fixed;
  } catch {
    return [];
  }
}

function saveCharacters(characters: CharacterProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

export function useCharacters() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);

  useEffect(() => {
    setCharacters(loadCharacters());
  }, []);

  const addCharacter = useCallback((character: Omit<CharacterProfile, 'id' | 'createdAt'>) => {
    const newChar: CharacterProfile = {
      ...character,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCharacters((prev) => {
      const updated = [...prev, newChar];
      saveCharacters(updated);
      return updated;
    });
    return newChar;
  }, []);

  const updateCharacter = useCallback((id: string, updates: Partial<CharacterProfile>) => {
    setCharacters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveCharacters(updated);
      return updated;
    });
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCharacters(updated);
      return updated;
    });
  }, []);

  return { characters, addCharacter, updateCharacter, deleteCharacter };
}
