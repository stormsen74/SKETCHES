// https://codepen.io/forerunrun/pen/poONERw

// https://www.shadertoy.com/view/WlSGzy

// https://discourse.threejs.org/t/shader-reaction-diffusion-confined-to-a-specific-shape/58515

// https://jasonwebb.github.io/reaction-diffusion-playground/

// https://mrob.com/pub/comp/xmorphia/ogl/index.html

// https://www.shadertoy.com/view/WlSGzy

// Todos:
// ° Make resizeable
// ° Add methods for clearing and fill with patterns

import { CameraControls, OrthographicCamera, useFBO } from '@react-three/drei'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LinearFilter, NearestFilter, Scene } from 'three'
import { OffScreenScene } from './OffscreenScene'
import { TweakpaneProvider, useTweakpane } from './TweakpaneProvider'
import outFragment from './glsl/out_frag.glsl'
import vertexShader from './glsl/out_vert.glsl'

const RESOLUTION = 1024

const Simulation = () => {
  const pane = useTweakpane()
  const { scene, size } = useThree()
  const offScreen = useRef()
  const onScreen = useRef()
  const PARAMS = useRef({
    iterPerStep: 10,
  })

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

  useEffect(() => {
    const folder = pane.addFolder({ title: 'Simulation' })
    folder.addBinding(PARAMS.current, 'iterPerStep', { min: 1, max: 100, step: 1 })
  }, [pane])

  useFrame(({ gl, camera }) => {
    for (let i = 0; i < PARAMS.current.iterPerStep; i++) {
      gl.setRenderTarget(textureB)
      gl.render(offScreenScene, offScreenCameraRef.current)

      // Swap textures
      const _temp = textureA
      textureA = textureB
      textureB = _temp

      offScreen.current.material.uniforms.bufferTexture.value = textureA.texture
    }

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
    <TweakpaneProvider>
      <Canvas camera={{ fov: 35, position: [0, 0, 20] }}>
        {/* <CameraControls /> */}
        <Simulation />
      </Canvas>
    </TweakpaneProvider>
  )
}
