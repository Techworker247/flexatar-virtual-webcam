package expo.modules.camera2test

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Size
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class Camera2TestModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Camera2Test")

    AsyncFunction("listDevices") {
      val context = appContext.reactContext ?: error("Android context unavailable")
      val manager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager

      manager.cameraIdList.map { id ->
        val c = manager.getCameraCharacteristics(id)
        val facing = when (c.get(CameraCharacteristics.LENS_FACING)) {
          CameraCharacteristics.LENS_FACING_FRONT -> "front"
          CameraCharacteristics.LENS_FACING_BACK -> "back"
          CameraCharacteristics.LENS_FACING_EXTERNAL -> "external"
          else -> "unknown"
        }
        val level = when (c.get(CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL)) {
          CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_LEGACY -> "legacy"
          CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_LIMITED -> "limited"
          CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_FULL -> "full"
          CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_3 -> "level-3"
          CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_EXTERNAL -> "external"
          else -> "unknown"
        }
        val orientation = c.get(CameraCharacteristics.SENSOR_ORIENTATION) ?: 0
        val sizes = c.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
          ?.getOutputSizes(android.graphics.SurfaceTexture::class.java)
          ?.take(24)
          ?.map { size -> mapOf("width" to size.width, "height" to size.height) }
          ?: emptyList()

        mapOf(
          "id" to id,
          "lensFacing" to facing,
          "hardwareLevel" to level,
          "sensorOrientation" to orientation,
          "outputSizes" to sizes
        )
      }
    }

    AsyncFunction("validateFrame") { width: Int, height: Int, timestampNs: Long, rotation: Int, fps: Double ->
      when {
        width <= 0 || height <= 0 -> mapOf("accepted" to false, "reason" to "invalid-dimensions")
        timestampNs < 0 -> mapOf("accepted" to false, "reason" to "invalid-timestamp")
        rotation !in listOf(0, 90, 180, 270) -> mapOf("accepted" to false, "reason" to "invalid-rotation")
        fps <= 0.0 || fps > 120.0 -> mapOf("accepted" to false, "reason" to "invalid-fps")
        else -> mapOf("accepted" to true, "reason" to "frame-descriptor-valid")
      }
    }
  }
}
