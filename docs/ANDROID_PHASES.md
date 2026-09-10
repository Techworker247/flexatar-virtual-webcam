# Android implementation phases

The Android application is being built as an Expo development-build project with local native Expo Modules. No APK/AAB is produced until the implementation and validation phases are complete.

## Current status

### Phase 1 — Flexatar Android renderer
**Status: INTEGRATION IN PROGRESS**

- Expo native `FlexatarRendererView` now provides the Android renderer surface.
- The renderer host is packaged with the existing Flexatar engine assets during Expo prebuild.
- The host initializes `FtarRenderer` and points it at the packaged engine files.
- The current bootstrap uses the browser ESM package as the engine adapter; this is an integration checkpoint, not the final offline distribution mechanism.
- WebGL/runtime compatibility still needs to be validated on a real Android development build.

### Phase 2 — real-time voice processing
**Status: SCAFFOLD COMPLETE**

Native 16 kHz mono PCM capture and the processed-audio fan-out boundary exist. Voice DSP/effects remain to be implemented.

### Phase 3 — processed audio → Flexatar lip-sync
**Status: ADAPTER PENDING**

The audio pipeline has a stable hand-off point; the final connection to the renderer's audio driver is pending Phase 1 runtime validation.

### Phase 4 — Flexatar frames → virtual camera
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
**Status: EXPO SHELL COMPLETE / FINAL INTEGRATION PENDING**

The Expo control UI is present. Final controls will be connected after renderer, audio and frame pipelines are validated.
