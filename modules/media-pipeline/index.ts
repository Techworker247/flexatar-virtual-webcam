import { requireNativeModule } from 'expo-modules-core';

type MediaPipeline = {
  submitRenderedFrame(width: number, height: number): { accepted: boolean; width: number; height: number; frameCount: number };
  submitLipSyncSample(level: number): { accepted: boolean; level: number; sampleCount: number };
  getStats(): { renderedFrames: number; lipSyncSamples: number; sink: string };
  reset(): void;
};
export default requireNativeModule('MediaPipeline') as MediaPipeline;
