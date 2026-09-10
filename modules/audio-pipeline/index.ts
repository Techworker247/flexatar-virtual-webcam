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
};

type AudioPipeline = {
  start(): Promise<void>;
  stop(): Promise<void>;
  addListener(eventName: 'audioLevel', listener: (event: AudioLevelEvent) => void): { remove(): void };
  addListener(eventName: 'audioPcm', listener: (event: AudioPcmEvent) => void): { remove(): void };
};

export type { AudioLevelEvent, AudioPcmEvent };
export default requireNativeModule('AudioPipeline') as AudioPipeline;
