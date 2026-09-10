package expo.modules.audiopipeline

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.sqrt

class AudioPipelineModule : Module() {
  private var recorder: AudioRecord? = null
  private var worker: Thread? = null
  @Volatile private var running = false

  override fun definition() = ModuleDefinition {
    Name("AudioPipeline")
    Events("audioLevel")

    AsyncFunction("start") {
      if (running) return@AsyncFunction
      val sampleRate = 16000
      val min = AudioRecord.getMinBufferSize(sampleRate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
      recorder = AudioRecord(MediaRecorder.AudioSource.MIC, sampleRate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(min, 2048))
      recorder?.startRecording()
      running = true
      worker = Thread {
        val buffer = ShortArray(1024)
        while (running) {
          val count = recorder?.read(buffer, 0, buffer.size) ?: 0
          if (count > 0) {
            var sum = 0.0
            for (i in 0 until count) { val s = buffer[i].toDouble(); sum += s * s }
            val rms = sqrt(sum / count) / 32768.0
            sendEvent("audioLevel", mapOf("rms" to rms, "sampleRate" to sampleRate, "frames" to count))
          }
        }
      }.also { it.start() }
    }

    AsyncFunction("stop") {
      running = false
      worker?.join(250)
      worker = null
      recorder?.stop()
      recorder?.release()
      recorder = null
    }
  }
}
