'use client';

import { useState } from 'react';
import { TAG_PRESETS, TAG_CATEGORIES } from '@/lib/tags';
import type { TagPreset } from '@/types';
import { useT } from '@/lib/i18n/LanguageContext';
import { Tag, ChevronDown } from 'lucide-react';

interface TagBarProps {
  onInsertTag: (tag: string) => void;
}

const categoryKeyMap: Record<string, string> = {
  emotion: 'tag.emotion',
  dialect: 'tag.dialect',
  speed: 'tag.speed',
  tone: 'tag.tone',
  character: 'tag.character',
};

export function TagBar({ onInsertTag }: TagBarProps) {
  const { t } = useT();
  const [activeCategory, setActiveCategory] = useState<string>('emotion');
  const tags = TAG_PRESETS.filter((tp) => tp.category === activeCategory);

  return (
    <div className="space-y-2">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TAG_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-200 border ${
              activeCategory === cat.key
                ? `${cat.color} border-current/30`
                : 'border-studio-border text-studio-muted hover:text-studio-text hover:border-studio-muted'
            }`}
          >
            {t(categoryKeyMap[cat.key] as any)}
          </button>
        ))}
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag.tag}
            onClick={() => onInsertTag(tag.tag)}
            className="px-2.5 py-1 rounded-md text-xs font-mono border border-studio-border bg-studio-surface text-studio-muted hover:text-studio-amber hover:border-studio-amber/30 transition-all duration-150 active:scale-95"
            title={`Insert ${tag.tag}`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
