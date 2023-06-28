import { useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, DoubleSide, RepeatWrapping, TextureLoader } from 'three'
import vertexShader from './glsl/fakeRaysVert.glsl'
import fragmentShader from './glsl/fakeRaysFrag.glsl'
import { useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import tex from './assets/vray-osl-alligator-noise.png'

export default function FakeRays() {
  const mesh = useRef(null)
  const map = useLoader(TextureLoader, tex)

  useLayoutEffect(() => {
    map.wrapS = RepeatWrapping
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseAlpha: { value: 0 },
      uGlowAlpha: { value: 0 },
      uTopFade: { value: 0 },
      uRaysColor: { value: new Color('#ffffff') },
      uGlowColor: { value: new Color('#000000') },
      uRaysStepMin: { value: 0 },
      uRaysStepMax: { value: 0 },
      uGlowStepMin: { value: 0 },
      uTexture: { value: map },
      m_uv_x: { value: 1 },
    }),
    []
  )

  const {
    uTime,
    uRaysColor,
    uGlowColor,
    uBaseAlpha,
    uGlowAlpha,
    uTopFade,
    uRaysStepMin,
    uRaysStepMax,
    uGlowStepMin,
    m_uv_x,
  } = useControls({
    uTime: { value: 0, min: -50, max: 50, step: 0.01 },
    uRaysColor: { value: '#ff7300' },
    uGlowColor: { value: '#ffd200' },
    uBaseAlpha: { value: 1, min: 0, max: 1, step: 0.01 },
    uGlowAlpha: { value: 1, min: 0, max: 1, step: 0.01 },
    uTopFade: { value: 0.3, min: 0, max: 1, step: 0.01 },
    uRaysStepMin: { value: 0.4, min: 0, max: 1, step: 0.01 },
    uRaysStepMax: { value: 0.7, min: 0, max: 1, step: 0.01 },
    uGlowStepMin: { value: 0.4, min: 0, max: 1, step: 0.01 },
    m_uv_x: { value: 1, min: 0, max: 5, step: 0.01 },
  })

  useFrame((state, delta, frame) => {
    // mesh.current.material.uniforms.uTime.value = uTime
    mesh.current.material.uniforms.uTime.value += delta
    mesh.current.material.uniforms.uRaysColor.value = new Color(uRaysColor)
    mesh.current.material.uniforms.uGlowColor.value = new Color(uGlowColor)
    mesh.current.material.uniforms.uBaseAlpha.value = uBaseAlpha
    mesh.current.material.uniforms.uGlowAlpha.value = uGlowAlpha
    mesh.current.material.uniforms.uTopFade.value = uTopFade

    mesh.current.material.uniforms.uRaysStepMin.value = uRaysStepMin
    mesh.current.material.uniforms.uRaysStepMax.value = uRaysStepMax
    mesh.current.material.uniforms.uGlowStepMin.value = uGlowStepMin

    mesh.current.material.uniforms.m_uv_x.value = m_uv_x
  })

  return (
    <mesh ref={mesh} position-z={0.1}>
      <cylinderGeometry args={[1, 5, 10, 32, 1, true]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
        blending={AdditiveBlending}
        depthWrite={false}
        depthTest={false}
        side={DoubleSide}
      />
    </mesh>
  )
}
