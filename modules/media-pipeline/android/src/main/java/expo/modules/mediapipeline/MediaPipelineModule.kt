package expo.modules.mediapipeline

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicLong

class MediaPipelineModule : Module() {
  private val frames = AtomicLong(0)
  private val audioFrames = AtomicLong(0)

  override fun definition() = ModuleDefinition {
    Name("MediaPipeline")
    Function("submitRenderedFrame") { width: Int, height: Int ->
      frames.incrementAndGet()
      mapOf("accepted" to true, "width" to width, "height" to height, "frameCount" to frames.get())
    }
    Function("submitLipSyncSample") { level: Double ->
      audioFrames.incrementAndGet()
      mapOf("accepted" to true, "level" to level, "sampleCount" to audioFrames.get())
    }
    Function("getStats") {
      mapOf("renderedFrames" to frames.get(), "lipSyncSamples" to audioFrames.get(), "sink" to "in-app-test")
    }
    Function("reset") {
      frames.set(0)
      audioFrames.set(0)
    }
  }
}
