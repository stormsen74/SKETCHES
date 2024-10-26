import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'
import { AdditiveBlending, Euler, TextureLoader, Vector2 } from 'three'
import { CameraControls, Environment } from '@react-three/drei'
import { folder, useControls } from 'leva'
import Tex1 from './assets/tex.png'
import Tex2 from './assets/rgb.png'
import useScrollHandler from '@src/sketches/r3f/ScrollGrid/useScrollHandler.js'
import { useScrollStore } from '@src/sketches/r3f/ScrollGrid/useScrollStore.js'

function Grid() {
  const materialRef = useRef()
  const planeRef = useRef()
  const { viewport, camera } = useThree()

  const [texture1, texture2] = useLoader(TextureLoader, [Tex1, Tex2])

  const textureData = useMemo(
    () => [
      { position: [2.5, 3.0], size: 1, textureIndex: 0 },
      { position: [5.0, 5.0], size: 0.5, textureIndex: 1 },
    ],
    []
  )

  const texturePositions = textureData.flatMap(data => data.position)
  const textureSizes = textureData.map(data => data.size)
  const textureIndices = textureData.map(data => data.textureIndex)

  const uniforms = useMemo(
    () => ({
      uLines: { value: 15.0 },
      uLineThickness: { value: 0.005 },
      uCrossFrequency: { value: 0.5 },
      uCrossSize: { value: 0.5 },
      uProgress: { value: 0.0 },
      uTexture0: { value: texture1 },
      uTexture1: { value: texture2 },
      uTexturePositions: { value: texturePositions },
      uTextureSizes: { value: textureSizes },
      uTextureIndices: { value: textureIndices },
      uTextureCount: { value: textureData.length },
    }),
    [textureData]
  )

  const { thickness, crossFrequency, lines, alignGrid } = useControls({
    // progress: { value: 0.0, min: 0.0, max: 10.0, step: 0.01 },
    thickness: { value: 0.09, min: 0.0, max: 1.0, step: 0.01 },
    crossFrequency: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
    lines: { value: 15, min: 0.0, max: 30.0, step: 1 },
    alignGrid: true,
  })

  useFrame(({ clock }) => {
    const progress = useScrollStore.getState().progress

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress * 3
      materialRef.current.uniforms.uLineThickness.value = thickness
      materialRef.current.uniforms.uCrossFrequency.value = crossFrequency
      materialRef.current.uniforms.uLines.value = lines
    }

    if (!alignGrid) return
    planeRef.current.position.copy(camera.position)
    planeRef.current.quaternion.copy(camera.quaternion)
    planeRef.current.translateZ(-21)
  })

  return (
    <mesh ref={planeRef} renderOrder={1}>
      <planeGeometry args={[viewport.width, viewport.width]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        uniforms={uniforms}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}

function Env() {
  const { backgroundIntensity, backgroundBlurriness } = useControls({
    bg: folder({
      backgroundIntensity: { value: 0.6, min: 0, max: 1, step: 0.01 },
      backgroundBlurriness: { value: 0.35, min: 0, max: 1, step: 0.01 },
    }),
  })

  return (
    <Environment
      preset={'night'}
      background={true}
      backgroundRotation={new Euler(0, 0, 0, 'XYZ')}
      backgroundBlurriness={backgroundBlurriness}
      backgroundIntensity={backgroundIntensity}
    />
  )
}

function Cube() {
  const { showCube } = useControls({
    showCube: true,
  })

  return (
    showCube && (
      <mesh rotation={[0.4, 0.3, 0.2]} position={[0, 0, 10]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial color='red' depthTest={true} />
      </mesh>
    )
  )
}

export default function ScrollGrid() {
  const { start, pause } = useScrollHandler()

  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 20] }}>
      <color attach='background' args={['#0e0f37']} />

      {/*<CameraControls />*/}
      <Env />
      <Grid />
      <Cube />

      {/*<gridHelper />*/}
    </Canvas>
  )
}
