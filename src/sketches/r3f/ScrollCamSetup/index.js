import { CameraControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import testscene from './testscene.glb'
import Light from './Light.js'
import { useScrollCam } from '@src/sketches/r3f/ScrollCamSetup/useScrollCam.js'
import { BufferGeometry, Line, LineBasicMaterial, MathUtils, Quaternion, Vector3 } from 'three'
import { createNoise2D } from 'simplex-noise'
import Curve from '@src/sketches/r3f/ScrollCamSetup/Curve.js'
import useScrollHandler from '@src/sketches/r3f/ScrollCamSetup/useScrollHandler.js'
import { useControls } from 'leva'

const p1 = new Vector3(-15, 1, 15)
const t1 = new Vector3(-15, 1, 0)

const p2 = new Vector3(0, 1, 15)
const t2 = new Vector3(0, 1, 0)

const p3 = new Vector3(15, 1, 5)
const t3 = new Vector3(15, 1, -10)

const X_AXIS = new Vector3(1, 0, 0)
const Y_AXIS = new Vector3(0, 1, 0)

function Scene() {
  const { scene, nodes } = useGLTF(testscene)
  const { camera, gl, mouse } = useThree()
  const sceneRef = useRef(null)
  const camControls = useRef(null)
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

  const { start, pause } = useScrollHandler()

  const pathCam = useMemo(() => {
    return new Curve([p1, p2, p3])
  }, [])
  const lineCam = useMemo(() => {
    return new Line(
      new BufferGeometry().setFromPoints(pathCam.getCurvePoints()),
      new LineBasicMaterial({ color: '#0042b3' })
    )
  }, [])

  const pathTarget = useMemo(() => {
    return new Curve([t1, t2, t3])
  }, [])
  const lineTarget = useMemo(() => {
    return new Line(
      new BufferGeometry().setFromPoints(pathTarget.getCurvePoints()),
      new LineBasicMaterial({ color: '#ff0000' })
    )
  }, [])

  const [smoothTime, setSmoothTime] = useState(0.4)
  const [focus, setFocus] = useState(null)
  const [inTransition, setInTransition] = useState(false)

  const { orbit, showPath } = useControls({
    orbit: false,
    showPath: false,
  })

  useEffect(() => {
    camControls.current.mouseButtons.left = orbit ? 1 : 0 // 1|0
    camControls.current.mouseButtons.middle = orbit ? 8 : 0
    camControls.current.mouseButtons.right = orbit ? 2 : 0
    camControls.current.mouseButtons.wheel = orbit ? 8 : 0
    camControls.current.touches.one = orbit ? 32 : 0
    camControls.current.touches.two = orbit ? 1024 : 0
    camControls.current.touches.three = orbit ? 64 : 0

    if (orbit) {
      pause()
      camControls.current.reset(true)
    } else {
      start()
    }
  }, [orbit])

  useEffect(() => {
    scene.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    setTimeout(() => {
      sceneRef.current?.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    }, 1000)

    camControls.current.setLookAt(p1.x, p1.y, p1.z, t1.x, t1.y, t1.z, false)
  }, [])

  useFrame((state, delta) => {
    if (orbit) return

    const progress = useScrollCam.getState().progress
    const position = new Vector3().copy(pathCam.getPointAt(progress))
    const target = new Vector3().copy(pathTarget.getPointAt(progress))

    if (!inTransition) {
      camControls.current?.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, false)
    }

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

  const onTransitionInEnd = () => {
    camControls.current.removeEventListener('rest', onTransitionInEnd)
  }

  const onTransitionOutEnd = () => {
    camControls.current.removeEventListener('rest', onTransitionOutEnd)
    setInTransition(false)
    start()
  }

  useEffect(() => {
    const handleFocus = (focus, position, target, onEnd) => {
      pause()
      setSmoothTime(0.4)
      camControls.current?.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true)
      camControls.current.addEventListener('rest', onEnd)
      setInTransition(true)
    }

    if (focus === 'box3') {
      handleFocus('box3', new Vector3(-15, 1, 10), new Vector3(-15, 1, 0), onTransitionInEnd)
    } else if (focus === 'box2') {
      handleFocus('box2', new Vector3(0, 1, 10), new Vector3(0, 1, 0), onTransitionInEnd)
    } else if (focus === 'box1') {
      handleFocus('box1', new Vector3(15, 1, 0), new Vector3(15, 1, -10), onTransitionInEnd)
    } else {
      setSmoothTime(0.2)
      const progress = useScrollCam.getState().progress
      const position = new Vector3().copy(pathCam.getPointAt(progress))
      const target = new Vector3().copy(pathTarget.getPointAt(progress))
      camControls.current?.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true)
      camControls.current.addEventListener('rest', onTransitionOutEnd)
    }
  }, [focus])

  const handleRaycast = e => {
    const { name } = e.object

    if (name === 'box3' || name === 'box2' || name === 'box1') {
      setFocus(focus === name ? null : name)
    }
  }

  return (
    <>
      <CameraControls ref={camControls} enabled={true} smoothTime={smoothTime} />
      <primitive ref={sceneRef} renderOrder={1} castShadow={true} object={scene.clone(true)} onClick={handleRaycast} />
      {showPath && (
        <>
          <primitive object={lineCam} />
          <primitive object={lineTarget} />
        </>
      )}
    </>
  )
}

export default function ScrollCamSetup() {
  return (
    <Canvas shadows camera={{ fov: 35 }}>
      <Scene />
      <Light />
    </Canvas>
  )
}
