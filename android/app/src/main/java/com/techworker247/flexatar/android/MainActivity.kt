package com.techworker247.flexatar.android

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 48, 32, 32)
        }

        root.addView(TextView(this).apply {
            text = "Flexatar Android\n\nPhase 1 prototype: native media pipeline scaffold."
            textSize = 20f
        })
        root.addView(TextView(this).apply {
            text = "\nNext: embed the Flexatar renderer, feed it processed audio, and expose a local test video surface."
            textSize = 15f
        })

        setContentView(root)
        requestMediaPermissions()
    }

    private fun requestMediaPermissions() {
        val missing = listOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO)
            .filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) permissionLauncher.launch(missing.toTypedArray())
    }
}
