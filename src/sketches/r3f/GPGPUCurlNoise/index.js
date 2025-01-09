import { useControls } from 'leva'
import { Particles } from './Particles'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'

export default function GPGPUCurlNoise() {
  const props = useControls({
    focus: { value: 5.1, min: 3, max: 7, step: 0.01 },
    speed: { value: 100, min: 0.1, max: 100, step: 0.1 },
    aperture: { value: 1.8, min: 1, max: 5.6, step: 0.1 },
    fov: { value: 20, min: 0, max: 200 },
    curl: { value: 0.25, min: 0.01, max: 0.5, step: 0.01 },
  })

  // https://codesandbox.io/p/sandbox/basic-demo-forked-zgsyn?file=%2Fsrc%2FParticles.js

  return (
    <Canvas shadows camera={{ fov: 25, position: [0, 0, 6] }}>
      <CameraControls />
      <Particles {...props} />
    </Canvas>
  )
}
