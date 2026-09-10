import { requireNativeModule } from 'expo-modules-core';

export type FlexatarStatus = { engine: string; renderer: string; frameOutput: string };
export default requireNativeModule('FlexatarRenderer') as { getStatus(): FlexatarStatus };
