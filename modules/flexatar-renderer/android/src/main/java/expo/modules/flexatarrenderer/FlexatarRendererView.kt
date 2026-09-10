package expo.modules.flexatarrenderer

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import org.json.JSONObject

@SuppressLint("SetJavaScriptEnabled")
class FlexatarRendererView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val webView = WebView(context)

  init {
    setBackgroundColor(Color.BLACK)
    webView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.mediaPlaybackRequiresUserGesture = false
    webView.settings.allowFileAccess = true
    webView.settings.allowContentAccess = true
    webView.addJavascriptInterface(RendererBridge(), "FlexatarNative")
    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = WebViewClient()
    addView(webView)
    webView.loadUrl("file:///android_asset/flexatar/renderer-host.html")
  }

  private inner class RendererBridge {
    @JavascriptInterface
    fun event(json: String) {
      try {
        val payload = JSONObject(json)
        val type = payload.optString("type", "unknown")
        val event = mutableMapOf<String, Any>("type" to type)
        if (payload.has("message")) event["message"] = payload.optString("message")
        if (payload.has("width")) event["width"] = payload.optInt("width")
        if (payload.has("height")) event["height"] = payload.optInt("height")
        if (payload.has("timestampNs")) event["timestampNs"] = payload.optLong("timestampNs")
        if (payload.has("fps")) event["fps"] = payload.optDouble("fps")
        if (payload.has("localRenderer")) event["localRenderer"] = payload.optBoolean("localRenderer")
        sendEvent("onRendererEvent", event)
      } catch (_: Exception) {
        sendEvent("onRendererEvent", mapOf("type" to "bridge-error", "message" to "invalid-renderer-event"))
      }
    }
  }

  fun sendCommand(command: String, payload: String = "{}") {
    val safeCommand = JSONObject.quote(command)
    val safePayload = JSONObject.quote(payload)
    webView.post {
      webView.evaluateJavascript(
        "window.flexatarNativeCommand && window.flexatarNativeCommand($safeCommand, $safePayload);",
        null
      )
    }
  }

  fun feedAudioPcm(base64: String) {
    sendCommand("audioPcm", JSONObject(mapOf("base64" to base64)).toString())
  }

  override fun onDetachedFromWindow() {
    webView.stopLoading()
    webView.loadUrl("about:blank")
    webView.destroy()
    super.onDetachedFromWindow()
  }
}
