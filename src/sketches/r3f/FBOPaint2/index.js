import { Canvas, createPortal, useFrame, useLoader } from '@react-three/fiber'
import { CameraControls, OrthographicCamera, useFBO, useHelper } from '@react-three/drei'
import {
  AdditiveBlending,
  CameraHelper,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
} from 'three'
import React, { forwardRef, useEffect, useMemo, useRef } from 'react'
import brushTex from './burash01.png'
import uvTex from './base.jpg'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'
import { useControls } from 'leva'

// https://www.youtube.com/watch?v=vWAci72MtME
// https://gracious-keller-98ef35.netlify.app/docs/recipes/heads-up-display-rendering-multiple-scenes/

const RenderCamera = forwardRef(({ size }, ref) => {
  const frustumSize = size.h
  const aspect = size.w / size.h
  return (
    <OrthographicCamera
      manual
      ref={ref}
      top={frustumSize / 2}
      bottom={frustumSize / -2}
      left={(frustumSize * aspect) / -2}
      right={(frustumSize * aspect) / 2}
      near={5}
      far={-5}
      position={[0, 5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
})

const size = { w: 15, h: 15 }
const ppm = 64
const targetResolution = { w: size.w * ppm, h: size.h * ppm }

const steps = 100

function Paint() {
  const containerWaves = useRef()
  const renderCamera = useRef()
  const otherScene = new Scene()
  const uv_pos = useMemo(() => {
    return new Vector2()
  }, [])
  const prev_uv_pos = useMemo(() => {
    return new Vector2()
  }, [])
  const currentWave = useRef(0)
  const [brush, uv] = useLoader(TextureLoader, [brushTex, uvTex])
  const meshes = useMemo(() => {
    return []
  }, [])

  const renderTarget = useFBO(targetResolution.w, targetResolution.h, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
  })

  const { camHelper } = useControls({
    camHelper: true,
  })

  useHelper(camHelper ? renderCamera : null, CameraHelper, 1)

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
      containerWaves.current.add(mesh)
      meshes.push(mesh)
    }
  }, [])

  const setNewWave = (x, y, index) => {
    const mesh = meshes[index]
    if (!mesh) return
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

    if (Math.abs(uv_pos.x - prev_uv_pos.x) < 0.001 && Math.abs(uv_pos.y - prev_uv_pos.y) < 0.001) return
    currentWave.current = (currentWave.current + 1) % steps
    prev_uv_pos.x = uv_pos.x
    prev_uv_pos.y = uv_pos.y
    setNewWave(uv_pos.x, uv_pos.y, currentWave.current)
  }

  useFrame(state => {
    trackMouse()
  }, -1)

  useFrame(state => {
    const { gl } = state
    gl.setRenderTarget(renderTarget)
    gl.render(otherScene, renderCamera.current)
    uniforms.uDisplacement.value = renderTarget.texture
    gl.setRenderTarget(null)
    // gl.clear()

    // gl.render(otherScene, oth erCamera.current)
  }, 0)

  const handlePointerMove = e => {
    uv_pos.x = (e.uv.x - 0.5) * size.w
    uv_pos.y = (e.uv.y - 0.5) * size.h
  }

  const plane = useMemo(() => {
    const geometry = new PlaneGeometry(size.w, size.h, 1, 1)
    const material = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    })
    return new Mesh(geometry, material)
  }, [])

  return (
    <>
      <primitive object={plane} rotation={[-Math.PI / 2, 0, 0]} />
      <RenderCamera size={size} ref={renderCamera} />
      {createPortal(
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <group ref={containerWaves} />
          <mesh onPointerMove={handlePointerMove} visible={false}>
            <planeBufferGeometry args={[size.w, size.h, 1, 1]} />
          </mesh>
        </group>,
        otherScene
      )}
    </>
  )
}
export default function FBOPaint2() {
  const { showAxes } = useControls({
    showAxes: false,
  })

  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 20] }}>
      <CameraControls polarAngle={1.2} />
      {showAxes && <axesHelper args={[3]} />}
      <Paint />
    </Canvas>
  )
}
