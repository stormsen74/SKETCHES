import { Canvas, useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, Vector3 } from 'three'
import { useState, useRef, useEffect } from 'react'
import { CameraControls } from '@react-three/drei'
import { useControls } from 'leva'

function lerpColor(color1, color2, t) {
  return color1.clone().lerp(color2, t)
}

function Attractor({ a, b, c, numPoints, progress, dt, colorStart, colorEnd }) {
  const points = useRef([])
  const colors = useRef([])
  const lineRef = useRef()
  const [geometry, setGeometry] = useState(new BufferGeometry())

  useEffect(() => {
    points.current = []
    colors.current = []

    let x = 0.1
    let y = 0
    let z = 0

    // Aizawa Attractor
    const _a = 0.95
    const _b = 0.7
    const _c = 0.6
    const _d = 3.5
    const _e = 0.25
    const _f = 0.1

    for (let i = 0; i < numPoints; i++) {
      // Lorenz Attractor
      // const dx = a * (y - x) * dt
      // const dy = (x * (b - z) - y) * dt
      // const dz = (x * y - c * z) * dt

      // Aizawa Attractor
      const dx = (z - _b) * x - _d * y
      const dy = _d * x + (z - _b) * y
      const dz = _c + _a * z - z ** 3 / 3 - (x ** 2 + y ** 2) * (1 + _e * z) + _f * z * x ** 3

      x += dx * dt
      y += dy * dt
      z += dz * dt

      points.current.push(new Vector3(x, y, z))

      const t = i / numPoints
      const color = lerpColor(new Color(colorStart), new Color(colorEnd), t)
      colors.current.push(color)
    }

    const visiblePoints = Math.floor(progress * points.current.length)
    const vertices = new Float32Array(visiblePoints * 3)
    const vertexColors = new Float32Array(visiblePoints * 3)
    points.current.slice(0, visiblePoints).forEach((point, i) => {
      vertices[i * 3] = point.x
      vertices[i * 3 + 1] = point.y
      vertices[i * 3 + 2] = point.z

      vertexColors[i * 3] = colors.current[i].r
      vertexColors[i * 3 + 1] = colors.current[i].g
      vertexColors[i * 3 + 2] = colors.current[i].b
    })

    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new BufferAttribute(vertexColors, 3))
    setGeometry(geometry)
  }, [a, b, c, numPoints, geometry, progress, dt, colorStart, colorEnd])

  // useFrame(() => {
  //   if (lineRef.current) {
  //     lineRef.current.rotation.x += 0.01
  //     lineRef.current.rotation.y += 0.01
  //   }
  // })

  return (
    <line ref={lineRef}>
      <bufferGeometry {...geometry} />
      <lineBasicMaterial vertexColors={true} />
    </line>
  )
}
export default function LorenzAttractor() {
  const { a, b, c, numPoints, progress, dt, colorStart, colorEnd } = useControls({
    a: { value: 10, min: 0, max: 20 },
    b: { value: 28, min: 0, max: 50 },
    c: { value: 8 / 3, min: 0, max: 5 },
    numPoints: { value: 10000, min: 1000, max: 50000, step: 1 },
    dt: { value: 0.005, min: 0.001, max: 0.01, step: 0.001 },
    progress: { value: 1, min: 0, max: 1, step: 0.01 },
    colorStart: { value: '#00ffd4' },
    colorEnd: { value: '#0000ff' },
  })

  return (
    <Canvas camera={{ position: [0, 0, 120], fov: 35 }}>
      <Attractor
        a={a}
        b={b}
        c={c}
        numPoints={numPoints}
        progress={progress}
        dt={dt}
        colorStart={colorStart}
        colorEnd={colorEnd}
      />
      <CameraControls />
    </Canvas>
  )
}
