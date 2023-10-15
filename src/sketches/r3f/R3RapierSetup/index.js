import { Physics, RigidBody } from '@react-three/rapier'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { Perf } from 'r3f-perf'

// https://github.com/abernier/_tpl-r3f/tree/main

const rnd = max => {
  return Math.random() * max
}

const Ico = () => {
  const ico = useRef(null)

  const position = useMemo(() => {
    return [-2.5 * rnd(5), 3 + rnd(1), -2.5 * rnd(5)]
  }, [])

  const onClick = () => {
    ico.current.applyImpulse({ x: 0.0, y: 10.0, z: 0.0 }, true)
    ico.current.applyTorqueImpulse({ x: rnd(3), y: rnd(3), z: rnd(3) }, true)
  }

  return (
    <>
      <RigidBody
        colliders={'hull'}
        position={position}
        canSleep={true}
        ccd={true}
        restitution={1}
        ref={ico}
        onCollisionEnter={({ manifold }) => {
          // console.log('Collision at world position ', manifold.solverContactPoint(0))
        }}
      >
        <mesh castShadow onClick={onClick}>
          <icosahedronGeometry args={[1, 0]} />
          <meshNormalMaterial />
        </mesh>
      </RigidBody>
    </>
  )
}

const Cube = () => {
  const cubeRef = useRef(null)

  const position = useMemo(() => {
    return [-2.5 * rnd(5), 2 + rnd(1), -2.5 * rnd(5)]
  }, [])

  const onClick = () => {
    cubeRef.current.applyImpulse({ x: 0.0, y: 3.0, z: 0.0 }, true)
    cubeRef.current.applyTorqueImpulse({ x: 0.3, y: 0.3, z: 0.3 }, true)
  }

  return (
    <>
      <RigidBody
        colliders={'hull'}
        position={position}
        restitution={1}
        ref={cubeRef}
        type={'kinematicVelocity'}
        onCollisionEnter={({ manifold }) => {
          // console.log('Collision at world position ', manifold.solverContactPoint(0))
        }}
      >
        <mesh castShadow onClick={onClick}>
          <boxGeometry args={[1, 1, 1]} />
          <meshNormalMaterial />
        </mesh>
      </RigidBody>
    </>
  )
}

export default function R3RapierSetup() {
  const icos = useMemo(() => {
    return new Array(10).fill({})
  }, [])

  return (
    <Canvas shadows camera={{ fov: 70, position: [0, 0, 10] }}>
      <Perf position='top-left' />
      <OrbitControls />

      <spotLight
        position={[0, 10, 0]}
        // angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.2} />

      <Physics debug>
        {icos.map((_, index) => {
          return <Ico key={index} />
        })}

        <Ico />
        <Cube />

        <Ico />
        <Cube />

        <Ico />
        <Cube />

        <RigidBody type='fixed' position-y={-0.1 / 2} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[100, 100, 0.1]} />
            <meshStandardMaterial color='gray' transparent opacity={0.8} />
          </mesh>
        </RigidBody>
      </Physics>
    </Canvas>
  )
}
