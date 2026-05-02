'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (base64: string, name: string) => void;
  onClear: () => void;
  hasAudio: boolean;
}

export function AudioRecorder({ onAudioReady, onClear, hasAudio }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [playing, setPlaying] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        stopTimer();
      };

      recorder.start();
      setRecording(true);
      setPaused(false);
      setDuration(0);
      startTimer();
    } catch (err) {
      alert('Microphone access denied. Please allow microphone permissions.');
    }
  }, []);

  const pauseRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      setPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      setPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecording(false);
      setPaused(false);
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const confirmRecording = () => {
    if (!recordedBlob) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onAudioReady(base64, `recording-${Date.now()}.webm`);
    };
    reader.readAsDataURL(recordedBlob);
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setDuration(0);
    onClear();
  };

  const togglePlayback = () => {
    if (!recordedBlob) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(recordedBlob));
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // If audio already loaded via file upload, show minimal state
  if (hasAudio) return null;

  // If a recording was just made, show review controls
  if (recordedBlob) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-studio-green/5 border border-studio-green/30">
        <button
          onClick={togglePlayback}
          className="p-2 rounded-full bg-studio-surface hover:bg-studio-elevated transition-all"
        >
          {playing ? <Pause className="w-4 h-4 text-studio-text" /> : <Play className="w-4 h-4 text-studio-text" />}
        </button>
        <span className="text-xs text-studio-text flex-1 font-mono">{formatTime(duration)}</span>
        <button
          onClick={confirmRecording}
          className="px-3 py-1.5 rounded-lg bg-studio-green text-white text-xs font-medium hover:opacity-80 transition-all"
        >
          Use
        </button>
        <button
          onClick={discardRecording}
          className="p-1.5 rounded-lg text-studio-muted hover:text-studio-rose transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Recording state
  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <span className="flex items-center gap-1.5 text-xs font-mono text-studio-rose">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {formatTime(duration)}
          </span>
          {paused ? (
            <button
              onClick={resumeRecording}
              className="px-2.5 py-1.5 rounded-lg bg-studio-green/20 text-studio-green text-xs font-medium hover:bg-studio-green/30 transition-all"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pauseRecording}
              className="px-2.5 py-1.5 rounded-lg bg-studio-amber/20 text-studio-amber text-xs font-medium hover:bg-studio-amber/30 transition-all"
            >
              Pause
            </button>
          )}
          <button
            onClick={stopRecording}
            className="p-1.5 rounded-lg bg-studio-rose/20 text-studio-rose hover:bg-studio-rose/30 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-rose/10 border border-studio-rose/20 text-studio-rose hover:bg-studio-rose/20 transition-all text-xs font-medium"
        >
          <Mic className="w-3.5 h-3.5" />
          Record
        </button>
      )}
    </div>
  );
}
