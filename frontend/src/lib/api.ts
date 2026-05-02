import type {
  VoicesResponse,
  HealthResponse,
  TTSGenerateRequest,
} from '@/types';

const API_BASE = '';

export async function fetchVoices(): Promise<VoicesResponse> {
  const res = await fetch(`${API_BASE}/api/voices`);
  if (!res.ok) throw new Error('Failed to fetch voices');
  return res.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend unavailable');
  return res.json();
}

/**
 * Generate TTS audio and return a blob URL for playback.
 */
export async function generateAudio(request: TTSGenerateRequest): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (err) {
    throw new Error(
      'Cannot connect to backend. Is the server running on port 3001?'
    );
  }

  if (!res.ok) {
    // Try JSON error first, fall back to text, then status code
    let message = `Backend error (HTTP ${res.status})`;
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        message = json.error || json.message || message;
      } else {
        const text = await res.text();
        if (text && text.length < 200) message = text;
      }
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Download audio blob as a file.
 */
export function downloadAudio(blobUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
