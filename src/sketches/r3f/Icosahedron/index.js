import { Canvas } from '@react-three/fiber'
import { CameraControls, Environment, Line, MeshTransmissionMaterial, Wireframe } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { types } from './PlatonicTypes.js'
import { PolyhedronGeometry } from './PolyhedronGeometry.js'
import { useControls } from 'leva'
import { Face, VertexNode } from 'three/addons/math/ConvexHull.js'
import React, { useEffect, useMemo } from 'react'
import Light from '@src/sketches/r3f/IChing/Light.js'

// https://github.com/pmndrs/react-three-fiber/issues/279
// https://codesandbox.io/s/reactmeshtest-30g6t?file=/src/work.js

function FaceNormals({ faces }) {
  return faces.map((face, i) => {
    const vS = face.midpoint
    const vE = face.midpoint.clone().add(face.normal.clone().multiplyScalar(0.1))
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

function Ico({ radius, detail, project, wireframe }) {
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
    console.log('v:', vertices.length, ' f:', faces.length)
  }, [faces])

  return (
    <>
      <mesh geometry={polyhedronGeometry}>
        <meshStandardMaterial color={'#2e7989'} transparent={true} opacity={0.7} />
      </mesh>
      {wireframe && (
        <Wireframe
          geometry={polyhedronGeometry}
          stroke={'#000000'}
          thickness={0.03}
          squeeze={true}
          squeezeMin={0.3}
          squeezeMax={1}
          fillOpacity={0}
          colorBackfaces={true}
          // backfaceStroke={'#0000ff'}
        />
      )}
      <FaceNormals faces={faces} />
      <Hubs vertices={vertices} />
    </>
  )
}

export default function Icosahedron() {
  const { radius, detail, project, grid, wireframe } = useControls({
    radius: { value: 1, min: 1, max: 5, step: 0.01 },
    detail: { value: 0, min: 0, max: 3, step: 1 },
    wireframe: true,
    project: false,
    grid: false,
  })

  return (
    <Canvas camera={{ fov: 35, position: [-5, 5, 5] }}>
      <color attach='background' args={['#001a2e']} />
      <Environment files='./grey.exr' background={true} blur={0.35} />
      <Light />
      <Ico radius={radius} detail={detail} project={project} wireframe={wireframe} />
      {grid && <gridHelper args={[2, 2, '#000000']} />}
      <CameraControls />
    </Canvas>
  )
}
