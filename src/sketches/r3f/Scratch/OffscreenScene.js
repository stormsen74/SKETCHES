import { useLoader, useThree } from '@react-three/fiber'
import { forwardRef, useMemo } from 'react'
import { TextureLoader, Vector2, Vector3 } from 'three'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/sim_frag.glsl'

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

  return (
    <group>
      <mesh ref={ref}>
        <planeGeometry args={[size.width, size.height]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
    </group>
  )
})
