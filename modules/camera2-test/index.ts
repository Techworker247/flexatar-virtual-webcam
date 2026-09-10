import { requireNativeModule } from 'expo-modules-core';

export type Camera2Device = {
  id: string;
  lensFacing: 'front' | 'back' | 'external' | 'unknown';
  hardwareLevel: string;
  sensorOrientation: number;
  outputSizes: Array<{ width: number; height: number }>;
};

type Camera2Test = {
  listDevices(): Promise<Camera2Device[]>;
  validateFrame(width: number, height: number, timestampNs: number, rotation: number, fps: number): Promise<{ accepted: boolean; reason: string }>;
};

export default requireNativeModule('Camera2Test') as Camera2Test;
