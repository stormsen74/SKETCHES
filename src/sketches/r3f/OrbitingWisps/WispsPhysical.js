import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createNoise2D } from 'simplex-noise'
import { BufferGeometry, DoubleSide, Line, LineBasicMaterial, MathUtils, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { BallCollider, Physics, RigidBody } from '@react-three/rapier'
import Box from './Box.js'
import { Html } from '@react-three/drei'
import styled from 'styled-components'

const Label = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 12px;
  color: #000000;
  text-align: center;
  background-color: rgba(91, 91, 91, 0.45);
  backdrop-filter: blur(5px);
  border: 1px solid #1c80a4;
  padding: 10px;
  min-width: 100px;
  border-radius: 5px;
  transform-origin: center center;

  opacity: ${props => (props.visible ? 1 : 0)};
  scale: ${props => (props.visible ? 1 : 0)};
  transition: all ${props => (props.visible ? 0.5 : 0.25)}s ease-in-out;
`

// TODO make DebugLine as component (ts?)

// https://pmndrs.github.io/react-three-rapier/modules.html

const RADIUS = 5
const CAST_MESH_RADIUS = 1.5
const CAST_MESH_VISIBLE = true
const TARGET_VISIBLE = true
const DEBUG_LINE = true
const DELTA_T = 0.5
const NOISE = { delta: new Vector3(0.5, 0.5, 0.5), scale: new Vector3(0.5, 1, 0.5) }

function Wisp({ id, hoverId, setHoverId, color, noise }) {
  const { camera } = useThree()
  const rigidBody = useRef()
  const collider = useRef()
  const target = useRef()
  const intersect = useRef()
  const castMesh = useRef()
  const label = useRef()
  const step = (Math.PI * 2) / 4
  const t = useRef(id * step)
  const linearDamp = useRef(0)
  const [locked, setLocked] = useState(false)
  const [inital, setInitial] = useState(true)
  const [dynamic, setDynamic] = useState(false)
  const targetPosition = useMemo(() => {
    return new Vector3()
  }, [])
  const bodyPosition = useMemo(() => {
    return new Vector3()
  }, [])
  const labelPosition = useMemo(() => {
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

    // t.current += locked ? 0 : DELTA_T * delta
    t.current += DELTA_T * delta

    targetPosition.x = RADIUS * Math.sin(t.current)
    targetPosition.z = RADIUS * Math.cos(t.current)
    targetPosition.x += noise(t.current * NOISE.delta.x, id) * NOISE.scale.x
    targetPosition.z += noise(t.current * NOISE.delta.z, id) * NOISE.scale.z
    targetPosition.y = noise(t.current * NOISE.delta.y, id) * NOISE.scale.y
    target.current.position.copy(targetPosition)

    const translation = rigidBody.current?.translation()
    if (!translation) return
    bodyPosition.set(translation.x, translation.y, translation.z)
    castMesh.current.position.copy(bodyPosition)
    castMesh.current.quaternion.copy(camera.quaternion)
    const posTarget = target.current.position.clone()
    const posIntersect = intersect.current.position.clone()

    if (locked) {
      // collider.current.setDensity(!locked ? 0.25 : 1)
      const dist = bodyPosition.clone().distanceTo(intersect.current.position)
      linearDamp.current = MathUtils.lerp(linearDamp.current, dist < 0.025 ? 100 : 2, delta * 10)
      // rigidBody.current?.setLinearDamping(dist < 0.05 ? 100 : 3)
      // if (dist < 0.05) rigidBody.current?.setLinearDamping(100)
      rigidBody.current?.setLinearDamping(linearDamp.current)
    } else {
      rigidBody.current?.setLinearDamping(1)
      // linearDamp.current = MathUtils.lerp(linearDamp.current, 1, delta)
    }

    const dir = locked ? posIntersect.sub(bodyPosition) : posTarget.sub(bodyPosition)
    dir.normalize().multiplyScalar(!locked ? 0.01 : 0.035)
    rigidBody.current.applyImpulseAtPoint(dir, bodyPosition, true)

    renderDebugLine()

    if (locked) {
      labelPosition.lerp(bodyPosition.clone().add(new Vector3(0, 1, 0)), delta * 5)
    } else {
      labelPosition.lerp(bodyPosition.clone().add(new Vector3(0, 2, 0)), delta * 5)
    }
    label.current.position.copy(labelPosition)

    // initial rigidBody position!
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
    // labelPosition.copy(bodyPosition.clone().add(new Vector3(0, 5, 0)))
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
          onPointerDown={() => {
            setDynamic(!dynamic)
          }}
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

      <group ref={label}>
        <Html
          zIndexRange={[100, 0]}
          transform={false}
          sprite={true}
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
          center={true}
        >
          <Label visible={locked}>{'id: ' + id}</Label>
        </Html>
      </group>

      <RigidBody
        ref={rigidBody}
        type={dynamic ? 'dynamic' : 'kinematicPosition'}
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
        <Physics debug={false} colliders={false} gravity={[0, 1, 0]} paused={paused}>
          <Wisp id={1} hoverId={hoverId} setHoverId={setHoverId} color={'#b57104'} noise={noise} />
          <Wisp id={2} hoverId={hoverId} setHoverId={setHoverId} color={'#b50492'} noise={noise} />
          <Wisp id={3} hoverId={hoverId} setHoverId={setHoverId} color={'#59abb2'} noise={noise} />
          <Wisp id={4} hoverId={hoverId} setHoverId={setHoverId} color={'#b29159'} noise={noise} />
          {/*<Box />*/}
        </Physics>
      </Suspense>
    </>
  )
}
