package expo.modules.flexatarrenderer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FlexatarRendererModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FlexatarRenderer")
    Function("getStatus") { mapOf("engine" to "local-assets", "renderer" to "webview-host", "frameOutput" to "app-controlled") }
  }
}
