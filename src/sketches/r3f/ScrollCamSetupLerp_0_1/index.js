import { CameraControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import testscene from './testscene.glb'
import Light from '@src/sketches/r3f/ScrollCamSetup/Light.js'
import { useScrollCam } from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/useScrollCam.js'
import { BufferGeometry, Line, LineBasicMaterial, MathUtils, Vector3 } from 'three'
import { createNoise2D } from 'simplex-noise'
import Curve from '@src/sketches/r3f/ScrollCamSetup/Curve.js'
import { useControls } from 'leva'
import { useCameraStore } from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/useCameraStore.js'
import useScrollHandler from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/useScrollHandler.js'

const FORWARD = new Vector3(0, 0, -1)

function Scene() {
  const { scene, nodes } = useGLTF(testscene)
  const { camera, gl, mouse } = useThree()
  const sceneRef = useRef(null)
  const camControls = useRef(null)
  const noise = useMemo(() => {
    return createNoise2D()
  }, [])
  const offsetX = useRef(0)
  const offsetY = useRef(0)
  const cameraLimit = useMemo(() => {
    return { vertical: 0.15, horizontal: 0.25 }
  }, [])

  const { startScroll, pauseScroll, resetScroll, scrollDirection } = useScrollHandler()
  const cameras = useCameraStore(state => state.cameras)
  const addCamera = useCameraStore(state => state.addCamera)
  const setCamerasReady = useCameraStore(state => state.setCamerasReady)
  const camerasReady = useCameraStore(state => state.camerasReady)

  const [lineCam, setLineCam] = useState(null)
  const [lineTarget, setLineTarget] = useState(null)

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  useEffect(() => {
    if (camerasReady) {
      const camPositions = cameras.map(cam => {
        return cam.position
      })
      const camPath = new Curve(camPositions)
      setLineCam(
        new Line(
          new BufferGeometry().setFromPoints(camPath.getCurvePoints()),
          new LineBasicMaterial({ color: '#0042b3' })
        )
      )

      const targetPositions = cameras.map(cam => {
        return cam.target
      })
      const targetPath = new Curve(targetPositions)
      setLineTarget(
        new Line(
          new BufferGeometry().setFromPoints(targetPath.getCurvePoints()),
          new LineBasicMaterial({ color: '#b3000f' })
        )
      )

      const initalCam = camPositions[0]
      const initalTarget = targetPositions[0]

      camControls.current.setLookAt(
        initalCam.x,
        initalCam.y,
        initalCam.z,
        initalTarget.x,
        initalTarget.y,
        initalTarget.z,
        false
      )
    }
  }, [cameras, camerasReady])

  const [smoothTime, setSmoothTime] = useState(0.4)
  const [focusObject, setFocusObject] = useState(null)
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
      pauseScroll()
      camControls.current.reset(true)
    } else {
      startScroll()
    }
  }, [orbit])

  useEffect(() => {
    scene.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    setTimeout(() => {
      sceneRef.current?.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    }, 1000)
  }, [])

  const getTargetPosition = (position, quaternion) => {
    const distance = 15
    const direction = FORWARD.clone().applyQuaternion(quaternion)
    return {
      x: position.x + direction.x * distance,
      y: position.y + direction.y * distance,
      z: position.z + direction.z * distance,
    }
  }

  useEffect(() => {
    if (camerasReady) return
    scene.traverse(o => {
      if (o.type === 'PerspectiveCamera') {
        const name = o.name
        const position = o.position
        const quaternion = o.quaternion
        const target = getTargetPosition(position, quaternion)
        const camera = { name: name, position: position, target: target }
        addCamera(camera)
      }
    })

    setCamerasReady()
  }, [scene, camerasReady])

  useEffect(() => {
    console.log('index_0', currentSegmentIndex, 'index_1', currentSegmentIndex + 1)
  }, [currentSegmentIndex])

  const switchNextSegment = () => {
    resetScroll()
    setCurrentSegmentIndex(currentSegmentIndex + 1)
  }

  const switchPrevSegment = () => {
    resetScroll(true)
    setCurrentSegmentIndex(currentSegmentIndex - 1)
  }

  useFrame((state, delta) => {
    if (orbit) return

    const progress = useScrollCam.getState().progress

    if (progress >= 1 && scrollDirection.current === 1) {
      if (currentSegmentIndex < cameras.length - 2) switchNextSegment()
    }
    if (progress <= 0 && scrollDirection.current === -1) {
      if (currentSegmentIndex > 0) switchPrevSegment()
    }

    const dt = MathUtils.clamp(delta, Number.EPSILON, 0.0333)
    const noiseX = noise(state.clock.getElapsedTime() * 0.1, 0) * 0.18 //.15
    const noiseY = noise(state.clock.getElapsedTime() * 0.1, 0.25) * 0.43 //.35
    offsetX.current = MathUtils.lerp(offsetX.current, (mouse.x + noiseX) * cameraLimit.horizontal, dt * 6)
    offsetY.current = MathUtils.lerp(offsetY.current, (mouse.y + noiseY) * cameraLimit.vertical, dt * 6)

    if (!inTransition) {
      const p1 = cameras[currentSegmentIndex].position
      const t1 = cameras[currentSegmentIndex].target
      const p2 = cameras[currentSegmentIndex + 1].position
      const t2 = cameras[currentSegmentIndex + 1].target

      camControls.current?.lerpLookAt(
        p1.x + offsetX.current,
        p1.y + offsetY.current,
        p1.z,
        t1.x + offsetX.current,
        t1.y + offsetY.current,
        t1.z,
        p2.x + offsetX.current,
        p2.y + offsetY.current,
        p2.z,
        t2.x + offsetX.current,
        t2.y + offsetY.current,
        t2.z,
        progress,
        true
      )
    }
  })

  const onTransitionOutEnd = () => {
    camControls.current.removeEventListener('rest', onTransitionOutEnd)
    startScroll()
    setSmoothTime(0.4)
  }

  function normalizeAngle(angle) {
    const TAU = Math.PI * 2
    return MathUtils.euclideanModulo(angle, TAU)
  }

  useEffect(() => {
    if (focusObject) {
      pauseScroll()
      setInTransition(true)
      setSmoothTime(0.4)
      camControls.current.fitToBox(focusObject, true, { cover: false })
      if (focusObject.rotation.y !== 0) {
        camControls.current.rotateAzimuthTo(normalizeAngle(focusObject.rotation.y), true)
      }
    } else {
      camControls.current.addEventListener('rest', onTransitionOutEnd)
      setSmoothTime(0.2)
      setInTransition(false)
    }
  }, [focusObject])

  const handleRaycast = e => {
    const { name } = e.object

    if (name === 'box4' || name === 'box3' || name === 'box2' || name === 'box1') {
      setFocusObject(!focusObject ? e.object : null)
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

export default function ScrollCamSetupLerp_0_1() {
  return (
    <Canvas shadows camera={{ fov: 35 }}>
      <Scene />
      <Light />
    </Canvas>
  )
}
