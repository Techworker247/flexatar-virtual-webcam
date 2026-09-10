import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';

export type FlexatarStatus = {
  engine: string;
  renderer: string;
  webgl?: string;
  frameOutput: string;
};

export const FlexatarRendererModule = requireNativeModule('FlexatarRenderer') as {
  getStatus(): FlexatarStatus;
};

export const FlexatarRendererView = requireNativeViewManager('FlexatarRenderer');

export default FlexatarRendererModule;
