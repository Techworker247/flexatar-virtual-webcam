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
  private var rendererReady = false

  init {
    setBackgroundColor(Color.BLACK)
    webView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.mediaPlaybackRequiresUserGesture = false
    webView.settings.allowFileAccess = true
    webView.settings.allowContentAccess = true
    webView.settings.allowFileAccessFromFileURLs = true
    webView.settings.allowUniversalAccessFromFileURLs = true
    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = object : WebViewClient() {
      override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)
        rendererReady = false
      }
    }
    webView.addJavascriptInterface(Bridge(), "FlexatarAndroid")
    addView(webView)
    webView.loadUrl("file:///android_asset/flexatar/renderer-host.html")
  }

  fun sendCommand(command: String, payload: String = "{}") {
    val escapedCommand = JSONObject.quote(command)
    val escapedPayload = JSONObject.quote(payload)
    webView.post {
      webView.evaluateJavascript(
        "window.flexatarNativeCommand && window.flexatarNativeCommand($escapedCommand, $escapedPayload);",
        null
      )
    }
  }

  fun feedAudioPcm(base64: String) {
    if (!rendererReady) return
    sendCommand("audioPcm", JSONObject(mapOf("base64" to base64)).toString())
  }

  private inner class Bridge {
    @JavascriptInterface
    fun onRendererEvent(json: String) {
      try {
        val event = JSONObject(json)
        val type = event.optString("type", "unknown")
        rendererReady = type == "ready"
        sendEvent("onRendererEvent", mapOf("type" to type, "message" to event.optString("message", ""), "localRenderer" to event.optBoolean("localRenderer", false)))
      } catch (_: Exception) {
        sendEvent("onRendererEvent", mapOf("type" to "bridge-error", "message" to "invalid-event"))
      }
    }
  }

  override fun onDetachedFromWindow() {
    rendererReady = false
    webView.stopLoading()
    webView.loadUrl("about:blank")
    webView.removeJavascriptInterface("FlexatarAndroid")
    webView.destroy()
    super.onDetachedFromWindow()
  }
}
