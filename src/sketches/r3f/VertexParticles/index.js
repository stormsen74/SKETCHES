import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { AdditiveBlending, MathUtils } from 'three'
import { Perf } from 'r3f-perf'
import vertexShader from './glsl/particlesVert.glsl'
import fragmentShader from './glsl/particlesFrag.glsl'
import { useControls } from 'leva'

// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

function Particles({ count = 0 }) {
  const points = useRef()
  const radius = 5
  const goldenRatio = 1.61803398875
  const fibonacciAngle = 137.5

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const distance = Math.sqrt(Math.random()) * radius
      const theta = MathUtils.randFloatSpread(360)
      const phi = MathUtils.randFloatSpread(360)

      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(theta) * Math.sin(phi) * 0.05
      const z = distance * Math.cos(theta)

      positions.set([x, y, z], i * 3)
    }

    return positions
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uRadius: {
        value: radius,
      },
      distanceExp: {
        value: 1.5,
      },
    }),
    []
  )

  const { c } = useControls({
    // glowColor: '#ffbb00',
    c: { value: 1.5, min: 0, max: 3, step: 0.01 },
  })

  useFrame((state, delta) => {
    const { clock } = state

    points.current.material.uniforms.uTime.value = clock.elapsedTime
    points.current.material.uniforms.distanceExp.value = c
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </points>
  )
}

export default function VertexParticles() {
  return (
    <Canvas camera={{ fov: 35, position: [-10, 15, 20] }}>
      <Perf position='top-left' />
      <CameraControls />
      <Particles count={4000} />
      <gridHelper args={[10, 10, '#000000']} />
    </Canvas>
  )
}
