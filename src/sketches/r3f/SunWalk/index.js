import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import React from 'react'
import ObjectAlongCurve from './ObjectAlongCurve'

export default function SunWalk() {
  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 5, 50] }}>
      <color attach='background' args={['#b9cad8']} />
      <CameraControls />

      <ObjectAlongCurve />

      <gridHelper />
    </Canvas>
  )
}
