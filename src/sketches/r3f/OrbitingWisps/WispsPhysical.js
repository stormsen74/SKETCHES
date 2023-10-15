import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createNoise2D } from 'simplex-noise'
import { BufferGeometry, DoubleSide, Line, LineBasicMaterial, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { BallCollider, Physics, RigidBody } from '@react-three/rapier'
import Box from './Box.js'

// TODO make DebugLine as component (ts?)

// https://pmndrs.github.io/react-three-rapier/modules.html

const RADIUS = 5
const CAST_MESH_RADIUS = 1.5
const CAST_MESH_VISIBLE = false
const TARGET_VISIBLE = true
const DEBUG_LINE = false
const DELTA_T = 0.5
// const NOISE_SETTINGS = { delta: new Vector3(0.5, 0.5, 0.5), scale: new Vector3(0.5, 1, 0.5) }
const deltaNoise = new Vector3(0.5, 0.5, 0.5)
const noiseScale = new Vector3(0.5, 1, 0.5)

function Wisp({ id, hoverId, setHoverId, color, noise }) {
  const { camera } = useThree()
  const rigidBody = useRef()
  const collider = useRef()
  const target = useRef()
  const intersect = useRef()
  const castMesh = useRef()
  const t = useRef(id * 2) //id * 2
  const [locked, setLocked] = useState(false)
  const [inital, setInitial] = useState(true)
  const targetPosition = useMemo(() => {
    return new Vector3()
  }, [])
  const bodyPosition = useMemo(() => {
    return new Vector3()
  }, [])
  const line = useRef(
    new Line(
      new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, 0)]),
      new LineBasicMaterial({ color: '#ff680d' })
    )
  )

  const renderDebugLine = () => {
    line.current.geometry.attributes.position.needsUpdate = true
    const positions = line.current.geometry.getAttribute('position').array
    const vStart = intersect.current.position.clone()
    const vEnd = bodyPosition.clone()
    positions[0] = vStart.x
    positions[1] = vStart.y
    positions[2] = vStart.z
    positions[3] = vEnd.x
    positions[4] = vEnd.y
    positions[5] = vEnd.z
  }

  useFrame((state, delta) => {
    state.events.update() //continuous raycasting

    t.current += locked ? 0 : DELTA_T * delta

    targetPosition.x = RADIUS * Math.sin(t.current)
    targetPosition.z = RADIUS * Math.cos(t.current)
    targetPosition.x += noise(t.current * deltaNoise.x, id) * noiseScale.x
    targetPosition.z += noise(t.current * deltaNoise.z, id) * noiseScale.z
    targetPosition.y = noise(t.current * deltaNoise.y, id) * noiseScale.y
    target.current.position.copy(targetPosition)

    const translation = rigidBody.current?.translation()
    if (!translation) return
    bodyPosition.set(translation.x, translation.y, translation.z)
    castMesh.current.position.copy(bodyPosition)
    castMesh.current.quaternion.copy(camera.quaternion)
    const posTarget = target.current.position.clone()
    const posIntersect = intersect.current.position.clone()

    // if (locked) {
    //   collider.current.setDensity(0.2)
    // } else {
    //   collider.current.setDensity(0.25)
    // }

    const dir = locked ? posIntersect.sub(bodyPosition) : posTarget.sub(bodyPosition)
    dir.normalize().multiplyScalar(!locked ? 0.01 : 0.05)
    rigidBody.current.applyImpulseAtPoint(dir, bodyPosition, true)

    renderDebugLine()

    // initial rBody position!
    if (inital && rigidBody.current && collider.current) {
      setInitial(false)
      rigidBody.current?.setTranslation(targetPosition)
      collider.current?.setTranslation(targetPosition)
    }
  })

  const handlePointerOver = e => {
    e.stopPropagation()
    setHoverId(id)
    setLocked(true)
    intersect.current.position.copy(e.point)
  }

  const handlePointerMove = e => {
    intersect.current.position.copy(e.point)
  }

  const handlePointerLeave = e => {
    setLocked(false)
    setHoverId(0)
  }

  return (
    <>
      <mesh ref={target} visible={TARGET_VISIBLE}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={'#ff7200'} />
      </mesh>

      <mesh ref={intersect} visible={locked && DEBUG_LINE}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={'#9aff00'} />
      </mesh>
      {DEBUG_LINE && locked && <primitive object={line.current} />}

      <>
        <mesh
          visible={CAST_MESH_VISIBLE}
          scale={hoverId === id || hoverId === 0 ? [1, 1, 1] : [0, 0, 0]}
          ref={castMesh}
          onPointerOver={handlePointerOver}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <ringGeometry args={[0, CAST_MESH_RADIUS, 12, 1]} />
          <meshBasicMaterial
            transparent={true}
            color={locked ? '#e40d14' : '#04a6b5'}
            opacity={0.1}
            side={DoubleSide}
          />
        </mesh>
      </>

      <RigidBody
        ref={rigidBody}
        // colliders={'ball'}
        linearDamping={1}
        lockRotations={true}
        // position={[0, 3, 0]}
      >
        <BallCollider ref={collider} args={[0.5]} density={0.25} restitution={0.5} friction={0.1} />
        <mesh visible={true}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={locked ? '#68d41a' : color} />
          {/*<meshStandardMaterial color={color} />*/}
        </mesh>
      </RigidBody>
    </>
  )
}

export default function WispsPhysical() {
  const [hoverId, setHoverId] = useState(0)
  const [paused, setPaused] = useState(true)
  const noise = useMemo(() => {
    return createNoise2D()
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setPaused(false)
    }, 500)
  }, [])

  return (
    <>
      <Suspense>
        <Physics debug={false} colliders={false} gravity={[0, 0, 0]} paused={paused}>
          <Wisp id={1} hoverId={hoverId} setHoverId={setHoverId} color={'#b57104'} noise={noise} />
          <Wisp id={2} hoverId={hoverId} setHoverId={setHoverId} color={'#b50492'} noise={noise} />
          <Wisp id={3} hoverId={hoverId} setHoverId={setHoverId} color={'#59abb2'} noise={noise} />
          <Box />
        </Physics>
      </Suspense>
    </>
  )
}
