# Audio pipeline compatibility contract

The Android audio pipeline emits **16 kHz, mono, Float32 little-endian PCM** in fixed 800-frame chunks.

The compatibility harness validates:

- sample rate = 16,000 Hz
- mono stream (one channel)
- `f32le` payload format
- exactly 800 frames per chunk
- payload byte length = `frames * 4`
- every decoded sample is finite and in the normalized `[-1, 1]` range
- chunk sequence numbers are monotonic

The harness is an app-controlled validation boundary. It does not expose or attempt to inject audio into third-party applications.
