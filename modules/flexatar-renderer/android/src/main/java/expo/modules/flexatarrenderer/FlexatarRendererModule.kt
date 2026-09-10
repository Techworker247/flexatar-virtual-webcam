package expo.modules.flexatarrenderer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FlexatarRendererModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FlexatarRenderer")

    View(FlexatarRendererView::class) {
      Events("onRendererEvent")

      AsyncFunction("feedAudioPcm") { view: FlexatarRendererView, base64: String ->
        view.feedAudioPcm(base64)
      }
    }

    Function("getStatus") {
      mapOf(
        "engine" to "local-assets",
        "renderer" to "android-webview-host",
        "webgl" to "pending-runtime-check",
        "frameOutput" to "app-controlled"
      )
    }
  }
}
