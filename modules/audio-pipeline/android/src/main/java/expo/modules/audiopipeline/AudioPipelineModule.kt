package expo.modules.audiopipeline

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.abs
import kotlin.math.sqrt
import kotlin.math.tanh

class AudioPipelineModule : Module() {
  private var recorder: AudioRecord? = null
  private var worker: Thread? = null
  @Volatile private var running = false
  private val pcmChunks = AtomicLong(0)
  private val rejectedChunks = AtomicLong(0)
  private val acceptedFrames = AtomicLong(0)
  @Volatile private var lastSequence = -1L
  @Volatile private var nextSequence = 0L

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

            val gated = if (magnitude < 0.012) centered * 0.15 else centered
            val amplified = gated * 1.35
            val processed = tanh(amplified * 1.25).toFloat()

            sum += processed.toDouble() * processed.toDouble()
            pending[pendingCount++] = processed

            if (pendingCount == pending.size) {
              emitPcm(pending, sampleRate, nextSequence++)
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

    AsyncFunction("validatePcmChunk") { base64: String, sampleRate: Int, channels: Int, frames: Int, format: String, sequence: Long ->
      val result = validateChunk(base64, sampleRate, channels, frames, format, sequence)
      if (result.first) {
        pcmChunks.incrementAndGet()
        acceptedFrames.addAndGet(frames.toLong())
        lastSequence = sequence
      } else {
        rejectedChunks.incrementAndGet()
      }
      mapOf(
        "accepted" to result.first,
        "reason" to result.second,
        "sampleRate" to sampleRate,
        "channels" to channels,
        "frames" to frames,
        "format" to format,
        "sequence" to sequence
      )
    }

    Function("getStats") {
      mapOf(
        "pcmChunks" to pcmChunks.get(),
        "rejectedChunks" to rejectedChunks.get(),
        "lastSequence" to lastSequence,
        "acceptedFrames" to acceptedFrames.get()
      )
    }

    Function("resetStats") {
      pcmChunks.set(0)
      rejectedChunks.set(0)
      acceptedFrames.set(0)
      lastSequence = -1L
      nextSequence = 0L
    }
  }

  private fun validateChunk(base64: String, sampleRate: Int, channels: Int, frames: Int, format: String, sequence: Long): Pair<Boolean, String> {
    if (sampleRate != 16000) return false to "unsupported-sample-rate"
    if (channels != 1) return false to "unsupported-channel-count"
    if (frames != 800) return false to "invalid-frame-count"
    if (format != "f32le") return false to "unsupported-format"
    if (sequence < 0 || (lastSequence >= 0 && sequence <= lastSequence)) return false to "non-monotonic-sequence"

    val bytes = try {
      Base64.decode(base64, Base64.DEFAULT)
    } catch (_: IllegalArgumentException) {
      return false to "invalid-base64"
    }
    if (bytes.size != frames * 4) return false to "invalid-payload-length"

    val buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
    repeat(frames) {
      val sample = buffer.float
      if (!sample.isFinite()) return false to "non-finite-sample"
      if (sample < -1.0f || sample > 1.0f) return false to "sample-out-of-range"
    }
    return true to "compatible"
  }

  private fun emitPcm(samples: FloatArray, sampleRate: Int, sequence: Long) {
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
        "format" to "f32le",
        "sequence" to sequence
      )
    )
  }
}
