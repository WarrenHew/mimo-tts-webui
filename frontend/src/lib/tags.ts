import type { TagPreset } from '@/types';

export const TAG_PRESETS: TagPreset[] = [
  // Emotion tags
  { label: '开心', tag: '(开心)', category: 'emotion' },
  { label: '悲伤', tag: '(悲伤)', category: 'emotion' },
  { label: '愤怒', tag: '(愤怒)', category: 'emotion' },
  { label: '惊讶', tag: '(惊讶)', category: 'emotion' },
  { label: '紧张', tag: '(紧张)', category: 'emotion' },
  { label: '温柔', tag: '(温柔)', category: 'emotion' },
  { label: '冷漠', tag: '(冷漠)', category: 'emotion' },
  { label: '俏皮', tag: '(俏皮)', category: 'emotion' },
  { label: '激动', tag: '(激动)', category: 'emotion' },
  { label: '慵懒', tag: '(慵懒)', category: 'emotion' },
  { label: '严肃', tag: '(严肃)', category: 'emotion' },
  { label: '羞涩', tag: '(羞涩)', category: 'emotion' },

  // Dialect tags
  { label: '台湾腔', tag: '(台湾腔)', category: 'dialect' },
  { label: '东北话', tag: '(东北话)', category: 'dialect' },
  { label: '四川话', tag: '(四川话)', category: 'dialect' },
  { label: '河南话', tag: '(河南话)', category: 'dialect' },
  { label: '粤语', tag: '(粤语)', category: 'dialect' },
  { label: '上海话', tag: '(上海话)', category: 'dialect' },

  // Speed tags
  { label: '变快', tag: '(变快)', category: 'speed' },
  { label: '变慢', tag: '(变慢)', category: 'speed' },
  { label: '语速加快', tag: '(语速加快)', category: 'speed' },
  { label: '语速放慢', tag: '(语速放慢)', category: 'speed' },

  // Tone tags
  { label: '轻声', tag: '(轻声)', category: 'tone' },
  { label: '大声', tag: '(大声)', category: 'tone' },
  { label: '耳语', tag: '(耳语)', category: 'tone' },
  { label: '喊叫', tag: '(喊叫)', category: 'tone' },
  { label: '歌唱', tag: '(歌唱)', category: 'tone' },

  // Character types
  { label: '少女', tag: '(少女声线)', category: 'character' },
  { label: '御姐', tag: '(成熟女声)', category: 'character' },
  { label: '少年', tag: '(少年声线)', category: 'character' },
  { label: '大叔', tag: '(低沉男声)', category: 'character' },
  { label: '萝莉', tag: '(可爱童声)', category: 'character' },
  { label: '老奶奶', tag: '(老年女声)', category: 'character' },
  { label: '老爷爷', tag: '(老年男声)', category: 'character' },
];

export const TAG_CATEGORIES = [
  { key: 'emotion', label: '情感', color: 'bg-studio-rose/20 text-studio-rose' },
  { key: 'dialect', label: '方言', color: 'bg-studio-blue/20 text-studio-blue' },
  { key: 'speed', label: '语速', color: 'bg-studio-green/20 text-studio-green' },
  { key: 'tone', label: '语气', color: 'bg-studio-amber/20 text-studio-amber' },
  { key: 'character', label: '声线', color: 'bg-purple-500/20 text-purple-300' },
] as const;

export function getTagsByCategory(category: TagPreset['category']): TagPreset[] {
  return TAG_PRESETS.filter((t) => t.category === category);
}
