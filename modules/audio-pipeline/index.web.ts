type AudioLevelEvent = { rms: number; sampleRate: number; frames: number };
type AudioPcmEvent = { base64: string; sampleRate: number; frames: number; format: 'f32le'; sequence: number };

export type AudioCompatibilityResult = {
  accepted: boolean;
  reason: string;
  sampleRate: number;
  channels: number;
  frames: number;
  format: string;
  sequence: number;
};

export type AudioPipelineStats = {
  pcmChunks: number;
  rejectedChunks: number;
  lastSequence: number;
  acceptedFrames: number;
};

const listeners = {
  audioLevel: new Set<(event: AudioLevelEvent) => void>(),
  audioPcm: new Set<(event: AudioPcmEvent) => void>(),
};
let sequence = -1;
let pcmChunks = 0;
let rejectedChunks = 0;
let acceptedFrames = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function base64FromFloat32(samples: Float32Array) {
  const bytes = new Uint8Array(samples.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const AudioPipeline = {
  async start() {
    if (timer) return;
    timer = setInterval(() => {
      const frames = 800;
      const nextSequence = sequence + 1;
      const samples = new Float32Array(frames);
      for (let i = 0; i < frames; i += 1) samples[i] = Math.sin((2 * Math.PI * 220 * i) / 16_000) * 0.05;
      const base64 = base64FromFloat32(samples);
      const event = { base64, sampleRate: 16_000, frames, format: 'f32le' as const, sequence: nextSequence };
      sequence = nextSequence;
      pcmChunks += 1;
      acceptedFrames += frames;
      listeners.audioPcm.forEach((listener) => listener(event));
      listeners.audioLevel.forEach((listener) => listener({ rms: 0.05, sampleRate: 16_000, frames }));
    }, 50);
  },
  async stop() {
    if (timer) clearInterval(timer);
    timer = null;
  },
  async validatePcmChunk(base64: string, sampleRate: number, channels: number, frames: number, format: string, nextSequence: number): Promise<AudioCompatibilityResult> {
    const accepted = sampleRate === 16_000 && channels === 1 && frames === 800 && format === 'f32le' && nextSequence === sequence;
    if (!accepted) rejectedChunks += 1;
    return { accepted, reason: accepted ? 'ok' : 'web-simulation-compatibility-failure', sampleRate, channels, frames, format, sequence: nextSequence };
  },
  getStats(): AudioPipelineStats {
    return { pcmChunks, rejectedChunks, lastSequence: sequence, acceptedFrames };
  },
  resetStats() {
    pcmChunks = 0;
    rejectedChunks = 0;
    sequence = -1;
    acceptedFrames = 0;
  },
  addListener(eventName: 'audioLevel' | 'audioPcm', listener: any) {
    listeners[eventName].add(listener);
    return { remove: () => listeners[eventName].delete(listener) };
  },
};

export default AudioPipeline;
