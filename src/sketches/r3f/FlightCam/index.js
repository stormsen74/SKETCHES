import { Environment, useGLTF } from '@react-three/drei'
import { AnimationMixer, Euler, LoopOnce, LoopRepeat } from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'

import flightCamera from './assets/bunny-flight-cam.glb'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useControls } from 'leva'
import useScrollHandler from '@src/sketches/r3f/FlightCam/useScrollHandler.js'
import { useScrollStore } from '@src/sketches/r3f/FlightCam/useScrollStore.js'
function Cam() {
  const { camera } = useThree()
  const gltf = useLoader(GLTFLoader, flightCamera)
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene])
  const animationClip = useMemo(() => gltf.animations[0], gltf.animations)
  const { duration } = animationClip

  useEffect(() => {
    const action = mixer.clipAction(animationClip)
    action.setLoop(LoopRepeat)
    action.play()
  }, [gltf.animations, gltf.cameras, gltf.scene, mixer, camera])

  const updateCloneCam = dt => {
    const camPos = gltf.cameras[0].position
    camera.position.copy(camPos)

    const newQuaternion = gltf.cameras[0].quaternion
    camera.quaternion.copy(newQuaternion)
  }

  useFrame((_, delta) => {
    const progress = useScrollStore.getState().progress // Get normalized scroll progress (0 to 1)

    mixer.setTime(progress * duration)
    updateCloneCam(delta)

    // camera.updateProjectionMatrix()
  })

  return null
}

function Cube() {
  const { showCube } = useControls({
    showCube: true,
  })

  return (
    showCube && (
      <mesh rotation={[0, 0, 0]} position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial depthTest={true} />
      </mesh>
    )
  )
}

export default function FlightCam() {
  const { start, pause } = useScrollHandler()

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 0] }}>
      <color attach='background' args={['#13d41f']} />

      <Cam />
      <Cube />

      <Environment
        preset={'forest'}
        background={true}
        backgroundBlurriness={0.5}
        backgroundRotation={new Euler(0.9, 0, 0, 'XYZ')}
        backgroundIntensity={0.1}
      />

      {/*<CameraControls />*/}

      <gridHelper />
    </Canvas>
  )
}
