import { useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, FrontSide, ShaderMaterial } from 'three'
import vertexShader from './glsl/fakeGodRaysVert.glsl'
import fragmentShader from './glsl/fakeGodRaysFrag.glsl'
import { useGLTF } from '@react-three/drei'
import cube from './assets/rays_mesh.glb'

export default function MeshBasedFresnel() {
  const { scene } = useGLTF(cube)
  const sceneRef = useRef(null)

  const uniforms = useMemo(() => ({}), [])

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

  return <primitive ref={sceneRef} object={scene} />
}
