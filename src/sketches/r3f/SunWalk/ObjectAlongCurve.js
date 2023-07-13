import { folder, useControls } from 'leva'
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import Curve from './Curve.js'
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Object3D,
  TextureLoader,
  Vector3,
} from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import glow from './assets/lensflare/15140473-sun_l.png'
import lensflare3 from './assets/lensflare/lensflare3.png'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
import gsap from 'gsap'

export default function ObjectAlongCurve() {
  const { progress, tension, resolution, dirLightTarget_pos } = useControls({
    progress: { value: 0.85, min: 0, max: 1, step: 0.001 },
    curve: folder({
      tension: { value: 0.6, min: 0, max: 1, step: 0.01 },
      resolution: { value: 32, min: 2, max: 50, step: 1 },
    }),
    dirLight: folder({
      dirLightTarget_pos: {
        value: [0, 0, 0],
        step: 0.1,
      },
    }),
  })

  const values = useMemo(() => {
    return { x: 0, color: 'rgb(196,110,110)' }
  }, [])

  const curve = useRef(new Curve(resolution, tension))
  const line = useRef(
    new Line(
      new BufferGeometry().setFromPoints(curve.current.getCurvePoints()),
      new LineBasicMaterial({ color: '#b50000' })
    )
  )
  const target = useRef(new Object3D())
  const pointLight = useRef(null)
  const sprite = useRef(null)
  const spriteMat = useRef(null)
  const dirLight = useRef(null)
  const tl = useRef(null)

  const [t_glow, t_lensflare3] = useLoader(TextureLoader, [glow, lensflare3])

  useEffect(() => {
    if (pointLight.current) {
      const lensflare = new Lensflare()
      lensflare.addElement(new LensflareElement(t_lensflare3, 60, 0.6))
      lensflare.addElement(new LensflareElement(t_lensflare3, 70, 0.7))
      lensflare.addElement(new LensflareElement(t_lensflare3, 120, 0.9))
      lensflare.addElement(new LensflareElement(t_lensflare3, 70, 1))
      pointLight.current.add(lensflare)
    }

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
  }, [])

  useLayoutEffect(() => {
    tl.current = gsap.timeline()
    tl.current.to(values, { x: 100, color: 'rgb(255,255,255)', duration: 0.5 })
    tl.current.to(values, { x: 200, color: 'rgb(196,110,110)', duration: 0.5 })
  }, [dirLight])

  useEffect(() => {
    curve.current = new Curve(resolution, tension)
    line.current = new Line(
      new BufferGeometry().setFromPoints(curve.current.getCurvePoints()),
      new LineBasicMaterial({ color: '#b50000' })
    )
  }, [resolution, tension])

  useEffect(() => {
    tl.current.progress(progress)
    // console.log(progress)
    // console.log(values.color)
    spriteMat.current.color = new Color(values.color)
    dirLight.current.color = new Color(values.color)
  }, [progress])

  useFrame(() => {
    const position = new Vector3()
    const tangent = new Vector3()
    const lookAt = new Vector3()

    position.copy(curve.current.getPointAt(progress))
    pointLight.current.position.copy(position)

    // target.current.position.copy(position)
    // tangent.copy(curve.current.getTangentAt(progress))
    // target.current.lookAt(lookAt.copy(position).sub(tangent))
  })

  return (
    <>
      <axesHelper position={dirLightTarget_pos} args={[3]} />
      <primitive position={dirLightTarget_pos} object={target.current} />

      <primitive object={line.current} />

      <pointLight ref={pointLight} intensity={0} visible={true}>
        <sprite ref={sprite} scale={[0.2, 0.2]} renderOrder={-10}>
          <spriteMaterial
            ref={spriteMat}
            map={t_glow}
            alphaMap={t_glow}
            blending={AdditiveBlending}
            sizeAttenuation={false}
            depthTest={true}
            depthWrite={false}
            transparent={true}
          />
        </sprite>
        <directionalLight target={target.current} ref={dirLight} castShadow={true} intensity={1} color={'#ffffff'} />
      </pointLight>

      <mesh castShadow={true} position={[0, 1.5, 0]}>
        <cylinderBufferGeometry args={[1, 1, 3]} />
        <meshStandardMaterial />
      </mesh>

      <mesh receiveShadow={true} scale={50} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <meshStandardMaterial color={'#2497ae'} />
      </mesh>
    </>
  )
}
