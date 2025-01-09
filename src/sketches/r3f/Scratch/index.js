// https://codepen.io/forerunrun/pen/poONERw

// https://www.shadertoy.com/view/WlSGzy

// https://discourse.threejs.org/t/shader-reaction-diffusion-confined-to-a-specific-shape/58515

import { useRef, useCallback, useState, forwardRef, useMemo } from 'react'
import { Canvas, useFrame, useThree, createPortal, extend, useLoader } from '@react-three/fiber'
import { OrthographicCamera, useFBO, shaderMaterial, CameraControls } from '@react-three/drei'
import { OffScreenScene } from './OffscreenScene'
import vertexShader from './glsl/vert.glsl'
import outFragment from './glsl/out_frag.glsl'
import {
  DoubleSide,
  FloatType,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector2,
} from 'three'

const RESOLUTION = 1024

const Sim = () => {
  const { scene, size } = useThree()
  const offScreen = useRef()
  const onScreen = useRef()

  const offScreenFBOTexture = useFBO(RESOLUTION, RESOLUTION, {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
  })

  const onScreenFBOTexture = useFBO(RESOLUTION, RESOLUTION, {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
  })

  const [offScreenScene] = useState(() => new Scene())
  const offScreenCameraRef = useRef(null)

  let textureA = offScreenFBOTexture
  let textureB = onScreenFBOTexture

  const uniforms = useMemo(
    () => ({
      bufferTexture: { value: textureB.texture },
    }),
    []
  )

  useFrame(({ gl, camera }) => {
    gl.setRenderTarget(textureB)
    gl.render(offScreenScene, offScreenCameraRef.current)

    // Swap textures
    const t = textureA
    textureA = textureB
    textureB = t

    onScreen.current.material.map = textureB.texture
    offScreen.current.material.uniforms.bufferTexture.value = textureA.texture

    gl.setRenderTarget(null)
    gl.render(scene, camera)
  })

  const onPointerMove = useCallback(e => {
    const { uv } = e
    offScreen.current.material.uniforms.mouse.value.x = uv.x
    offScreen.current.material.uniforms.mouse.value.y = uv.y
  }, [])

  const onMouseUp = useCallback(() => {
    offScreen.current.material.uniforms.mouse.value.z = 0.0
  }, [])
  const onMouseDown = useCallback(() => {
    offScreen.current.material.uniforms.mouse.value.z = 1.0
  }, [])

  return (
    <>
      <mesh ref={onScreen} onPointerMove={onPointerMove} onPointerDown={onMouseDown} onPointerUp={onMouseUp}>
        <planeGeometry args={[20, 20]} />
        {/* <sphereGeometry args={[3]} /> */}
        {/* <meshBasicMaterial map={onScreenFBOTexture} /> */}
        <shaderMaterial vertexShader={vertexShader} fragmentShader={outFragment} uniforms={uniforms} />
      </mesh>

      {createPortal(
        <>
          <OffScreenScene ref={offScreen} map={offScreenFBOTexture.texture} res={RESOLUTION} />
          <OrthographicCamera
            makeDefault
            position={[0, 0, 2]}
            args={[-1, 1, 1, -1, 1, 1000]}
            aspect={size.width / size.height}
            ref={offScreenCameraRef}
          />
        </>,
        offScreenScene
      )}
    </>
  )
}

export default function Scratch() {
  return (
    <Canvas>
      {/* <CameraControls /> */}
      <Sim />
    </Canvas>
  )
}