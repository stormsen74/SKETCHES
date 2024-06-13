import { CameraControls, Environment, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useLayoutEffect, useRef, useEffect, useState, useMemo } from 'react'
import testscene from './testscene.glb'
import Light from '@src/sketches/r3f/ScrollCamSetup/Light.js'
import ScrollHandler from '@src/sketches/r3f/ScrollCamSetup/ScrollHandler.js'
import { useScrollCam } from '@src/sketches/r3f/ScrollCamSetup/useScrollCam.js'
import { MathUtils, Vector3, Quaternion } from 'three'
import { createNoise2D } from 'simplex-noise'

const p1 = new Vector3(-15, 1, 15)
const t1 = new Vector3(-15, 1, 0)

const p2 = new Vector3(0, 1, 15)
const t2 = new Vector3(0, 1, 0)

const X_AXIS = new Vector3(1, 0, 0)
const Y_AXIS = new Vector3(0, 1, 0)

function Scene() {
  const { scene, nodes } = useGLTF(testscene)
  const { camera, gl, mouse } = useThree()
  const sceneRef = useRef(null)
  const camControls = useRef(null)
  const [orbit, setOrbit] = useState(false)
  const noise = useMemo(() => {
    return createNoise2D()
  }, [])
  const cameraQuaternion = useRef(new Quaternion())
  const qx = useRef(new Quaternion())
  const qy = useRef(new Quaternion())
  const offsetX = useRef(0)
  const offsetY = useRef(0)
  const cameraLimit = useMemo(() => {
    return { vertical: 1 * MathUtils.DEG2RAD, horizontal: 1 * MathUtils.DEG2RAD }
  }, [])

  useEffect(() => {
    camControls.current.mouseButtons.left = orbit ? 1 : 0 // 1|0
    camControls.current.mouseButtons.middle = orbit ? 8 : 0
    camControls.current.mouseButtons.right = orbit ? 2 : 0
    camControls.current.mouseButtons.wheel = orbit ? 8 : 0
    camControls.current.touches.one = orbit ? 32 : 0
    camControls.current.touches.two = orbit ? 1024 : 0
    camControls.current.touches.three = orbit ? 64 : 0
  }, [orbit])

  useEffect(() => {
    scene.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    setTimeout(() => {
      sceneRef.current?.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    }, 1000)
  }, [])

  useEffect(() => {
    camControls.current.setLookAt(p1.x, p1.y, p1.z, t1.x, t1.y, t1.z, false)
  }, [])

  useFrame((state, delta) => {
    // lerp position|target

    const progress = useScrollCam.getState().progress
    const vResPosition = new Vector3().lerpVectors(p1, p2, progress)
    const vResTarget = new Vector3().lerpVectors(t1, t2, progress)

    camControls.current?.setLookAt(
      vResPosition.x,
      vResPosition.y,
      vResPosition.z,
      vResTarget.x,
      vResTarget.y,
      vResTarget.z,
      false
    )

    // additional movement

    const dt = MathUtils.clamp(delta, Number.EPSILON, 0.0333)
    const noiseX = noise(state.clock.getElapsedTime() * 0.1, 0) * 0.18 //.15
    const noiseY = noise(state.clock.getElapsedTime() * 0.1, 0.25) * 0.43 //.35

    const q = cameraQuaternion.current
    camera.quaternion.set(q.x, q.y, q.z, q.w)
    offsetX.current = MathUtils.lerp(offsetX.current, (-mouse.x + noiseX) * cameraLimit.horizontal, dt * 6)
    offsetY.current = MathUtils.lerp(offsetY.current, (mouse.y + noiseY) * cameraLimit.vertical, dt * 6)
    qx.current.setFromAxisAngle(X_AXIS, offsetY.current)
    qy.current.setFromAxisAngle(Y_AXIS, offsetX.current)
    camera.quaternion.multiply(qx.current)
    camera.quaternion.multiply(qy.current)
  })

  return (
    <>
      <CameraControls ref={camControls} enabled={true} />
      <primitive
        ref={sceneRef}
        renderOrder={1}
        castShadow={true}
        object={scene.clone(true)}
        onClick={e => console.log(e.object)}
      />
    </>
  )
}

export default function ScrollCamSetup() {
  return (
    <Canvas shadows camera={{ fov: 35 }}>
      <Scene />
      <Light />
      <ScrollHandler />
    </Canvas>
  )
}
