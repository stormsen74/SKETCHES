import { useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, FrontSide, ShaderMaterial } from 'three'
import vertexShader from './glsl/glowRaysVert.glsl'
import fragmentShader from './glsl/glowRaysFrag.glsl'
import { useGLTF } from '@react-three/drei'
import cube from './assets/rays_mesh.glb'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export default function MeshBasedGlow() {
  const { scene, nodes } = useGLTF(cube)
  const { camera } = useThree()
  const sceneRef = useRef(null)

  const uniforms = useMemo(
    () => ({
      c: { value: 1 },
      p: { value: 1.94 },
      op: { value: 0.1 },
      glowColor: { value: new Color('#ffbb00') },
      viewVector: { value: camera.position },
    }),
    []
  )

  const { c, p, op, glowColor } = useControls({
    glowColor: '#ffbb00',
    c: { value: 1, min: 0, max: 2, step: 0.01 },
    p: { value: 1.94, min: 0, max: 5, step: 0.01 },
    op: { value: 0.1, min: 0, max: 1, step: 0.01 },
  })

  useLayoutEffect(() => {
    scene.traverse(o => {
      if (o.isMesh) {
        o.material = new ShaderMaterial({
          uniforms: uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          side: FrontSide,
        })
      }
    })
  }, [])

  useFrame(() => {
    sceneRef.current.children[0].material.uniforms.glowColor.value = new Color(glowColor)
    sceneRef.current.children[0].material.uniforms.c.value = c
    sceneRef.current.children[0].material.uniforms.p.value = p
    sceneRef.current.children[0].material.uniforms.op.value = op
  })

  return <primitive ref={sceneRef} object={scene} />
}
