import React, { useEffect, useRef } from 'react';
import { Platform, Text, View } from 'react-native';
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

type NativeModule = {
  getStatus(): FlexatarStatus;
  feedAudioPcm(base64: string): boolean;
  sendCommand(command: string, payload: string): boolean;
};

type Props = {
  style?: object;
  onRendererEvent?: (event: FlexatarRendererEvent) => void;
};

// Metro can resolve this shared entrypoint on web before considering platform
// extensions. Keep the native module lookup behind a platform guard so the
// browser test harness never asks expo-modules-core for a native module.
const web = Platform.OS === 'web';

const webListeners = new Set<(event: FlexatarRendererEvent) => void>();
let webFrameTimer: ReturnType<typeof setInterval> | null = null;
let webRunning = false;

function emitWeb(event: FlexatarRendererEvent) {
  webListeners.forEach((listener) => listener(event));
}

const webModule: NativeModule = {
  getStatus() {
    return {
      engine: 'web-simulation',
      renderer: 'browser-test-host',
      webgl: 'not-native-runtime',
      frameOutput: 'simulated-app-controlled',
    };
  },
  feedAudioPcm(_base64: string) {
    return true;
  },
  sendCommand(_command: string, _payload: string) {
    return true;
  },
};

export const FlexatarRendererModule: NativeModule = web
  ? webModule
  : requireNativeModule('FlexatarRenderer');

const WebFlexatarRendererView = ({ style, onRendererEvent }: Props) => {
  const callback = useRef(onRendererEvent);
  callback.current = onRendererEvent;

  useEffect(() => {
    const listener = (event: FlexatarRendererEvent) => callback.current?.(event);
    webListeners.add(listener);
    emitWeb({ type: 'starting', localRenderer: true });

    const readyTimer = setTimeout(() => {
      emitWeb({ type: 'ready', localRenderer: true, width: 720, height: 720 });
      if (!webRunning) {
        webRunning = true;
        let last = performance.now();
        webFrameTimer = setInterval(() => {
          const now = performance.now();
          const fps = 1000 / Math.max(1, now - last);
          last = now;
          emitWeb({
            type: 'frame',
            width: 720,
            height: 720,
            timestampNs: Math.round(now * 1_000_000),
            fps,
            localRenderer: true,
          });
        }, 33);
      }
    }, 50);

    return () => {
      clearTimeout(readyTimer);
      webListeners.delete(listener);
      if (webListeners.size === 0 && webFrameTimer) {
        clearInterval(webFrameTimer);
        webFrameTimer = null;
        webRunning = false;
      }
    };
  }, []);

  return (
    <View style={style as any}>
      <Text style={{ color: '#8e98a8', padding: 16 }}>
        Web test simulation — native WebView/WASM is not running.
      </Text>
    </View>
  );
};

export const FlexatarRendererView = web
  ? WebFlexatarRendererView
  : requireNativeViewManager('FlexatarRenderer');

export default FlexatarRendererModule;
