import { AdditiveBlending, Color, FrontSide, TextureLoader, Vector3 } from 'three'
import React, { useMemo, useRef } from 'react'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { CameraControls, Environment } from '@react-three/drei'
// import tex from './vmap.jpg'
import tex from './alpha.png'
// import uvtex from '@src/sketches/r3f/Bending/assets/texture_1k.jpg'

// https://gist.github.com/RaheelYawar/05e4f23a5ff930227f62d88963041668
// https://github.com/kiwipxl/GLSL-shaders/blob/e0c52cde54e5f8412b443eca4b1df597dca8d5a4/bloom.glsl
// https://kadekeith.me/2017/09/12/three-glow.html

export default function ShaderTest() {
  const glowWorldPosition = new Vector3()
  function Sphere() {
    const { camera } = useThree()
    const sphere = useRef()
    const glow = useRef()

    const [texture] = useLoader(TextureLoader, [tex])

    const uniforms = useMemo(
      () => ({
        u_map: { value: texture },
        u_time: { value: 0.0 },
        viewVector: { value: camera.position },
        glowColor: { value: new Color('#ffcc00') },
        multiplier: { value: 1 },
      }),
      []
    )

    const { wireframe, icoDetail, glowRadius, multiplier } = useControls({
      wireframe: true,
      icoDetail: { value: 7, min: 1, max: 10, step: 1 },
      glowRadius: { value: 1.5, min: 1, max: 3, step: 0.1 },
      multiplier: { value: 1, min: 0, max: 5, step: 0.01 },
    })

    useFrame((state, delta) => {
      uniforms.u_time.value = state.clock.getElapsedTime() * 0.5
      uniforms.multiplier.value = multiplier

      glow.current?.getWorldPosition(glowWorldPosition)
      const viewVector = new Vector3().subVectors(camera.position, glowWorldPosition)
      uniforms.viewVector.value = viewVector
    })

    return (
      <>
        <mesh ref={sphere} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1, icoDetail]} />
          <meshNormalMaterial />
          <mesh ref={glow}>
            <icosahedronGeometry args={[glowRadius, icoDetail]} />
            <shaderMaterial
              uniforms={uniforms}
              fragmentShader={fragmentShader}
              vertexShader={vertexShader}
              transparent={true}
              side={FrontSide}
              blending={AdditiveBlending}
              wireframe={wireframe}
            />
          </mesh>
        </mesh>

        {/*<mesh ref={glow}>*/}
        {/*  <icosahedronGeometry args={[glowRadius, icoDetail]} />*/}
        {/*  <shaderMaterial*/}
        {/*    uniforms={uniforms}*/}
        {/*    fragmentShader={fragmentShader}*/}
        {/*    vertexShader={vertexShader}*/}
        {/*    transparent={true}*/}
        {/*    side={FrontSide}*/}
        {/*    // blending={AdditiveBlending}*/}
        {/*    wireframe={wireframe}*/}
        {/*  />*/}
        {/*</mesh>*/}
      </>
    )
  }

  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 15] }}>
      <CameraControls />
      <Environment preset='sunset' background={true} blur={0} />
      <Sphere />
    </Canvas>
  )
}
