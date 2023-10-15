import { Canvas } from '@react-three/fiber'
import { CameraControls, Line, Wireframe } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { types } from './PlatonicTypes.js'
import { PolyhedronGeometry } from './PolyhedronGeometry.js'
import { useControls } from 'leva'
import { Face, VertexNode } from 'three/addons/math/ConvexHull.js'
import { useEffect, useMemo, useRef } from 'react'
import React from 'react'

// https://github.com/pmndrs/react-three-fiber/issues/279
// https://codesandbox.io/s/reactmeshtest-30g6t?file=/src/work.js

function FaceNormals({ faces }) {
  return faces.map((face, i) => {
    const vS = face.midpoint
    const vE = face.midpoint.clone().add(face.normal.clone().multiplyScalar(0.3))
    return (
      <Line
        key={i}
        points={[
          [vS.x, vS.y, vS.z],
          [vE.x, vE.y, vE.z],
        ]}
        color={'#ff9d00'}
        lineWidth={1}
      />
    )
  })
}

const vertexInArray = (vertices, vertexNode) => {
  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i].point
    if (p.equals(vertexNode.point)) {
      return true
    }
  }
  return false
}

function Hubs({ vertices }) {
  const hubs = useMemo(() => {
    const _hubs = []
    const _temp = []
    let index = 0
    for (let i = 0; i < vertices.length; i++) {
      const vertexNode = vertices[i]
      if (!vertexInArray(_temp, vertexNode)) {
        _temp.push(vertexNode)
        const hub = { index: index, pos: vertexNode.point }
        _hubs.push(hub)
        index += 1
      }
    }
    return _hubs
  }, [vertices])

  return hubs.map((hub, i) => {
    const vS = hub.pos
    const vE = hub.pos.clone().multiplyScalar(1.1)

    return (
      <Line
        key={i}
        points={[
          [vS.x, vS.y, vS.z],
          [vE.x, vE.y, vE.z],
        ]}
        color={'#1cb2a2'}
        lineWidth={3}
      />
    )
  })
}

function Ico({ radius, detail, project }) {
  const polyhedronGeometry = new PolyhedronGeometry(
    types.icosahedron.vertices,
    types.icosahedron.indices,
    radius,
    detail,
    project
  )
  polyhedronGeometry.rotateZ(MathUtils.degToRad(58.25 + 90))
  console.log(polyhedronGeometry)

  const vertices = useMemo(() => {
    const _vertices = []
    for (let i = 0; i < polyhedronGeometry.attributes.position.array.length; i += 3) {
      const vertexBuffer = polyhedronGeometry.attributes.position.array
      const x = vertexBuffer[i + 0]
      const y = vertexBuffer[i + 1]
      const z = vertexBuffer[i + 2]
      const v = new Vector3(x, y, z)
      const n = new VertexNode(v)
      _vertices.push(n)
    }
    return _vertices
  }, [radius, detail, project])

  const faces = useMemo(() => {
    const _faces = []
    for (let i = 0; i < vertices.length; i += 3) {
      const a = vertices[i + 0]
      const b = vertices[i + 1]
      const c = vertices[i + 2]
      const t = Face.create(a, b, c)
      _faces.push(t)
    }
    return _faces
  }, [vertices])

  useEffect(() => {
    console.log('!', vertices.length, faces.length)
  }, [faces])

  return (
    <>
      <mesh geometry={polyhedronGeometry}>
        <meshBasicMaterial color={'#1c3a97'} transparent={true} opacity={0.5} />
      </mesh>
      <Wireframe geometry={polyhedronGeometry} stroke={'#000000'} thickness={0.05} squeeze={false} />
      <FaceNormals faces={faces} />
      <Hubs vertices={vertices} />
    </>
  )
}

export default function Icosahedron() {
  const { radius, detail, project, grid } = useControls({
    radius: { value: 1, min: 1, max: 5, step: 0.01 },
    detail: { value: 0, min: 0, max: 3, step: 1 },
    project: false,
    grid: false,
  })

  return (
    <Canvas camera={{ fov: 35, position: [-5, 5, 5] }}>
      <color attach='background' args={['#001a2e']} />
      <Ico radius={radius} detail={detail} project={project} />
      {grid && <gridHelper args={[2, 2, '#000000']} />}
      <CameraControls />
    </Canvas>
  )
}
