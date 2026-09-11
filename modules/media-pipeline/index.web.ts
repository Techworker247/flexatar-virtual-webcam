export type FrameDescriptor = {
  accepted: boolean;
  width: number;
  height: number;
  timestampNs: number;
  rotation: number;
  fps: number;
  frameCount: number;
};

export type MediaStats = {
  renderedFrames: number;
  lipSyncSamples: number;
  lastTimestampNs: number;
  sink: string;
  externalInjection: boolean;
};

let renderedFrames = 0;
let lipSyncSamples = 0;
let lastTimestampNs = 0;

const MediaPipeline = {
  submitRenderedFrame(width: number, height: number): FrameDescriptor {
    return this.submitFrameDescriptor(width, height, Math.round(performance.now() * 1_000_000), 0, 30);
  },
  submitFrameDescriptor(width: number, height: number, timestampNs: number, rotation: number, fps: number): FrameDescriptor {
    if (width <= 0 || height <= 0) throw new Error('invalid-frame-size');
    if (![0, 90, 180, 270].includes(rotation)) throw new Error('invalid-rotation');
    if (fps <= 0 || fps > 120) throw new Error('invalid-fps');
    if (timestampNs < lastTimestampNs) throw new Error('non-monotonic-timestamp');
    lastTimestampNs = timestampNs;
    renderedFrames += 1;
    return { accepted: true, width, height, timestampNs, rotation, fps, frameCount: renderedFrames };
  },
  submitLipSyncSample(level: number) {
    if (!Number.isFinite(level)) throw new Error('invalid-audio-level');
    lipSyncSamples += 1;
    return { accepted: true, level, sampleCount: lipSyncSamples };
  },
  getStats(): MediaStats {
    return { renderedFrames, lipSyncSamples, lastTimestampNs, sink: 'web-simulation', externalInjection: false };
  },
  reset() {
    renderedFrames = 0;
    lipSyncSamples = 0;
    lastTimestampNs = 0;
  },
};

export default MediaPipeline;
