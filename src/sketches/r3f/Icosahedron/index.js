import { Canvas } from '@react-three/fiber'
import { CameraControls, Wireframe } from '@react-three/drei'
import { MathUtils, Mesh, MeshBasicMaterial, SphereGeometry, Triangle, Vector3 } from 'three'
import { types } from './PlatonicTypes.js'
import { PolyhedronGeometry } from './PolyhedronGeometry.js'
import { useControls } from 'leva'
import { Face, VertexNode } from 'three/addons/math/ConvexHull.js'
import { useEffect, useMemo, useRef } from 'react'

// https://github.com/pmndrs/react-three-fiber/issues/279
// https://codesandbox.io/s/reactmeshtest-30g6t?file=/src/work.js

function Ico({ radius, detail, project }) {
  const groupDebug = useRef()

  const polyhedronGeometry = new PolyhedronGeometry(
    types.icosahedron.vertices,
    types.icosahedron.indices,
    radius,
    detail,
    project
  )
  polyhedronGeometry.rotateZ(MathUtils.degToRad(58.25 + 90))
  // console.log(polyhedronGeometry)

  const verts = useRef([])
  const tris = useRef([])

  useEffect(() => {
    remove()
    verts.current = []
    tris.current = []

    for (let i = 0; i < polyhedronGeometry.attributes.position.array.length; i += 3) {
      const vertexBuffer = polyhedronGeometry.attributes.position.array

      const x = vertexBuffer[i + 0]
      const y = vertexBuffer[i + 1]
      const z = vertexBuffer[i + 2]
      const v = new Vector3(x, y, z)
      verts.current.push(v)
    }
  }, [radius, detail, project])

  useEffect(() => {
    const vertices = verts.current
    for (let i = 0; i < vertices.length; i += 3) {
      const a = vertices[i + 0]
      const b = vertices[i + 1]
      const c = vertices[i + 2]
      const t = new Triangle(a, b, c)
      tris.current.push(t)
    }
  }, [verts.current])

  const remove = () => {
    for (let i = groupDebug.current.children.length - 1; i >= 0; i--) {
      const child = groupDebug.current.children[i]
      child.material.dispose()
      groupDebug.current.remove(child)
    }
  }

  useEffect(() => {
    console.log('!', tris.current.length)

    for (let i = 0; i < tris.current.length; i++) {
      const triangle = tris.current[i]
      const midpoint = new Vector3()
      triangle.getMidpoint(midpoint)

      const geometry = new SphereGeometry(0.05, 16, 16)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      const sphere = new Mesh(geometry, material)
      sphere.position.set(midpoint.x, midpoint.y, midpoint.z)
      groupDebug.current.add(sphere)
    }
  }, [tris.current])

  return (
    <>
      <mesh geometry={polyhedronGeometry}>
        <meshBasicMaterial color={'#a4cb9c'} transparent={true} opacity={0.5} />
      </mesh>
      <Wireframe geometry={polyhedronGeometry} stroke={'#000000'} thickness={0.05} squeeze={false} />
      <group dispose={null} ref={groupDebug} />
    </>
  )
}

export default function Icosahedron() {
  const { radius, detail, project } = useControls({
    radius: { value: 1, min: 1, max: 5, step: 0.01 },
    detail: { value: 0, min: 0, max: 2, step: 1 },
    project: false,
  })

  return (
    <Canvas camera={{ fov: 35, position: [-5, 5, 5] }}>
      <color attach='background' args={['#001a2e']} />
      <Ico radius={radius} detail={detail} project={project} />
      <gridHelper args={[2, 2, '#000000']} />
      <CameraControls />
    </Canvas>
  )
}
