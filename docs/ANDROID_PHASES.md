# Android implementation phases

The Android application is an Expo development-build project with local native Expo Modules. No APK/AAB is produced until implementation and validation are complete.

## Current status

### Phase 1 — Flexatar Android renderer
**Status: IMPLEMENTATION COMPLETE / DEVICE VALIDATION PENDING**

- Expo native renderer surface is integrated.
- Flexatar engine assets and the local renderer bundle are packaged by Expo prebuild.
- Runtime CDN dependency has been removed.
- WebGL/WebView/WASM behavior still requires a real Android development-build validation pass.

### Phase 2 — real-time voice processing
**Status: IMPLEMENTED**

- 16 kHz mono `AudioRecord` capture.
- DC removal, noise gate, gain and soft limiting.
- Processed PCM chunks and audio-level telemetry are available.

### Phase 3 — processed audio → Flexatar lip-sync
**Status: IMPLEMENTED / DEVICE VALIDATION PENDING**

- Processed PCM has a native-to-renderer hand-off through `feedAudioPcm`.
- Flexatar's local speech/lip-sync assets remain packaged with the renderer.

### Phase 4 — Flexatar frames → controlled virtual camera
**Status: CONTROLLED FRAME SINK IMPLEMENTED**

- Frame descriptors are accepted and validated for dimensions, timestamps, rotation and FPS.
- This remains an app-controlled sink; it is not a hidden replacement for another application's camera.

### Phase 5 — Camera2 integration
**Status: COMPATIBILITY HARNESS IMPLEMENTED / DEVICE VALIDATION PENDING**

- Android Camera2 devices can be enumerated.
- Lens-facing information, hardware level, sensor orientation and supported output sizes are exposed.
- Frame descriptors can be validated against Camera2-compatible constraints.
- Actual camera-session/device validation remains for a development build on physical Android hardware.

### Phase 6 — Android microphone processing
**Status: CONTROLLED PROCESSING PIPELINE**

Processed PCM remains inside the app/test pipeline. A universal Android microphone injection layer is not assumed.

### Phase 7 — audio compatibility testing
**Status: CONTROLLED TESTING PLANNED**

The completed audio path will be tested only in media endpoints controlled by the app or an explicit test target.

### Phase 8 — unified control interface
**Status: EXPO SHELL / PIPELINE CONTROLS INTEGRATED**

The Expo UI exposes renderer and voice-processing controls. Final release controls follow the remaining device-validation work.

## Build policy

Do not generate an installable APK/AAB until the implementation and permitted validation phases are complete.
