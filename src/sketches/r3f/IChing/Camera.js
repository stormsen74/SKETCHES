import { CameraControls } from '@react-three/drei'
import { useLayoutEffect, useRef } from 'react'

// https://github.com/yomotsu/camera-controls
// https://codesandbox.io/s/sew669?file=/src/App.js:1646-1691

export default function Camera() {
  const cameraControlsRef = useRef()

  useLayoutEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.truck(0, -4, false)
    }
  }, [])

  return <CameraControls ref={cameraControlsRef} />
}
