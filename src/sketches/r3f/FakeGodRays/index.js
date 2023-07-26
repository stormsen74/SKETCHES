import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import MeshBasedFresnel from './MeshBasedFresnel.js'
import MeshBasedGlow from './MeshBasedGlow.js'

// https://github.com/nemutas/r3f-fake-godrays/tree/main
// https://www.youtube.com/watch?v=e2fzXvbbZVY

export default function FakeGodRays() {
  return (
    <Canvas camera={{ fov: 35, position: [-10, 25, 40] }}>
      <CameraControls />

      {/*<MeshBasedFresnel />*/}
      <MeshBasedGlow />
      {/*<FakeRays />*/}
      {/*<BillboardBlades />*/}

      <gridHelper />
    </Canvas>
  )
}
