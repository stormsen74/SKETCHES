import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber'
import { CameraControls, OrthographicCamera, PerspectiveCamera, useFBO, useHelper } from '@react-three/drei'
import {
  AdditiveBlending,
  CameraHelper,
  Color,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  TextureLoader,
  Vector2,
} from 'three'
import React, { useEffect, useMemo, useRef } from 'react'
import brushTex from './burash01.png'
import uvTex from './base.jpg'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'

// https://www.youtube.com/watch?v=vWAci72MtME
// https://gracious-keller-98ef35.netlify.app/docs/recipes/heads-up-display-rendering-multiple-scenes/

const steps = 75
function Paint() {
  const mesh = useRef()
  const group = useRef()
  const otherCamera = useRef()
  const otherScene = new Scene()
  const mouse = useMemo(() => {
    return new Vector2(-0.5, 0)
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

  useHelper(otherCamera, CameraHelper, 1, 'hotpink')

  const uniforms = useMemo(
    () => ({
      uTexture: { value: uv },
      uDisplacement: { value: null },
    }),
    []
  )

  useEffect(() => {
    const geometry = new PlaneGeometry(0.5, 0.5, 1, 1)
    for (let i = 0; i < steps; i++) {
      const material = new MeshBasicMaterial({
        map: brush,
        transparent: false,
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
    mesh.position.z = 0.001
    mesh.material.opacity = 0.5
    mesh.scale.x = mesh.scale.y = 0.2
  }

  const trackMouse = () => {
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

    if (Math.abs(mouse.x - prevMouse.x) < 0.001 && Math.abs(mouse.y - prevMouse.y) < 0.001) return
    currentWave.current = (currentWave.current + 1) % steps
    prevMouse.x = mouse.x
    prevMouse.y = mouse.y
    setNewWave(mouse.x, mouse.y, currentWave.current)
  }

  useFrame(state => {
    trackMouse()
  }, -1)

  useFrame(state => {
    const { gl } = state
    gl.setRenderTarget(renderTarget)
    gl.render(otherScene, otherCamera.current)
    uniforms.uDisplacement.value = renderTarget.texture
    gl.setRenderTarget(null)

    // gl.render(otherScene, otherCamera.current)
  }, 0)

  const handlePointerMove = e => {
    mouse.x = (e.uv.x - 0.5) * 10
    mouse.y = (e.uv.y - 0.5) * 10
  }

  const frustumSize = 10
  const aspect = 10 / 10

  return (
    <>
      <mesh ref={mesh}>
        <planeBufferGeometry args={[10, 10, 1, 1]} />
        <shaderMaterial
          uniforms={uniforms}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          transparent={true}
        />
      </mesh>
      <OrthographicCamera
        manual
        ref={otherCamera}
        top={frustumSize / 2}
        bottom={frustumSize / -2}
        left={(frustumSize * aspect) / -2}
        right={(frustumSize * aspect) / 2}
        near={5}
        far={-5}
        position={[0, 0, 5]}
      />
      {createPortal(
        <>
          <group>
            <group ref={group} />
            <mesh onPointerMove={handlePointerMove} visible={false}>
              <planeBufferGeometry args={[10, 10, 1, 1]} />
              <meshNormalMaterial />
            </mesh>
          </group>
        </>,
        otherScene
      )}
    </>
  )
}
export default function FBOPaint2() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 20] }}>
      <CameraControls polarAngle={2.6} />
      <axesHelper args={[1]} />
      <Paint />
    </Canvas>
  )
}
