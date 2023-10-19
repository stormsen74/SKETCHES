import React, { useEffect, useMemo, useRef } from 'react'
import { RigidBody } from '@react-three/rapier'

const rnd = (min, max) => {
  return Math.floor(Math.random() * max) + min
}

const size = 0.25

export default function Box() {
  const box = useRef()
  const position = useMemo(() => {
    return [0, 0, 0]
  }, [])

  useEffect(() => {
    setTimeout(() => {
      box.current?.applyTorqueImpulse({ x: -0.01, y: 0.02, z: -0.03 }, true)
      box.current?.applyImpulse({ x: 0.075, y: -0.075, z: 0 }, true)
    }, 1000)
  }, [])

  return (
    <RigidBody
      colliders={'cuboid'}
      ref={box}
      restitution={0.5}
      linearDamping={1}
      angularDamping={1}
      density={1}
      mass={1}
      position={position}
    >
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={'#233155'} roughness={0.2} metallness={1} />
      </mesh>
    </RigidBody>
  )
}
