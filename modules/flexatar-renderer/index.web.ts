import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

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

type Props = {
  style?: object;
  onRendererEvent?: (event: FlexatarRendererEvent) => void;
};

const listeners = new Set<(event: FlexatarRendererEvent) => void>();
let frameTimer: ReturnType<typeof setInterval> | null = null;
let running = false;

function emit(event: FlexatarRendererEvent) {
  listeners.forEach((listener) => listener(event));
}

export const FlexatarRendererModule = {
  getStatus(): FlexatarStatus {
    return {
      engine: 'web-simulation',
      renderer: 'browser-test-host',
      webgl: 'not-native-runtime',
      frameOutput: 'simulated-app-controlled',
    };
  },
  feedAudioPcm(_base64: string): boolean {
    return true;
  },
  sendCommand(_command: string, _payload: string): boolean {
    return true;
  },
};

export const FlexatarRendererView = ({ style, onRendererEvent }: Props) => {
  const callback = useRef(onRendererEvent);
  callback.current = onRendererEvent;

  useEffect(() => {
    const listener = (event: FlexatarRendererEvent) => callback.current?.(event);
    listeners.add(listener);
    emit({ type: 'starting', localRenderer: true });
    const readyTimer = setTimeout(() => {
      emit({ type: 'ready', localRenderer: true, width: 720, height: 720 });
      if (!running) {
        running = true;
        let last = performance.now();
        frameTimer = setInterval(() => {
          const now = performance.now();
          const fps = 1000 / Math.max(1, now - last);
          last = now;
          emit({
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
      listeners.delete(listener);
      if (listeners.size === 0 && frameTimer) {
        clearInterval(frameTimer);
        frameTimer = null;
        running = false;
      }
    };
  }, []);

  return <View style={style as any}><Text style={{ color: '#8e98a8', padding: 16 }}>Web test simulation — native WebView/WASM is not running.</Text></View>;
};

export default FlexatarRendererModule;
