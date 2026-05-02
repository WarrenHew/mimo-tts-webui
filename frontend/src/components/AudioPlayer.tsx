'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { useT } from '@/lib/i18n/LanguageContext';

interface AudioPlayerProps {
  audioUrl: string | null;
  filename: string;
  onDownload: () => void;
}

export function AudioPlayer({ audioUrl, filename, onDownload }: AudioPlayerProps) {
  const { t } = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => { setPlaying(false); setCurrentTime(0); setDuration(0); }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.pause() : audio.play();
    setPlaying(!playing);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="animate-fade-in">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      <div className="bg-studio-surface border border-studio-border rounded-xl p-4">
        {/* Waveform */}
        <div className="flex items-end gap-0.5 h-8 mb-3">
          {Array.from({ length: 40 }).map((_, i) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const active = i / 40 <= progress;
            const h = playing
              ? 20 + Math.sin(Date.now() / 200 + i * 0.5) * 12 + Math.random() * 8
              : active ? 16 + Math.sin(i * 0.8) * 8 : 4 + (i % 3) * 2;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-100 ${active ? 'bg-studio-amber' : 'bg-studio-border'}`}
                style={{ height: `${Math.max(2, h)}px` }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-studio-amber text-studio-bg hover:bg-studio-amber-glow transition-all duration-200 active:scale-95"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-mono text-studio-muted mb-1">
              <span>{fmt(currentTime)}</span>
              <span className="text-studio-text text-xs truncate max-w-[200px]">{filename}</span>
              <span>{fmt(duration)}</span>
            </div>
            <div className="h-1 bg-studio-border rounded-full overflow-hidden">
              <div
                className="h-full bg-studio-amber rounded-full transition-all duration-200"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-studio-muted" />
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-studio-amber bg-studio-border rounded-full appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={onDownload}
            className="p-2 rounded-lg text-studio-muted hover:text-studio-amber hover:bg-studio-surface transition-all"
            title={t('player.download')}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
