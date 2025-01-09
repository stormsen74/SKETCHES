import { CameraControls, Environment } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import React, { useState } from 'react'
import { DoubleSide } from 'three'
import { useControls } from 'leva'

export default function Postprocessing() {
  const { bloom, levels, bloom_intensity, environment, luminanceThreshold, emiIntensity } = useControls({
    bloom: true,
    bloom_intensity: { value: 0.4, min: 0, max: 10, step: 0.01 },
    levels: { value: 8, min: 1, max: 9, step: 1 },
    luminanceThreshold: { value: 1, min: 0, max: 3, step: 0.01 },
    emiIntensity: { value: 4, min: 0, max: 10, step: 0.01 },
    environment: false,
  })
  return (
    <>
      <Canvas camera={{ position: [0, 0, -3], near: 0.1, far: 10 }} dpr={[1, 2]}>
        {/*<Canvas flat orthographic camera={{ zoom: 100 }}>*/}
        {environment ? (
          <Environment preset={'park'} background={true} backgroundBlurriness={0} />
        ) : (
          <color attach='background' args={['#111']} />
        )}

        <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            depthTest={true}
            toneMapped={false}
            emissive={'#25ddff'}
            emissiveIntensity={emiIntensity}
          />
        </mesh>

        <EffectComposer>
          {/*<DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />*/}
          {/*<Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />*/}
          {bloom && (
            <Bloom mipmapBlur luminanceThreshold={luminanceThreshold} levels={levels} intensity={bloom_intensity} />
          )}
          {/*<Vignette eskil={false} offset={0.1} darkness={1.1} />*/}
        </EffectComposer>
        <CameraControls />
      </Canvas>
    </>
  )
}
