// https://codepen.io/forerunrun/pen/poONERw

// https://www.shadertoy.com/view/WlSGzy

// https://discourse.threejs.org/t/shader-reaction-diffusion-confined-to-a-specific-shape/58515

// https://mrob.com/pub/comp/xmorphia/ogl/index.html

import { CameraControls, OrthographicCamera, useFBO } from '@react-three/drei'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useMemo, useRef, useState } from 'react'
import { LinearFilter, NearestFilter, Scene } from 'three'
import { OffScreenScene } from './OffscreenScene'
import outFragment from './glsl/out_frag.glsl'
import vertexShader from './glsl/out_vert.glsl'
import { useControls } from 'leva'

const RESOLUTION = 1024

const Simulation = () => {
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

  const { iterationsPerFrame } = useControls({
    iterationsPerFrame: { value: 10, min: 1, max: 100, step: 1 },
  })

  useFrame(({ gl, camera }) => {
    for (let i = 0; i < iterationsPerFrame; i++) {
      gl.setRenderTarget(textureB)
      gl.render(offScreenScene, offScreenCameraRef.current)

      // Swap textures
      const t = textureA
      textureA = textureB
      textureB = t

      offScreen.current.material.uniforms.bufferTexture.value = textureA.texture

      gl.setRenderTarget(null)
      gl.render(scene, camera)
    }
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

export default function ReactionDiffusion() {
  return (
    <Canvas>
      {/* <CameraControls /> */}
      <Simulation />
    </Canvas>
  )
}
