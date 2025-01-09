import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CameraControls } from '@react-three/drei'

function TornadoParticles() {
  const particlesRef = useRef()
  const particleCount = 5000
  const positions = new Float32Array(particleCount * 3)

  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      const height = Math.random() * 15
      const radius = Math.pow(height / 15, 1.5) * 5 * Math.random()
      const angle = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const positions = particlesRef.current.geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      const height = positions[idx + 1]
      const angleSpeed = 0.01 + (height / 150) * 0.1

      const angle = Math.atan2(positions[idx + 2], positions[idx]) + angleSpeed
      const radius = Math.pow(height / 15, 1.5) * 5

      positions[idx] = Math.cos(angle) * radius * (0.5 + Math.random() * 0.5)
      positions[idx + 2] = Math.sin(angle) * radius * (0.5 + Math.random() * 0.5)
      positions[idx + 1] = (height + 0.03) % 15
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial color='lightblue' size={0.02} />
    </points>
  )
}

export default function TornadoSketch() {
  return (
    <Canvas camera={{ position: [0, 7, 20], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <TornadoParticles />
      <CameraControls />
    </Canvas>
  )
}
