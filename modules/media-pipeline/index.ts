import { requireNativeModule } from 'expo-modules-core';

type FrameDescriptor = {
  accepted: boolean;
  width: number;
  height: number;
  timestampNs: number;
  rotation: number;
  fps: number;
  frameCount: number;
};

type MediaStats = {
  renderedFrames: number;
  lipSyncSamples: number;
  lastTimestampNs: number;
  sink: string;
  externalInjection: boolean;
};

type MediaPipeline = {
  submitRenderedFrame(width: number, height: number): FrameDescriptor;
  submitFrameDescriptor(width: number, height: number, timestampNs: number, rotation: number, fps: number): FrameDescriptor;
  submitLipSyncSample(level: number): { accepted: boolean; level: number; sampleCount: number };
  getStats(): MediaStats;
  reset(): void;
};

export type { FrameDescriptor, MediaStats };
export default requireNativeModule('MediaPipeline') as MediaPipeline;
