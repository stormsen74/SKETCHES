import { Canvas, createPortal, extend, useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { CameraControls, useFBO } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, FloatType, NearestFilter, OrthographicCamera, RGBAFormat, Scene } from 'three'
import SimulationMaterial from './SimulationMaterial/index.js'
import vertexShader from './glsl/vert.glsl'
import fragmentShader from './glsl/frag.glsl'
import { useControls } from 'leva'

extend({ SimulationMaterial: SimulationMaterial })

// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

const Particles = () => {
  const size = 128

  const points = useRef()
  const simulationMaterialRef = useRef()

  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
  const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])

  const renderTarget = useFBO(size, size, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
  })

  const particlesPosition = useMemo(() => {
    const length = size * size
    const particles = new Float32Array(length * 3)
    for (let i = 0; i < length; i++) {
      const i3 = i * 3
      particles[i3 + 0] = (i % size) / size
      particles[i3 + 1] = i / size / size
    }
    return particles
  }, [size])

  const uniforms = useMemo(
    () => ({
      uPositions: {
        value: null,
      },
      uColor: { value: new Color('#ffffff') },
    }),
    []
  )

  const { showGrid, showRenderTex, factor, evolution, pColor } = useControls({
    showGrid: false,
    showRenderTex: false,
    factor: { value: 0.75, min: 0, max: 2, step: 0.01 },
    evolution: { value: 1.0, min: 0, max: 2, step: 0.01 },
    pColor: '#ffbb00',
  })

  useFrame(state => {
    const { gl, clock, delta } = state

    gl.setRenderTarget(renderTarget)
    gl.clear()
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    points.current.material.uniforms.uPositions.value = renderTarget.texture
    points.current.material.uniforms.uColor.value = new Color(pColor)

    simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    simulationMaterialRef.current.uniforms.uFactor.value = factor
    simulationMaterialRef.current.uniforms.uEvolution.value = evolution
  })

  return (
    <>
      {createPortal(
        <mesh>
          <simulationMaterial ref={simulationMaterialRef} args={[size]} />
          <bufferGeometry>
            <bufferAttribute attach='attributes-position' count={positions.length / 3} array={positions} itemSize={3} />
            <bufferAttribute attach='attributes-uv' count={uvs.length / 2} array={uvs} itemSize={2} />
          </bufferGeometry>
        </mesh>,
        scene
      )}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={particlesPosition.length / 3}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </points>

      {showRenderTex && (
        <sprite scale={[3, 3]} center={[0, 1]} renderOrder={-10}>
          <spriteMaterial
            map={renderTarget.texture}
            sizeAttenuation={true}
            depthTest={true}
            depthWrite={false}
            transparent={true}
          />
        </sprite>
      )}
      {showGrid && <gridHelper args={[10, 10, '#000000']} />}
    </>
  )
}

export default function FBOParticles() {
  return (
    <Canvas camera={{ fov: 35, position: [-10, 15, 20] }}>
      <color attach='background' args={['#001a2e']} />
      <Perf position='top-left' />
      <CameraControls />
      <Particles />
    </Canvas>
  )
}
