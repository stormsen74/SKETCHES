import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { forwardRef, useMemo } from 'react'
import { Vector2, Vector3 } from 'three'
import simulationFrag from './glsl/simulationFrag.glsl'
import simulationVert from './glsl/simulationVert.glsl'

export const OffScreenScene = forwardRef((props, ref) => {
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      bufferTexture: { value: props.map },
      res: { value: new Vector2(props.res, props.res) },
      mouse: { value: new Vector3(0, 0, 0) },
      frame: { value: 0 },
    }),
    []
  )

  const sim_uniforms = useMemo(
    () => ({
      bufferTexture: { value: props.map },
      res: { value: new Vector2(props.res, props.res) },
      mouse: { value: new Vector3(0, 0, 0) },
      brushRadius: { value: 5 },
      f: { value: 0.023 },
      k: { value: 0.055 },
      dA: { value: 1.0 },
      dB: { value: 0.5 },
      timestep: { value: 1.0 },
    }),
    []
  )

  const presets = {
    'Spots': { feed: 0.035, kill: 0.065 },
    'Maze': { feed: 0.03, kill: 0.062 },
    'Stripes': { feed: 0.02, kill: 0.05 },
    'Chaos-Confusion': { feed: 0.026, kill: 0.051 },
  }

  const { feed, kill, dA, dB, timestep, brushRadius } = useControls({
    feed: { value: 0.023, min: 0, max: 0.1, step: 0.001 },
    kill: { value: 0.055, min: 0.03, max: 0.07, step: 0.001 },
    dA: { value: 1, min: 0, max: 1, step: 0.01 },
    dB: { value: 0.5, min: 0, max: 1, step: 0.01 },
    timestep: { value: 1.0, min: 0.0, max: 2.0, step: 0.01 },
    brushRadius: { value: 5.0, min: 0.0, max: 10.0, step: 0.1 },
  })

  useFrame(() => {
    ref.current.material.uniforms.f.value = feed
    ref.current.material.uniforms.k.value = kill
    ref.current.material.uniforms.dA.value = dA
    ref.current.material.uniforms.dB.value = dB
    ref.current.material.uniforms.timestep.value = timestep
    ref.current.material.uniforms.brushRadius.value = brushRadius
  })

  return (
    // <group>
    //   <mesh ref={ref}>
    //     <planeGeometry args={[size.width, size.height]} />
    //     <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    //   </mesh>
    // </group>

    <group>
      <mesh ref={ref}>
        <planeGeometry args={[size.width, size.height]} />
        <shaderMaterial vertexShader={simulationVert} fragmentShader={simulationFrag} uniforms={sim_uniforms} />
      </mesh>
    </group>
  )
})
