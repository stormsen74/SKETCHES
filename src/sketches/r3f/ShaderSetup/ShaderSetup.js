import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'
import { DoubleSide, Vector2 } from 'three'
import { useControls } from 'leva'

function Plane() {
  const plane = useRef()

  const uniforms = useMemo(
    () => ({
      u_progress: { value: 0.0 },
    }),
    []
  )

  const { progress } = useControls({
    wireframe: true,
    progress: { value: 0, min: 0, max: 1, step: 0.001 },
  })

  useFrame((state, delta) => {
    uniforms.u_progress.value = progress
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
        <axesHelper args={[1]} />
      </mesh>
    </>
  )
}
export default function ShaderSetup() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 15] }}>
      <CameraControls />
      <axesHelper args={[1]} />
      <Plane />
    </Canvas>
  )
}
