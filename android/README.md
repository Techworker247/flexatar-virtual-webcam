# Flexatar Android prototype

This module is the first native Android layer for the Flexatar virtual-webcam project.

## Current phase

- Native Android/Gradle project scaffold.
- Camera and microphone runtime permissions.
- `ProcessedAudioBus` for an in-process processed-PCM pipeline.
- Explicit separation between avatar rendering and app-owned audio consumers.

## Planned media pipeline

```text
Android microphone
      |
      v
VoiceTransformer (future)
      |
      +--------------------+
      |                    |
      v                    v
ProcessedAudioBus     Flexatar renderer
      |                    |
      |                    +--> avatar frames
      |                         |
      +-------------------------+
                                v
                         local preview/test
```

The upstream Flexatar integration is currently browser/JavaScript based. The next implementation step is to embed its renderer in an Android-compatible runtime or replace the browser canvas boundary with a native renderer while preserving the existing engine assets. The upstream project documents that its realtime engine runs locally and can animate a photorealistic avatar from an audio track, including on phones.

## Virtual-camera integration

A separate adapter will be added after the renderer produces stable frames. The adapter will target legitimate testing and disclosed avatar use. It should not be used to impersonate a real person or bypass identity/security checks in third-party services.

## Build

From the repository root:

```bash
cd android
./gradlew assembleDebug
```

Android Studio can also open the `android/` directory directly.
