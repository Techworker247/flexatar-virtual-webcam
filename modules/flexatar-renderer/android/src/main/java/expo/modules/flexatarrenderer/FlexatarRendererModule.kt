package expo.modules.flexatarrenderer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FlexatarRendererModule : Module() {
  private var activeView: FlexatarRendererView? = null

  override fun definition() = ModuleDefinition {
    Name("FlexatarRenderer")

    View(FlexatarRendererView::class) {
      Events("onRendererEvent")

      OnViewDidMount { view ->
        activeView = view
      }

      OnViewDidUnmount { view ->
        if (activeView === view) activeView = null
      }
    }

    Function("feedAudioPcm") { base64: String ->
      activeView?.feedAudioPcm(base64)
      activeView != null
    }

    Function("sendCommand") { command: String, payload: String ->
      activeView?.sendCommand(command, payload)
      activeView != null
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
