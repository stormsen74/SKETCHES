import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, useTexture } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { BufferAttribute } from 'three'
import tex_src from './assets/tex.png'
import { createNoise2D } from 'simplex-noise'
import { Perf } from 'r3f-perf'

function BufferPoints({ count = 0 }) {
  const pointsRef = useRef()
  const t = useRef(0)
  const texture = useTexture(tex_src)
  const noise = useMemo(() => {
    return createNoise2D()
  }, [])
  const points = useMemo(() => {
    const a = new Array(count * 3).fill(0).map(v => 0)
    return new BufferAttribute(new Float32Array(a), 3)
  }, [count])
  const origins = useMemo(() => {
    const a = new Array(count).fill(0).map(() => {
      const x = Math.random() * 50 - 25
      const y = Math.random() * 50 - 25
      const z = Math.random() * 50 - 25
      return [x, y, z]
    })
    return new BufferAttribute(new Float32Array(a.flat(1)), 3)
  }, [count])

  useFrame((_, delta) => {
    t.current += delta * 0.1

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const offsetX = noise(t.current, i + 0) * 5
      const offsetY = noise(t.current, i + 1) * 5
      const offsetZ = noise(t.current, i + 2) * 5

      pointsRef.current.geometry.attributes.position.array[i3 + 0] =
        pointsRef.current.geometry.attributes.origin.array[i3 + 0] + offsetX
      pointsRef.current.geometry.attributes.position.array[i3 + 1] =
        pointsRef.current.geometry.attributes.origin.array[i3 + 1] + offsetY
      pointsRef.current.geometry.attributes.position.array[i3 + 2] =
        pointsRef.current.geometry.attributes.origin.array[i3 + 2] + offsetZ
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach={'attributes-position'} {...points} />
        <bufferAttribute attach={'attributes-origin'} {...origins} />
      </bufferGeometry>
      <pointsMaterial size={1} map={null} sizeAttenuation={true} transparent={true} depthTest={false} />
    </points>
  )
}

export default function DustParticles() {
  return (
    <Canvas camera={{ fov: 35, position: [-10, 25, 40] }}>
      <Perf position='top-left' />
      <CameraControls />
      <BufferPoints count={100} />
      <gridHelper />
      <gridHelper rotation-x={Math.PI / 2} />
    </Canvas>
  )
}
