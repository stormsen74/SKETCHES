import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Environment } from '@react-three/drei'
import React, { useMemo, useRef, useState, Suspense } from 'react'
import { BufferGeometry, LineBasicMaterial, MathUtils, Vector3, Line, DoubleSide } from 'three'
import { createNoise2D } from 'simplex-noise'
import { Physics, RigidBody } from '@react-three/rapier'
import WispsBasic from './WispsBasic'
import WispsPhysical from './WispsPhysical'
import { Perf } from 'r3f-perf'

export default function OrbitingWisps() {
  return (
    <Canvas camera={{ fov: 35, position: [15, 5, -15] }}>
      <CameraControls />
      <Environment preset={'sunset'} background={true} backgroundBlurriness={0.3} />
      <axesHelper args={[1]} />
      <gridHelper args={[10, 10]} />
      {/*<WispsBasic />*/}
      <WispsPhysical />
      <Perf position='bottom-right' />
    </Canvas>
  )
}
