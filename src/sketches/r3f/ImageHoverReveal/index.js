import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { Color, TextureLoader, Vector2 } from 'three'
import Base from './assets/base.jpg'
import Hover from './assets/hover.jpg'
import Shape from './assets/shape.jpg'
import { DEG2RAD } from 'three/src/math/MathUtils.js'
import vertexShader from './glsl/revealVert.glsl'
import fragmentShader from './glsl/shapeFrag.glsl'
import { gsap } from 'gsap'

const multiplyMatrixAndPoint = (matrix, point) => {
  const c0r0 = matrix[0]
  const c1r0 = matrix[1]
  const c0r1 = matrix[2]
  const c1r1 = matrix[3]
  const x = point[0]
  const y = point[1]
  return [Math.abs(x * c0r0 + y * c0r1), Math.abs(x * c1r0 + y * c1r1)]
}

const rotateMatrix = a => [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)]

export const getRatio = ({ x: w, y: h }, { width, height }, r = 0) => {
  const m = multiplyMatrixAndPoint(rotateMatrix(DEG2RAD * r), [w, h])
  const originalRatio = {
    w: m[0] / width,
    h: m[1] / height,
  }

  const coverRatio = 1 / Math.max(originalRatio.w, originalRatio.h)

  return new Vector2(originalRatio.w * coverRatio, originalRatio.h * coverRatio)
}

function Reveal() {
  const mesh = useRef(null)
  const mouse = useMemo(() => {
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
      u_progressHover: { value: 1.0 },
      u_progressClick: { value: 0 },
      u_time: { value: 1.0 }, //this.clock.getElapsedTime()
      u_res: { value: new Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  )

  const onMouseMove = event => {
    gsap.to(mouse, {
      duration: 0.5,
      x: event.clientX,
      y: event.clientY,
    })

    // mouse.set(event.clientX, event.clientY)
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(state => {
    uniforms.u_time.value += state.clock.getDelta()
    console.log(uniforms.u_time.value)

    mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5)
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
        //   defines: {
        //     PI: Math.PI,
        //     PR: window.devicePixelRatio.toFixed(1),
        // },
        // blending={AdditiveBlending}
        // depthWrite={false}
        // depthTest={false}
        // side={DoubleSide}
      />
    </mesh>
  )
}

export default function ImageHoverReveal() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 5] }}>
      <Reveal />
    </Canvas>
  )
}
