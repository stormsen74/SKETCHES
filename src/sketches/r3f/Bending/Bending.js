import { DoubleSide, PlaneGeometry, TextureLoader, Vector2 } from 'three'
import React, { useMemo, useRef } from 'react'
import vertexShader from './glsl/bendVert.glsl'
import fragmentShader from './glsl/bendFrag.glsl'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import uvtex from './assets/texture_1k.jpg'
import { CameraControls, Environment, Wireframe } from '@react-three/drei'

// https://github.com/wholcman/bend-modifier-3d/blob/gh-pages/index.html

export default function Bending() {
  function Plane() {
    const plane = useRef()

    const [texture] = useLoader(TextureLoader, [uvtex])

    const uniforms = useMemo(
      () => ({
        u_map: { value: texture },
        u_time: { value: 0.0 },
        bounds: { value: new Vector2(-4, 4) },
        bendOffset: { value: 1 },
        bendAngle: { value: 0 },
        bendAxisAngle: { value: 0 },

        // wave 1
        u_noise_f1: { value: 3.0 },
        u_noise_amp1: { value: 0.2 },
        u_m1: { value: 1.0 },
        // wave 2
        u_noise_f2: { value: 0 },
        u_noise_amp2: { value: 0 },
        u_m2: { value: 0 },
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
        //noise simple
        u_noise_f1: { value: 0.2, min: 0, max: 5, step: 0.01 },
        u_noise_amp1: { value: 0.25, min: 0, max: 2, step: 0.01 },
        u_m1: { value: 0.35, min: 0, max: 3, step: 0.01 },
      }
    )

    useFrame((state, delta) => {
      uniforms.u_time.value = state.clock.getElapsedTime() * 0.5
      uniforms.bendAngle.value = bendAngle
      uniforms.bendOffset.value = bendOffset
      uniforms.bendAxisAngle.value = bendAxisAngle

      uniforms.u_noise_f1.value = u_noise_f1
      uniforms.u_noise_amp1.value = u_noise_amp1
      uniforms.u_m1.value = u_m1
    })

    return (
      <>
        <mesh ref={plane} position={[0, 0, 0]}>
          <planeGeometry args={[5, 5, resolution, resolution]} />
          <shaderMaterial
            uniforms={uniforms}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            transparent={true}
            depthWrite={true}
            depthTest={true}
            side={DoubleSide}
            wireframe={wireframe}
          />
          <axesHelper args={[1]} />
        </mesh>
      </>
    )
  }

  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 15] }}>
      <CameraControls />
      <axesHelper args={[1]} />
      <Plane />
    </Canvas>
  )
}
