# Android / Expo migration status

This branch is the Expo migration layer for the Android prototype. It deliberately does **not** build or publish an APK/AAB yet.

## Target architecture

- Expo SDK 57 / React Native 0.86 for the application and control UI.
- Expo development build + Expo Modules API for Android-only native capabilities. Expo Go is not the target because the project needs custom native modules.
- The existing Flexatar engine assets remain under `files/` and are copied into Android app assets by `plugins/with-flexatar-assets` during prebuild.
- Local Android modules are under `modules/` and are autolinked by `expo-module.config.json`.

## Phase gates

| Phase | Status | Current implementation |
|---|---|---|
| 1. Flexatar Android renderer | INTEGRATING | Expo renderer host + packaged engine-asset path established; actual WASM renderer hookup remains the next engineering gate. |
| 2. Real-time voice-processing | SCAFFOLDED | Native `AudioRecord` pipeline captures 16 kHz mono PCM and emits RMS telemetry. |
| 3. Processed audio → lip-sync | SCAFFOLDED | Media pipeline accepts lip-sync samples; Flexatar audio-driver adapter still needs to consume the real renderer API. |
| 4. Frames → virtual camera | TEST-SINK ONLY | In-app rendered-frame sink exists for validation. No third-party camera injection is implemented. |
| 5. Camera2 injection | NOT IMPLEMENTED | Replace with an app-controlled Camera2 compatibility/test harness; no hidden third-party camera injection. |
| 6. Android microphone injection | NOT IMPLEMENTED | Use the app-controlled audio pipeline/test sink rather than arbitrary third-party microphone injection. |
| 7. Telegram audio testing | NOT IMPLEMENTED | Validate the audio path in the app/test harness first; no covert Telegram media injection. |
| 8. Unified control interface | SCAFFOLDED | Expo control UI now exposes renderer, camera, permissions, and phase status in one app shell. |

## Build policy

No installable Android artifact is produced as part of this migration commit. Once all permitted native phases are complete and verified, an Android development APK can be produced; a release AAB can be produced separately for distribution.

## Important renderer note

The upstream Flexatar integration is browser-oriented and uses a Web Worker/WebAssembly renderer. This migration keeps those engine assets intact and establishes a native Android asset boundary. The remaining renderer work is to make the WASM/WebGL runtime produce frames reliably inside the Android runtime, then connect those frames to the app-controlled media sink.
