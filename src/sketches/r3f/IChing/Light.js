import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

export default function Light() {
  const dirLight = useRef()

  useLayoutEffect(() => {
    // console.log('hi', dirLight.current)

    if (dirLight.current) {
      const shadow = { size: 2048, bias: 0.06 }
      const size = 60
      dirLight.current.shadow.camera.near = 0
      dirLight.current.shadow.camera.far = 2000
      dirLight.current.shadow.camera.left = -size
      dirLight.current.shadow.camera.right = size
      dirLight.current.shadow.camera.bottom = -size
      dirLight.current.shadow.camera.top = size
      dirLight.current.shadow.camera.updateProjectionMatrix()
      dirLight.current.shadow.bias = shadow.bias / 100000

      dirLight.current.shadow.mapSize.width = shadow.size
      dirLight.current.shadow.mapSize.height = shadow.size
    }
  }, [dirLight])

  useFrame(() => {})

  return (
    <>
      <directionalLight ref={dirLight} castShadow={true} intensity={0.6} color={'#ffffff'} position={[50, 100, 100]} />
    </>
  )
}
