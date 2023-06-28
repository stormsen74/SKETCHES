import React from 'react'
import { Canvas } from '@react-three/fiber'
import { BufferAttribute, Vector3 } from 'three'
import { OrbitControls, Sampler, ComputedAttribute } from '@react-three/drei'

export default function DreiSampler() {
  function remap(x, [low1, high1], [low2, high2]) {
    return low2 + ((x - low1) * (high2 - low2)) / (high1 - low1)
  }

  const transformInstances = ({ dummy, position }) => {
    dummy.position.copy(position)
    dummy.scale.setScalar(Math.random() * 0.75)
  }

  const computeUpness = geometry => {
    const { array, count } = geometry.attributes.normal
    const arr = Float32Array.from({ length: count })

    const normalVector = new Vector3()
    const up = new Vector3(0, 1, 0)

    for (let i = 0; i < count; i++) {
      const n = array.slice(i * 3, i * 3 + 3)
      normalVector.set(n[0], n[1], n[2])

      const dot = normalVector.dot(up)
      const value = dot > 0.4 ? remap(dot, [0.4, 1], [0, 1]) : 0
      arr[i] = Number(value)
    }

    return new BufferAttribute(arr, 1)
  }

  return (
    <Canvas shadows camera={{ fov: 70, position: [0, 0, 10] }}>
      <OrbitControls />

      <Sampler count={500} weight='upness' transform={transformInstances}>
        <mesh>
          <torusKnotGeometry>
            <ComputedAttribute name='upness' compute={computeUpness} />
          </torusKnotGeometry>
          <meshNormalMaterial />
        </mesh>
        <instancedMesh args={[null, null, 1000]}>
          <sphereGeometry args={[0.1, 32, 32, Math.PI / 2]} />
          <meshNormalMaterial />
        </instancedMesh>
      </Sampler>
    </Canvas>
  )
}
