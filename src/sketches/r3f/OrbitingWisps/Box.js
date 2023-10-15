import React, { useEffect, useMemo, useRef } from 'react'
import { RigidBody } from '@react-three/rapier'

const rnd = (min, max) => {
  return Math.floor(Math.random() * max) + min
}

const size = 0.5

export default function Box() {
  const box = useRef()
  const position = useMemo(() => {
    return [0, 0, 0]
  }, [])

  useEffect(() => {
    setTimeout(() => {
      box.current?.applyTorqueImpulse({ x: 0.1, y: 0.1, z: 0.1 }, true)
    }, 1000)
  }, [])

  return (
    <RigidBody
      colliders={'cuboid'}
      ref={box}
      restitution={0.5}
      linearDamping={5}
      angularDamping={5}
      density={1}
      position={position}
    >
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshNormalMaterial />
      </mesh>
    </RigidBody>
  )
}
