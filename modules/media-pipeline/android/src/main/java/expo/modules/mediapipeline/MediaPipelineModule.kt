package expo.modules.mediapipeline

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicLong

class MediaPipelineModule : Module() {
  private val frames = AtomicLong(0)
  private val audioFrames = AtomicLong(0)
  private var lastTimestampNs = 0L

  override fun definition() = ModuleDefinition {
    Name("MediaPipeline")

    Function("submitRenderedFrame") { width: Int, height: Int ->
      submitFrame(width, height, System.nanoTime(), 0, 30.0)
    }

    Function("submitFrameDescriptor") { width: Int, height: Int, timestampNs: Long, rotation: Int, fps: Double ->
      submitFrame(width, height, timestampNs, rotation, fps)
    }

    Function("submitLipSyncSample") { level: Double ->
      audioFrames.incrementAndGet()
      mapOf("accepted" to true, "level" to level, "sampleCount" to audioFrames.get())
    }

    Function("getStats") {
      mapOf(
        "renderedFrames" to frames.get(),
        "lipSyncSamples" to audioFrames.get(),
        "lastTimestampNs" to lastTimestampNs,
        "sink" to "in-app-test",
        "externalInjection" to false
      )
    }

    Function("reset") {
      frames.set(0)
      audioFrames.set(0)
      lastTimestampNs = 0L
    }
  }

  private fun submitFrame(width: Int, height: Int, timestampNs: Long, rotation: Int, fps: Double): Map<String, Any> {
    require(width > 0 && height > 0) { "Frame dimensions must be positive" }
    require(rotation == 0 || rotation == 90 || rotation == 180 || rotation == 270) { "Rotation must be 0, 90, 180 or 270" }
    require(fps > 0.0 && fps <= 120.0) { "FPS must be between 0 and 120" }
    require(timestampNs >= lastTimestampNs) { "Frame timestamp must be monotonic" }

    lastTimestampNs = timestampNs
    val count = frames.incrementAndGet()
    return mapOf(
      "accepted" to true,
      "width" to width,
      "height" to height,
      "timestampNs" to timestampNs,
      "rotation" to rotation,
      "fps" to fps,
      "frameCount" to count
    )
  }
}
