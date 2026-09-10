package expo.modules.flexatarrenderer

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

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
    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = WebViewClient()
    addView(webView)
    webView.loadUrl("file:///android_asset/flexatar/renderer-host.html")
  }

  fun sendCommand(command: String, payload: String = "{}") {
    val safePayload = payload.replace("\\", "\\\\").replace("'", "\\'")
    webView.post {
      webView.evaluateJavascript("window.flexatarNativeCommand && window.flexatarNativeCommand('$command', '$safePayload');", null)
    }
  }

  fun feedAudioPcm(base64: String) {
    sendCommand("audioPcm", "{\"base64\":\"$base64\"}")
  }
}
