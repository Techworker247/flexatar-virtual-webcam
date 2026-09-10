import { requireNativeModule } from 'expo-modules-core';

type AudioLevelEvent = {
  rms: number;
  sampleRate: number;
  frames: number;
};

type AudioPcmEvent = {
  base64: string;
  sampleRate: number;
  frames: number;
  format: 'f32le';
  sequence: number;
};

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

type AudioPipeline = {
  start(): Promise<void>;
  stop(): Promise<void>;
  validatePcmChunk(base64: string, sampleRate: number, channels: number, frames: number, format: string, sequence: number): Promise<AudioCompatibilityResult>;
  getStats(): AudioPipelineStats;
  resetStats(): void;
  addListener(eventName: 'audioLevel', listener: (event: AudioLevelEvent) => void): { remove(): void };
  addListener(eventName: 'audioPcm', listener: (event: AudioPcmEvent) => void): { remove(): void };
};

export type { AudioLevelEvent, AudioPcmEvent };
export default requireNativeModule('AudioPipeline') as AudioPipeline;
