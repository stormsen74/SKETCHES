import { useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, DoubleSide, RepeatWrapping, TextureLoader } from 'three'
import vertexShader from './glsl/fakeRaysVert.glsl'
import fragmentShader from './glsl/fakeRaysFrag.glsl'
import { useGLTF } from '@react-three/drei'
import cube from './assets/cube.glb'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import beam from './assets/beam.jpg'

export default function BillboardBlades() {
  const { scene, nodes } = useGLTF(cube)
  const { camera } = useThree()
  const mesh = useRef(null)
  const spriteMat = useRef(null)
  const t = useRef(0)
  const map = useLoader(TextureLoader, beam)

  // useLayoutEffect(() => {
  //   map.wrapS = RepeatWrapping
  // }, [])

  useFrame((state, delta, frame) => {
    t.current += delta
    const opacity = Math.abs(Math.sin(t.current))
    spriteMat.current.opacity = opacity
  })

  return (
    <>
      <sprite position={[0, 0, 1]} scale={[1, 4, 1]}>
        <spriteMaterial
          map={map}
          alphaMap={map}
          color={'#ffb948'}
          blending={AdditiveBlending}
          rotation={-0.3}
          transparent={true}
          opacity={0.5}
        />
      </sprite>

      <sprite scale={[1, 4, 1]}>
        <spriteMaterial
          ref={spriteMat}
          map={map}
          alphaMap={map}
          color={'#ffb948'}
          blending={AdditiveBlending}
          rotation={-0.3}
          transparent={true}
          opacity={0.5}
        />
      </sprite>
    </>
  )
}
