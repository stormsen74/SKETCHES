import React, { useMemo, useRef, useState } from 'react'
import { createNoise2D } from 'simplex-noise'
import { MathUtils, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'

const RADIUS = 5

function Wisp({ noise, id, wispHovering, setWispHovering }) {
  const timestep = useRef(0.5)
  const target = useRef()
  const t = useRef(id * Math.random() * 3)
  const position = useMemo(() => {
    return new Vector3()
  }, [])
  const [hover, setHover] = useState(false)

  useFrame((state, delta) => {
    state.events.update() //continuous raycasting

    t.current += timestep.current * delta
    position.x = RADIUS * Math.sin(t.current)
    position.z = RADIUS * Math.cos(t.current)
    const offsetY = noise(t.current * 0.5, id) * 1.5
    position.y = offsetY

    target.current.position.copy(position)

    timestep.current = MathUtils.lerp(timestep.current, hover ? 0 : 0.5, delta * (hover ? 4 : 0.5))
  })

  const handleHover = () => {
    if (!wispHovering) {
      setHover(true)
      setWispHovering(true)
    }
  }

  const handleOut = () => {
    setHover(false)
    setWispHovering(false)
  }

  return (
    <>
      <mesh ref={target} onPointerOver={handleHover} onPointerOut={handleOut}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={hover ? '#ff0000' : '#1500ff'} />
      </mesh>
    </>
  )
}

export default function WispsBasic() {
  const noise = useMemo(() => {
    return createNoise2D()
  }, [])

  const [wispHovering, setWispHovering] = useState(false)

  return (
    <>
      <Wisp noise={noise} id={1} wispHovering={wispHovering} setWispHovering={setWispHovering} />
      <Wisp noise={noise} id={2} wispHovering={wispHovering} setWispHovering={setWispHovering} />
    </>
  )
}
