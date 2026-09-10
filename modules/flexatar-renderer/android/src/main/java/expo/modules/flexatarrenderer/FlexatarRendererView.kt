package expo.modules.flexatarrenderer

import android.annotation.SuppressLint
import android.graphics.Color
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

@SuppressLint("SetJavaScriptEnabled")
class FlexatarRendererView(context: AppContext) : ExpoView(context, null) {
  private val webView = WebView(context.reactContext)
  private val assetLoader = WebViewAssetLoader.Builder()
    .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context.reactContext))
    .build()

  init {
    setBackgroundColor(Color.BLACK)
    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.mediaPlaybackRequiresUserGesture = false
    webView.settings.allowFileAccess = false
    webView.settings.allowContentAccess = false
    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = object : WebViewClient() {
      override fun shouldInterceptRequest(view: WebView, url: String) = assetLoader.shouldInterceptRequest(url)
    }
    addView(webView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    webView.loadUrl("https://appassets.androidplatform.net/assets/flexatar/renderer-host.html")
  }

  fun sendCommand(command: String, payload: String = "{}") {
    val safePayload = payload.replace("\\", "\\\\").replace("'", "\\'")
    webView.post {
      webView.evaluateJavascript("window.flexatarNativeCommand && window.flexatarNativeCommand('$command', '$safePayload');", null)
    }
  }
}
