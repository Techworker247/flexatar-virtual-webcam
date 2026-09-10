import { requireNativeModule } from 'expo-modules-core';

type AudioPipeline = { start(): Promise<void>; stop(): Promise<void> };
export default requireNativeModule('AudioPipeline') as AudioPipeline;
