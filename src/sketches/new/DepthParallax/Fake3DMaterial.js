import * as THREE from 'three'
import { extend } from '@react-three/fiber'
// Import der Shader-Code aus externen GLSL-Dateien
import fake3DVertexShader from './glsl/fake3d.vert.glsl'
import fake3DFragmentShader from './glsl/fake3d.frag.glsl'

class Fake3DMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: fake3DVertexShader,
      fragmentShader: fake3DFragmentShader,
      uniforms: {
        // Farbbild-Textur und Tiefen-Textur
        uTexture: { value: null },
        uDepthMap: { value: null },
        // Maus-Position (als 2D-Vektor), Anfangswert (0,0)
        uMouse: { value: new THREE.Vector2(0, 0) },
        // Effektstärke (Scale) und Fokus-Ebene (Focus)
        uScale: { value: 0.15 },
        uFocus: { value: 0.5 },
        // Invertierung der Depth Map (0 = normal, 1 = invertiert)
        uInvertDepth: { value: 0.0 },
      },
    })
  }
}

// Das Material für JSX verfügbar machen (als <fake3DMaterial />)
extend({ Fake3DMaterial })
