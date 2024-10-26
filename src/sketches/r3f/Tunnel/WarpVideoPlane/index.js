import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { VideoTexture } from 'three'
import { useControls } from 'leva'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/shapeFrag.glsl'

export default function WarpVideoPlane() {
  const materialRef = useRef()
  const planeRef = useRef()
  const { camera, viewport } = useThree()

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/plasma.mp4'
    video.crossOrigin = 'Anonymous'
    video.playsInline = true
    video.loop = true
    video.muted = true
    video.play()

    const texture = new VideoTexture(video)
    materialRef.current.uniforms.u_texture.value = texture
  }, [])

  const { progress } = useControls({
    progress: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
  })

  const uniforms = useMemo(
    () => ({
      u_texture: { type: 't', value: null },
      progress: { value: 0 },
      // u_time: { value: 0.0 }, //this.clock.getElapsedTime()
    }),
    []
  )

  useFrame(({ clock }) => {
    // uniforms.u_time.value = clock.getElapsedTime()
    uniforms.progress.value = progress // Update the progress uniform

    planeRef.current.position.copy(camera.position)
    planeRef.current.quaternion.copy(camera.quaternion)
    planeRef.current.translateZ(-200) // Positioniert die Plane hinter der Kamera
  })

  return (
    <mesh ref={planeRef} renderOrder={100}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  )
}
