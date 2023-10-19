import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { DoubleSide, TextureLoader, Vector2 } from 'three'
import Hover from './assets/base.jpg'
import Base from './assets/hover.jpg'
import Shape from './assets/circle.png'
import vertexShader from './glsl/revealVert.glsl'
import fragmentShader from './glsl/shapeFrag.glsl'
import { getRatio } from './utils.js'
import { CameraControls } from '@react-three/drei'

function Reveal() {
  const { camera } = useThree()
  const mesh = useRef(null)
  const mouse = useMemo(() => {
    return new Vector2()
  }, [])
  const mouseTo = useMemo(() => {
    return new Vector2()
  }, [])

  const [texture, hoverTexture, shape] = useLoader(TextureLoader, [Base, Hover, Shape])

  const uniforms = useMemo(
    () => ({
      u_alpha: { value: 1.0 },
      u_map: { type: 't', value: texture },
      u_ratio: { value: getRatio(new Vector2(500, 500), texture.image) },
      u_hovermap: { type: 't', value: hoverTexture },
      u_hoverratio: { value: getRatio(new Vector2(500, 500), hoverTexture.image) },
      u_shape: { value: shape },
      u_mouse: { value: mouse },
      // u_mouse: { value: new Vector2(1000, 550) },
      u_progressHover: { value: 1 },
      u_progressClick: { value: 0 },
      u_time: { value: 0.0 }, //this.clock.getElapsedTime()
      u_res: { value: new Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  )

  const onMouseMove = event => {
    mouseTo.set(event.clientX, event.clientY)
  }

  const onResize = () => {
    uniforms.u_res.value.set(window.innerWidth, window.innerHeight)
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)
  }, [])

  useFrame((state, delta) => {
    uniforms.u_time.value = state.clock.getElapsedTime() * 0.5
    mouse.lerp(mouseTo, delta * 4)

    // mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5)
    // mesh.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.5)
    // mesh.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.25)
  })

  return (
    <mesh ref={mesh} position-z={0.1} position-x={0}>
      <planeBufferGeometry args={[2, 2, 1, 1]} />
      {/*<meshNormalMaterial />*/}
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
        defines={{
          PR: window.devicePixelRatio.toFixed(1),
        }}
        side={DoubleSide}
        // blending={AdditiveBlending}
        // depthWrite={false}
        // depthTest={false}
      />
    </mesh>
  )
}

export default function ImageHoverReveal() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 5] }}>
      <CameraControls />
      <Reveal />
    </Canvas>
  )
}
