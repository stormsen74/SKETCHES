import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { CameraControls, OrthographicCamera, useFBO } from '@react-three/drei'
import {
  AdditiveBlending,
  Color,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  TextureLoader,
  Vector2,
} from 'three'
import { useEffect, useMemo, useRef } from 'react'
import brushTex from './burash01.png'
import uvTex from './base.jpg'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'

// https://www.youtube.com/watch?v=vWAci72MtME
// https://gracious-keller-98ef35.netlify.app/docs/recipes/heads-up-display-rendering-multiple-scenes/

const steps = 75
function Paint() {
  const { camera } = useThree()
  const mesh = useRef()
  const group = useRef()
  const scene1 = useRef()
  const scene2 = useRef()
  const mouse = useMemo(() => {
    return new Vector2()
  }, [])
  const prevMouse = useMemo(() => {
    return new Vector2()
  }, [])
  const currentWave = useRef(0)
  const [brush, uv] = useLoader(TextureLoader, [brushTex, uvTex])
  const meshes = useMemo(() => {
    return []
  }, [])

  const renderTarget = useFBO(window.innerWidth, window.innerHeight, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
  })

  const uniforms = useMemo(
    () => ({
      uTexture: { value: uv },
      uDisplacement: { value: null },
    }),
    []
  )

  const onMouseMove = e => {
    mouse.x = e.clientX - window.innerWidth / 2
    mouse.y = window.innerHeight / 2 - e.clientY
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
  }, [])

  useEffect(() => {
    const geometry = new PlaneGeometry(64, 64, 1, 1)
    for (let i = 0; i < steps; i++) {
      const material = new MeshBasicMaterial({
        map: brush,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      })
      const mesh = new Mesh(geometry, material)
      mesh.visible = false
      mesh.rotation.z = Math.random()
      group.current.add(mesh)
      meshes.push(mesh)
    }
  }, [])

  const setNewWave = (x, y, index) => {
    const mesh = meshes[index]
    mesh.visible = true
    mesh.position.x = x
    mesh.position.y = y
    mesh.material.opacity = 0.5
    mesh.scale.x = mesh.scale.y = 0.2
  }

  const trackMouse = () => {
    if (Math.abs(mouse.x - prevMouse.x) < 4 && Math.abs(mouse.y - prevMouse.y) < 4) return
    currentWave.current = (currentWave.current + 1) % steps
    prevMouse.x = mouse.x
    prevMouse.y = mouse.y
    setNewWave(mouse.x, mouse.y, currentWave.current)
  }

  useFrame(() => {
    trackMouse()
    meshes.forEach(mesh => {
      if (!mesh.visible) return
      mesh.rotation.z += 0.02
      mesh.material.opacity *= 0.96
      mesh.scale.x = mesh.scale.x * 0.98 + 0.1 //.982 + .108
      mesh.scale.y = mesh.scale.y * 0.98 + 0.1
      if (mesh.material.opacity < 0.002) {
        mesh.visible = false
      }
    })
  })

  useFrame(({ gl }) => {
    gl.setRenderTarget(renderTarget)
    gl.render(scene2.current, camera)
    uniforms.uDisplacement.value = renderTarget.texture
    gl.setRenderTarget(null)
    gl.clear()
    gl.render(scene1.current, camera)
    // gl.render(scene2.current, camera)
  }, 1)

  return (
    <>
      <scene ref={scene1}>
        <mesh ref={mesh}>
          <planeBufferGeometry args={[window.innerWidth, window.innerHeight, 1, 1]} />
          <shaderMaterial
            uniforms={uniforms}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            transparent={true}
            defines={{
              PR: window.devicePixelRatio.toFixed(1),
            }}
          />
        </mesh>
      </scene>
      <scene ref={scene2}>
        <group ref={group}></group>
      </scene>
    </>
  )
}
export default function FBOPaint() {
  const frustumSize = window.innerHeight
  const aspect = window.innerWidth / window.innerHeight

  return (
    <Canvas>
      <CameraControls />
      <OrthographicCamera
        makeDefault
        zoom={1}
        top={frustumSize / 2}
        bottom={frustumSize / -2}
        left={(frustumSize * aspect) / -2}
        right={(frustumSize * aspect) / 2}
        near={-1000}
        far={1000}
        // position={[0, 0, 2]}
      />
      <Paint />
    </Canvas>
  )
}
