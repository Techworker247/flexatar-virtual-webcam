import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const required = [
  'App.tsx',
  'app.json',
  'assets/flexatar/renderer-host.html',
  'files/easy-renderer.js',
  'modules/flexatar-renderer/index.ts',
  'modules/flexatar-renderer/android/src/main/java/expo/modules/flexatarrenderer/FlexatarRendererModule.kt',
  'modules/flexatar-renderer/android/src/main/java/expo/modules/flexatarrenderer/FlexatarRendererView.kt',
  'modules/audio-pipeline/index.ts',
  'modules/audio-pipeline/android/src/main/java/expo/modules/audiopipeline/AudioPipelineModule.kt',
  'modules/media-pipeline/index.ts',
  'modules/media-pipeline/android/src/main/java/expo/modules/mediapipeline/MediaPipelineModule.kt',
  'modules/camera2-test/android/src/main/java/expo/modules/camera2test/Camera2TestModule.kt',
  'plugins/with-flexatar-assets.js',
];

const checks = [];
const fail = (message) => checks.push(`FAIL  ${message}`);
const pass = (message) => checks.push(`PASS  ${message}`);

for (const file of required) {
  const path = join(root, file);
  if (!existsSync(path) || !statSync(path).isFile()) fail(`missing ${file}`);
  else pass(`present ${file}`);
}

const rendererHost = readFileSync(join(root, 'assets/flexatar/renderer-host.html'), 'utf8');
const rendererNative = readFileSync(join(root, 'modules/flexatar-renderer/android/src/main/java/expo/modules/flexatarrenderer/FlexatarRendererView.kt'), 'utf8');
const app = readFileSync(join(root, 'App.tsx'), 'utf8');
const media = readFileSync(join(root, 'modules/media-pipeline/android/src/main/java/expo/modules/mediapipeline/MediaPipelineModule.kt'), 'utf8');
const camera2 = readFileSync(join(root, 'modules/camera2-test/android/src/main/java/expo/modules/camera2test/Camera2TestModule.kt'), 'utf8');

for (const [needle, label] of [
  ['FlexatarNative', 'native renderer JS bridge'],
  ['requestAnimationFrame', 'renderer frame loop'],
  ['audioPcm', 'renderer audio command'],
  ['vCamStream', 'Flexatar lip-sync audio handoff'],
]) {
  if (rendererHost.includes(needle)) pass(`renderer host contains ${label}`); else fail(`renderer host missing ${label}`);
}

for (const [needle, label] of [
  ['addJavascriptInterface', 'Android JS bridge'],
  ['loadUrl("file:///android_asset/flexatar/renderer-host.html")', 'packaged renderer asset load'],
  ['onRendererEvent', 'renderer event export'],
]) {
  if (rendererNative.includes(needle)) pass(`native renderer contains ${label}`); else fail(`native renderer missing ${label}`);
}

for (const [needle, label] of [
  ['validatePcmChunk', 'PCM compatibility gate'],
  ['feedAudioPcm', 'validated PCM → renderer handoff'],
  ['submitFrameDescriptor', 'frame → controlled media sink'],
  ['submitLipSyncSample', 'audio telemetry → controlled media sink'],
]) {
  if (app.includes(needle)) pass(`app contains ${label}`); else fail(`app missing ${label}`);
}

for (const [needle, label] of [
  ['timestampNs >= lastTimestampNs', 'monotonic frame timestamp gate'],
  ['fps <= 120.0', 'frame rate upper bound'],
  ['externalInjection" to false', 'external injection disabled'],
]) {
  if (media.includes(needle)) pass(`media sink contains ${label}`); else fail(`media sink missing ${label}`);
}

for (const [needle, label] of [
  ['CameraManager', 'Camera2 manager access'],
  ['SENSOR_ORIENTATION', 'sensor orientation check'],
  ['validateFrame', 'Camera2 frame validation'],
]) {
  if (camera2.includes(needle)) pass(`Camera2 harness contains ${label}`); else fail(`Camera2 harness missing ${label}`);
}

const failures = checks.filter((line) => line.startsWith('FAIL')).length;
console.log(checks.join('\n'));
console.log(`\n${failures === 0 ? 'VALIDATION PASS' : `VALIDATION FAILED (${failures} checks)`}`);
process.exitCode = failures === 0 ? 0 : 1;
