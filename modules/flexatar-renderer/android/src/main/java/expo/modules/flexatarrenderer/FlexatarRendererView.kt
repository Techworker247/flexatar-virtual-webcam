package expo.modules.flexatarrenderer

import android.annotation.SuppressLint
import android.graphics.Color
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

@SuppressLint("SetJavaScriptEnabled")
class FlexatarRendererView(context: AppContext) : ExpoView(context, null) {
  private val webView = WebView(context.reactContext)

  init {
    setBackgroundColor(Color.BLACK)
    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.mediaPlaybackRequiresUserGesture = false
    webView.settings.allowFileAccess = true
    webView.settings.allowContentAccess = true
    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = WebViewClient()
    addView(webView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    webView.loadUrl("file:///android_asset/flexatar/renderer-host.html")
  }

  fun sendCommand(command: String, payload: String = "{}") {
    val safePayload = payload.replace("\\", "\\\\").replace("'", "\\'")
    webView.post {
      webView.evaluateJavascript("window.flexatarNativeCommand && window.flexatarNativeCommand('$command', '$safePayload');", null)
    }
  }
}
