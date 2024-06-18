import { Canvas } from '@react-three/fiber'
import React, { useEffect, useRef } from 'react'
import { CameraControls, Environment, useGLTF } from '@react-three/drei'
import glb from './home.glb'
import { ShaderChunk } from 'three'

function Scene() {
  const sceneRef = useRef()
  const { scene, nodes } = useGLTF(glb)

  useEffect(() => {
    scene.traverse(child => {
      if (child.type === 'Mesh') {
        if (child.material.aoMap && child.geometry.attributes.uv1) {
          child.material.aoMap.channel = 1
        }
      }
    })
  }, [scene])

  return <primitive ref={sceneRef} castShadow={true} object={scene} />
}
export default function SecondUVSet() {
  return (
    <Canvas shadows camera={{ fov: 35 }}>
      <Scene />
      <CameraControls />
      <Environment preset='sunset' background={true} backgroundBlurriness={0.5} />
    </Canvas>
  )
}
