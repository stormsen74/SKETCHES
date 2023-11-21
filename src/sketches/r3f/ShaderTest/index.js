import { DoubleSide, PlaneGeometry, TextureLoader, Vector2 } from 'three'
import React, { useMemo, useRef } from 'react'
import vertexShader from './glsl/bloomVert.glsl'
import fragmentShader from './glsl/bloomFrag.glsl'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
// import uvtex from './assets/texture_1k.jpg'
import { CameraControls, Environment, Wireframe } from '@react-three/drei'

// https://github.com/kiwipxl/GLSL-shaders/blob/e0c52cde54e5f8412b443eca4b1df597dca8d5a4/bloom.glsl
// https://kadekeith.me/2017/09/12/three-glow.html

export default function ShaderTest() {
  function Sphere() {
    const sphere = useRef()

    // const [texture] = useLoader(TextureLoader, [uvtex])

    const uniforms = useMemo(
      () => ({
        // u_map: { value: texture },
        u_time: { value: 0.0 },
        bounds: { value: new Vector2(-4, 4) },
        bendOffset: { value: 1 },
        bendAngle: { value: 0 },
        bendAxisAngle: { value: 0 },
      }),
      []
    )

    const { wireframe, resolution, bendAngle, bendOffset, bendAxisAngle, u_noise_f1, u_noise_amp1, u_m1 } = useControls(
      {
        wireframe: true,
        resolution: { value: 10, min: 1, max: 100, step: 1 },
        bendAngle: { value: 0, min: -2 * Math.PI, max: 2 * Math.PI, step: 0.01 },
        bendOffset: { value: 1, min: 0, max: 1, step: 0.01 },
        bendAxisAngle: { value: 0, min: -Math.PI / 2, max: Math.PI / 2, step: 0.01 },
      }
    )

    useFrame((state, delta) => {
      uniforms.u_time.value = state.clock.getElapsedTime() * 0.5
      uniforms.bendAngle.value = bendAngle
      uniforms.bendOffset.value = bendOffset
      uniforms.bendAxisAngle.value = bendAxisAngle
    })

    return (
      <>
        <mesh ref={sphere} position={[0, 0, 0]}>
          <sphereGeometry args={[5, 10, 10]} />
          {/*<shaderMaterial*/}
          {/*  uniforms={uniforms}*/}
          {/*  fragmentShader={fragmentShader}*/}
          {/*  vertexShader={vertexShader}*/}
          {/*  transparent={true}*/}
          {/*  depthWrite={true}*/}
          {/*  depthTest={true}*/}
          {/*  side={DoubleSide}*/}
          {/*  wireframe={wireframe}*/}
          {/*/>*/}
          <meshNormalMaterial />
          <axesHelper args={[1]} />
        </mesh>
      </>
    )
  }

  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 15] }}>
      <CameraControls />
      <axesHelper args={[1]} />
      <Sphere />
    </Canvas>
  )
}
