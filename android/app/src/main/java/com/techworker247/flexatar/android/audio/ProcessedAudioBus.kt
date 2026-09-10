package com.techworker247.flexatar.android.audio

import java.util.concurrent.CopyOnWriteArraySet

/**
 * In-process PCM fan-out used by the Android prototype.
 *
 * The voice transformer will publish processed PCM here. The avatar renderer
 * consumes the same stream for lip-sync, while a future app-owned call target
 * can consume it for testing. This deliberately does not attempt to bypass
 * Android's application sandbox or inject audio into another app.
 */
class ProcessedAudioBus {
    interface Listener {
        fun onPcm(samples: ShortArray, sampleRate: Int, channelCount: Int)
    }

    private val listeners = CopyOnWriteArraySet<Listener>()

    fun addListener(listener: Listener) = listeners.add(listener)
    fun removeListener(listener: Listener) = listeners.remove(listener)

    fun publish(samples: ShortArray, sampleRate: Int, channelCount: Int) {
        listeners.forEach { it.onPcm(samples, sampleRate, channelCount) }
    }
}
