import { CameraControls, PerspectiveCamera, useFBO } from '@react-three/drei'
import { Canvas, createPortal, useFrame } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { useRef } from 'react'
import { Scene } from 'three'

const Portal = () => {
  const mesh = useRef()
  const otherMesh = useRef()
  const otherCamera = useRef()
  const otherScene = new Scene()

  const renderTarget = useFBO()

  const { renderBox } = useControls({
    renderBox: {
      value: false,
    },
  })

  useFrame(state => {
    const { gl, clock, camera } = state
    otherCamera.current.matrixWorldInverse.copy(camera.matrixWorldInverse)

    gl.setRenderTarget(renderTarget)
    gl.render(otherScene, otherCamera.current)

    mesh.current.material.map = renderTarget.texture

    // otherMesh.current.rotation.x = Math.cos(clock.elapsedTime / 2)
    // otherMesh.current.rotation.y = Math.sin(clock.elapsedTime / 2)
    // otherMesh.current.rotation.z = Math.sin(clock.elapsedTime / 2)

    gl.setRenderTarget(null)
  })

  return (
    <>
      <PerspectiveCamera manual ref={otherCamera} aspect={1.5 / 1} />
      {createPortal(
        <>
          <group>
            <mesh ref={otherMesh}>
              <boxGeometry args={[1]} />
              <meshNormalMaterial />
            </mesh>
          </group>
        </>,
        otherScene
      )}
      <mesh ref={mesh}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial />
      </mesh>
    </>
  )
}

export default function PortalSetup() {
  return (
    <>
      <Leva collapsed />
      <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 2]}>
        <Portal />
        <CameraControls />
      </Canvas>
    </>
  )
}
