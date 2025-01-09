import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'
import { DoubleSide, Vector2, Color } from 'three'
import { useControls } from 'leva'

function Plane() {
  const plane = useRef()

  const uniforms = useMemo(
    () => ({
      u_progress: { value: 0.0 },
      resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
      time: { value: 0.0 },
      frequency: { value: 2.5 },
      amplitude: { value: 2.0 },
      octaveMix: { value: 0.35 },
      speed: { value: 0.05 },
      octaves: { value: 3 },
      baseColor: { value: new Color('#ffffff') },
      highlightColor: { value: new Color('#ff0000') },
      colorFrequency: { value: 1.0 },
      colorAmplitude: { value: 0.5 },
    }),
    []
  )

  const { freq, amp, octMix, speed, octaves, baseColor, highlightColor, colorFrequency, colorAmplitude } = useControls({
    freq: { value: 2.5, min: 0, max: 5, step: 0.1 },
    amp: { value: 2.0, min: 0, max: 5, step: 0.1 },
    octMix: { value: 0.35, min: 0, max: 1, step: 0.01 },
    speed: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
    octaves: { value: 6, min: 1, max: 8, step: 1 },
    baseColor: { value: '#181290' },
    highlightColor: { value: '#ffc900' },
    colorFrequency: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
    colorAmplitude: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
  })

  useFrame((state, delta) => {
    uniforms.time.value += delta
    uniforms.frequency.value = freq
    uniforms.amplitude.value = amp
    uniforms.octaveMix.value = octMix
    uniforms.speed.value = speed
    uniforms.octaves.value = octaves
    uniforms.baseColor.value.set(baseColor)
    uniforms.highlightColor.value.set(highlightColor)
    uniforms.colorFrequency.value = colorFrequency
    uniforms.colorAmplitude.value = colorAmplitude
  })

  return (
    <>
      <mesh ref={plane} position={[0, 0, 0]}>
        <planeGeometry args={[8, 4.5, 1, 1]} />
        <shaderMaterial
          uniforms={uniforms}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          transparent={true}
          depthWrite={true}
          depthTest={true}
          side={DoubleSide}
        />
      </mesh>
    </>
  )
}
export default function PerlinFlow() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 15] }}>
      <CameraControls />
      <Plane />
    </Canvas>
  )
}
