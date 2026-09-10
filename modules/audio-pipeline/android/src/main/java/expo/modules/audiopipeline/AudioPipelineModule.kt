package expo.modules.audiopipeline

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.abs
import kotlin.math.sqrt
import kotlin.math.tanh

class AudioPipelineModule : Module() {
  private var recorder: AudioRecord? = null
  private var worker: Thread? = null
  @Volatile private var running = false

  override fun definition() = ModuleDefinition {
    Name("AudioPipeline")
    Events("audioLevel", "audioPcm")

    AsyncFunction("start") {
      if (running) return@AsyncFunction

      val sampleRate = 16000
      val min = AudioRecord.getMinBufferSize(
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT
      )
      if (min <= 0) throw IllegalStateException("AudioRecord is not available")

      recorder = AudioRecord(
        MediaRecorder.AudioSource.MIC,
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT,
        maxOf(min, 4096)
      )

      recorder?.startRecording()
      running = true

      worker = Thread {
        val input = ShortArray(1024)
        val pending = FloatArray(800)
        var pendingCount = 0
        var dcEstimate = 0.0

        while (running) {
          val count = recorder?.read(input, 0, input.size) ?: 0
          if (count <= 0) continue

          var sum = 0.0
          for (i in 0 until count) {
            val raw = input[i].toDouble() / 32768.0
            dcEstimate = dcEstimate * 0.995 + raw * 0.005
            val centered = raw - dcEstimate
            val magnitude = abs(centered)

            // Lightweight real-time voice processing boundary:
            // noise gate -> gain -> soft limiter. The processed signal remains
            // 16 kHz mono and is delivered as Float32 PCM for lip-sync inference.
            val gated = if (magnitude < 0.012) centered * 0.15 else centered
            val amplified = gated * 1.35
            val processed = tanh(amplified * 1.25).toFloat()

            sum += processed.toDouble() * processed.toDouble()
            pending[pendingCount++] = processed

            if (pendingCount == pending.size) {
              emitPcm(pending, sampleRate)
              pendingCount = 0
            }
          }

          val rms = sqrt(sum / count)
          sendEvent("audioLevel", mapOf("rms" to rms, "sampleRate" to sampleRate, "frames" to count))
        }
      }.also { it.start() }
    }

    AsyncFunction("stop") {
      running = false
      worker?.join(500)
      worker = null
      recorder?.let {
        try { it.stop() } catch (_: IllegalStateException) { }
        it.release()
      }
      recorder = null
    }
  }

  private fun emitPcm(samples: FloatArray, sampleRate: Int) {
    val bytes = ByteBuffer.allocate(samples.size * 4)
      .order(ByteOrder.LITTLE_ENDIAN)
    for (sample in samples) bytes.putFloat(sample)

    val encoded = Base64.encodeToString(bytes.array(), Base64.NO_WRAP)
    sendEvent(
      "audioPcm",
      mapOf(
        "base64" to encoded,
        "sampleRate" to sampleRate,
        "frames" to samples.size,
        "format" to "f32le"
      )
    )
  }
}
