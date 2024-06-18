import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TextureLoader, Vector2 } from 'three'
import Texture from './assets/rgb.png'
import styled from 'styled-components'

const Display = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  color: orange;
  font-size: 20px;
`

function ImageTest({ setPicked }) {
  const mesh = useRef()
  const textureCanvas = useRef()
  const dim = useMemo(() => {
    return new Vector2()
  }, [])

  const [texture] = useLoader(TextureLoader, [Texture])

  const handleOnClick = e => {
    const uv = e.uv
    uv.x *= dim.x
    uv.y = 1 - uv.y
    uv.y *= dim.y

    const colorValues = textureCanvas.current.getContext('2d').getImageData(uv.x, uv.y, 1, 1).data
    const r = colorValues[0]
    const g = colorValues[1]
    const b = colorValues[2]

    if (r === 255 && g === 0 && b === 0) {
      setPicked('RED')
    } else if (r === 0 && g === 255 && b === 0) {
      setPicked('GREEN')
    } else if (r === 0 && g === 0 && b === 255) {
      setPicked('BLUE')
    } else if (r === 255 && g === 255 && b === 255) {
      setPicked('WHITE')
    } else {
      setPicked('UNDEFINED')
    }
  }

  useEffect(() => {
    const img = texture.source.data
    dim.set(img.width, img.height)
    textureCanvas.current = document.createElement('canvas')
    textureCanvas.current.width = img.width
    textureCanvas.current.height = img.height
    textureCanvas.current.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
  }, [texture])

  useFrame(state => {
    mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5)
    mesh.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.25)
  })

  return (
    <mesh ref={mesh} onClick={handleOnClick}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}
export default function ImageUVCoordinates() {
  const [picked, setPicked] = useState('✌')

  return (
    <>
      <Display>{picked}</Display>️
      <Canvas camera={{ fov: 35, position: [0, 0, 5] }}>
        <ImageTest setPicked={setPicked} />
      </Canvas>
    </>
  )
}
