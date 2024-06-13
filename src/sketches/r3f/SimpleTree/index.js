import { useControls } from 'leva'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { CameraControls, SoftShadows } from '@react-three/drei'

function Branch({ depth, length, angle, maxDepth }) {
  const nextLength = length * 0.7 // Jeder Ast ist 70% der Länge des vorherigen
  const ref = useRef()

  useFrame(({ clock }) => {
    const a = Math.sin(clock.getElapsedTime()) * 10
    if (!ref.current) return
    ref.current.rotation.z = a * (Math.PI / 180)
    ref.current.rotation.y = a * 2 * (Math.PI / 180)
    // ref.current.rotation.x = a * (Math.PI / 180)
  })

  if (depth >= maxDepth) {
    return null
  }

  return (
    <group ref={ref}>
      <mesh position={[0, length / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.1, 0.1, length, 8]} />
        <meshStandardMaterial color='#208319' />
      </mesh>
      <group position={[0, length, 0]} rotation={[0, 0, angle]}>
        <Branch depth={depth + 1} length={nextLength} angle={0.5 + Math.random() * 0.5} maxDepth={maxDepth} />
        <Branch depth={depth + 1} length={nextLength} angle={-0.5 - Math.random() * 0.5} maxDepth={maxDepth} />
      </group>
    </group>
  )
}

export default function SimpleTree() {
  const { depth } = useControls({
    depth: { value: 5, min: 1, max: 10, step: 1 },
  })

  const { enabled, ...config } = useControls({
    enabled: true,
    size: { value: 20, min: 0, max: 100 },
    focus: { value: 0.3, min: 0, max: 2 },
    samples: { value: 20, min: 1, max: 20, step: 1 },
  })

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 10, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[2.5, 8, 5]} intensity={1.5} shadow-mapSize={1024}>
        <orthographicCamera attach='shadow-camera' args={[-10, 10, -10, 10, 0.1, 50]} />
      </directionalLight>
      {enabled && <SoftShadows {...config} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.6} />
      </mesh>
      <Branch depth={0} length={2} angle={0} maxDepth={depth} />
      <CameraControls />
    </Canvas>
  )
}
