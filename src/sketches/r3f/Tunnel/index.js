import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, Environment, Line } from '@react-three/drei'
import React, { useEffect, useRef, useState } from 'react'
import { mapLinear } from 'three/src/math/MathUtils.js'
import { useScrollStore } from '@src/sketches/r3f/Tunnel/useScrollStore.js'
import useScrollHandler from '@src/sketches/r3f/Tunnel/useScrollHandler.js'
import TunnelParticles from '@src/sketches/r3f/Tunnel/TunnelParticles.js'
import Index from '@src/sketches/r3f/Tunnel/WarpVideoPlane/index.js'
import { useControls } from 'leva'
import { Euler } from 'three'
import WarpVideoPlane from '@src/sketches/r3f/Tunnel/WarpVideoPlane/index.js'

const initialSize = 7
const xScaleFactor = 2
const lineOpacity = 0.8
const lineWidth = 1
const quadPoints = [
  [-initialSize, initialSize, 0],
  [initialSize, initialSize, 0],
  [initialSize, -initialSize, 0],
  [-initialSize, -initialSize, 0],
  [-initialSize, initialSize, 0],
]
function InitialQuad() {
  return (
    <Line
      position={[0, 0, 0]}
      points={quadPoints}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )
}

function PerspectiveLines({ numLines }) {
  const lines = []

  // Calculate the step size for the lines
  const step = (initialSize * 2) / (numLines + 1)

  // vertical lines in between the perspective lines
  for (let i = -initialSize + step; i < initialSize; i += step) {
    lines.push(
      <Line
        key={`line-left-${i}`}
        points={[
          [-initialSize, i, 0],
          [-initialSize * xScaleFactor, i, 90],
        ]}
        color='white'
        transparent={true}
        depthTest={false}
        opacity={lineOpacity}
        lineWidth={lineWidth}
      />
    )
    lines.push(
      <Line
        key={`line-right-${i}`}
        points={[
          [initialSize, i, 0],
          [initialSize * xScaleFactor, i, 90],
        ]}
        color='white'
        transparent={true}
        depthTest={false}
        opacity={lineOpacity}
        lineWidth={lineWidth}
      />
    )
  }

  // horizontal lines in between the perspective lines
  for (let i = -initialSize + step; i < initialSize; i += step) {
    lines.push(
      <Line
        key={`line-top-${i}`}
        points={[
          [i, initialSize, 0],
          [i * xScaleFactor, initialSize, 90],
        ]}
        color='white'
        transparent={true}
        depthTest={false}
        opacity={lineOpacity}
        lineWidth={lineWidth}
      />
    )
    lines.push(
      <Line
        key={`line-bottom-${i}`}
        points={[
          [i, -initialSize, 0],
          [i * xScaleFactor, -initialSize, 90],
        ]}
        color='white'
        transparent={true}
        depthTest={false}
        opacity={lineOpacity}
        lineWidth={lineWidth}
      />
    )
  }

  // outer perspective lines
  lines.push(
    <Line
      key='line-top-left'
      points={[
        [-initialSize, initialSize, 0],
        [-initialSize * xScaleFactor, initialSize, 90],
      ]}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )
  lines.push(
    <Line
      key='line-top-right'
      points={[
        [initialSize, initialSize, 0],
        [initialSize * xScaleFactor, initialSize, 90],
      ]}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )
  lines.push(
    <Line
      key='line-bottom-right'
      points={[
        [initialSize, -initialSize, 0],
        [initialSize * xScaleFactor, -initialSize, 90],
      ]}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )
  lines.push(
    <Line
      key='line-bottom-left'
      points={[
        [-initialSize, -initialSize, 0],
        [-initialSize * xScaleFactor, -initialSize, 90],
      ]}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )

  return <>{lines}</>
}

function LineQuad({ index, repetitions = 3 }) {
  const lineRef = useRef()
  const distanceBetweenLines = 10 // Distance between each line
  const maxDistance = 90 * repetitions // Total distance covered based on repetitions

  useEffect(() => {
    // Set the initial Z position based on the index
    lineRef.current.position.z = index * distanceBetweenLines
  }, [index])

  useFrame(() => {
    const progress = useScrollStore.getState().progress // Get normalized scroll progress (0 to 1)

    // Calculate the new Z position based on progress
    const totalDistance = maxDistance * progress // Total distance for the current progress
    lineRef.current.position.z = (index * distanceBetweenLines + totalDistance) % 90 // Loop within 0-90

    // Loop the line back to start after reaching the end
    if (lineRef.current.position.z > 90) {
      lineRef.current.position.z -= 90 // Reset position to create loop effect
    }

    // Adjust scale dynamically based on position to create a perspective effect
    const scaleX = mapLinear(lineRef.current.position.z, 0, 90, 1, xScaleFactor)
    lineRef.current.scale.x = scaleX
  })

  return (
    <Line
      ref={lineRef}
      points={quadPoints}
      color='white'
      transparent={true}
      depthTest={false}
      opacity={lineOpacity}
      lineWidth={lineWidth}
    />
  )
}

function Lines() {
  const quadLines = Array.from({ length: 9 }).map((_, i) => <LineQuad key={i} index={i} />)

  return (
    <>
      <InitialQuad />
      <group>
        <PerspectiveLines numLines={5} />
      </group>
      {quadLines}
    </>
  )
}

function Cube() {
  const { showCube } = useControls({
    showCube: false,
  })

  return (
    showCube && (
      <mesh rotation={[0.4, 0.3, 0.2]} position={[0, 0, 90]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial color='red' depthTest={true} />
      </mesh>
    )
  )
}

export default function Tunnel() {
  const { start, pause } = useScrollHandler()

  useEffect(() => {
    start()
  }, [])

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 100] }}>
      <color attach='background' args={['#13d41f']} />

      <Lines />
      <TunnelParticles />

      <WarpVideoPlane />
      <Cube />

      <Environment
        preset={'forest'}
        background={true}
        backgroundBlurriness={0.1}
        backgroundRotation={new Euler(0, 0, 0, 'XYZ')}
        backgroundIntensity={0.1}
      />

      {/*<CameraControls />*/}

      {/*<gridHelper />*/}
    </Canvas>
  )
}
