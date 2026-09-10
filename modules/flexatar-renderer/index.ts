import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';

export type FlexatarStatus = {
  engine: string;
  renderer: string;
  webgl?: string;
  frameOutput: string;
};

export type FlexatarRendererEvent = {
  type: 'starting' | 'ready' | 'frame' | 'error' | 'command-error' | 'bridge-error' | 'resized' | 'avatarChanged' | string;
  message?: string;
  width?: number;
  height?: number;
  timestampNs?: number;
  fps?: number;
  localRenderer?: boolean;
};

export const FlexatarRendererModule = requireNativeModule('FlexatarRenderer') as {
  getStatus(): FlexatarStatus;
  feedAudioPcm(base64: string): boolean;
  sendCommand(command: string, payload: string): boolean;
};

export const FlexatarRendererView = requireNativeViewManager('FlexatarRenderer');

export default FlexatarRendererModule;
