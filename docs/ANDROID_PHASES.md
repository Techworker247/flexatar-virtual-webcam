# Android implementation phases

The Android application is being built as an Expo development-build project with local native Expo Modules. No APK/AAB is produced until the implementation and validation phases are complete.

## Current status

### Phase 1 — Flexatar Android renderer
**Status: IMPLEMENTATION COMPLETE / DEVICE VALIDATION PENDING**

- Expo native `FlexatarRendererView` provides the Android renderer surface.
- The existing Flexatar engine assets are packaged into Android assets by the Expo prebuild plugin.
- `easy-renderer.js` is loaded from the packaged assets; the runtime CDN dependency has been removed.
- `FtarRenderer` initializes against the packaged engine files and the default avatar/background.
- Real-device WebGL/WebView/WASM validation remains before this phase can be marked fully validated.

### Phase 2 — real-time voice processing
**Status: IMPLEMENTED**

- Native `AudioRecord` capture runs at 16 kHz mono.
- The processing boundary now includes DC removal, noise gating, gain and soft limiting.
- Processed audio is emitted as 800-frame Float32 little-endian PCM chunks.
- Audio level telemetry remains available for the control UI.

### Phase 3 — processed audio → Flexatar lip-sync
**Status: IMPLEMENTED / DEVICE VALIDATION PENDING**

- The Expo renderer view exposes a native `feedAudioPcm` view function.
- Processed PCM is forwarded to the Flexatar renderer's existing audio/lip-sync path.
- The existing Flexatar speech models remain local in the packaged engine assets.
- Real-device latency and WebGL performance still need validation.

### Phase 4 — Flexatar frames → controlled virtual camera
**Status: CONTROLLED TEST SINK**

Frame output remains app-controlled. No hidden third-party camera replacement is enabled.

### Phase 5 — Camera2 integration
**Status: TEST HARNESS PLANNED**

Validate frame formats, timestamps, orientation, rotation and lifecycle in a controlled test target before any external-app compatibility work.

### Phase 6 — Android microphone processing
**Status: CONTROLLED PROCESSING PIPELINE**

Processed PCM remains inside the app/test pipeline. A universal Android microphone injection layer is not assumed because Android does not provide a general desktop-style virtual microphone for arbitrary apps.

### Phase 7 — audio compatibility testing
**Status: CONTROLLED TESTING PLANNED**

Test the completed audio path in targets where the app controls the media endpoint. Do not use this phase to bypass another application's privacy or media controls.

### Phase 8 — unified control interface
**Status: EXPO SHELL / PIPELINE CONTROLS INTEGRATED**

The Expo UI now exposes the renderer and live voice-processing/lip-sync controls. Final release controls and validation remain after the controlled media test phases.
