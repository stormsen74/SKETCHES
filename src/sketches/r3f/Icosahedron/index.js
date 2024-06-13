import { Canvas } from '@react-three/fiber'
import { CameraControls, Environment, Html, Line, MeshTransmissionMaterial, Wireframe } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { types } from './PlatonicTypes.js'
import { PolyhedronGeometry } from './PolyhedronGeometry.js'
import { useControls } from 'leva'
import { Face, VertexNode } from 'three/addons/math/ConvexHull.js'
import React, { useEffect, useMemo, useRef } from 'react'
import Light from '@src/sketches/r3f/IChing/Light.js'
import styled from 'styled-components'

// https://github.com/pmndrs/react-three-fiber/issues/279
// https://codesandbox.io/s/reactmeshtest-30g6t?file=/src/work.js

const vertexInArray = (vertices, vertexNode) => {
  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i].point
    if (p.equals(vertexNode.point)) {
      return true
    }
  }
  return false
}

const Shape = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(116, 116, 116, 0.51);
  font-size: 9px;
  letter-spacing: 0.7px;
`
class Edge {
  constructor(vS, vE) {
    this.points = [vS, vE]
  }
}
class GeoFace {
  constructor(midpoint, normal, points) {
    this.midpoint = midpoint
    this.normal = normal
    this.points = points
    this.edges = [
      new Edge(this.points[0], this.points[1]),
      new Edge(this.points[1], this.points[2]),
      new Edge(this.points[2], this.points[0]),
    ]
  }

  getEdge(index) {
    return this.edges[index]
  }
}

function DebugLines({ faces, detail }) {
  console.log(faces)

  const { index } = useControls(
    {
      index: { value: 0, min: 0, max: faces.length, step: 1 },
    },
    [faces]
  )

  const edges = useMemo(() => {
    const _edges = []
    for (let i = 0; i < index; i++) {
      const f = faces[i]
      const e1 = f.getEdge(0)
      const e2 = f.getEdge(1)
      const e3 = f.getEdge(2)
      _edges.push(e1, e2, e3)
    }
    return _edges
  }, [faces, index, detail])

  return edges.map((edge, i) => {
    return (
      <Line
        key={i}
        points={[edge.points[0].point.toArray(), edge.points[1].point.toArray()]}
        color={'#e9e222'}
        lineWidth={1}
      />
    )
  })
}

function FaceNormals({ faces }) {
  console.log(faces)
  return faces.map((face, i) => {
    const vS = face.midpoint
    const vE = face.midpoint.clone().add(face.normal.clone().multiplyScalar(0.1))
    return (
      <>
        <Line
          key={i}
          points={[
            [vS.x, vS.y, vS.z],
            [vE.x, vE.y, vE.z],
          ]}
          color={'#ff9d00'}
          lineWidth={1}
        />

        <group position={vS.toArray()}>
          <Html zIndexRange={[0, 50]} transform={false} sprite={false} distanceFactor={10} center={true}>
            <Shape>{i}</Shape>
          </Html>
        </group>
      </>
    )
  })
}

function Hubs({ hubs }) {
  return hubs.map((hub, i) => {
    const vS = hub.pos
    const vE = hub.pos.clone().multiplyScalar(1.1)

    return (
      <>
        <Line
          key={i}
          points={[
            [vS.x, vS.y, vS.z],
            [vE.x, vE.y, vE.z],
          ]}
          color={'#f20000'}
          lineWidth={3}
        />
      </>
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
  // console.log(polyhedronGeometry)

  const vertices = useMemo(() => {
    const _vertices = []
    for (let i = 0; i < polyhedronGeometry.attributes.position.array.length; i += 3) {
      const vertexBuffer = polyhedronGeometry.attributes.position.array
      const x = vertexBuffer[i + 0]
      const y = vertexBuffer[i + 1]
      const z = vertexBuffer[i + 2]
      const v = new Vector3(x, y, z)
      // const n = new VertexNode(v)
      const n = { point: v }
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
      const geoFace = new GeoFace(t.midpoint, t.normal, [a, b, c])
      _faces.push(geoFace)
    }
    return _faces
  }, [vertices])

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

  useEffect(() => {
    // console.log('v:', vertices, ' f:', faces)
  }, [faces])

  return (
    <>
      {/*<mesh geometry={polyhedronGeometry}>*/}
      {/*  /!*<meshStandardMaterial color={'#2e7989'} transparent={true} opacity={0.7} />*!/*/}
      {/*  /!*<meshNormalMaterial transparent={true} opacity={0.7} />*!/*/}
      {/*</mesh>*/}
      <DebugLines faces={faces} detail={detail} />
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
      <Hubs hubs={hubs} />
    </>
  )
}

export default function Icosahedron() {
  const { radius, detail, project, grid, wireframe } = useControls({
    radius: { value: 1, min: 1, max: 5, step: 0.01 },
    detail: { value: 0, min: 0, max: 3, step: 1 },
    wireframe: false,
    project: false,
    grid: false,
  })

  return (
    <Canvas camera={{ fov: 35, position: [-5, 5, 5] }}>
      <color attach='background' args={['#001a2e']} />
      {/*<Environment files='./grey.exr' background={true} blur={0.35} />*/}
      {/*<Light />*/}
      <Ico radius={radius} detail={detail} project={project} wireframe={wireframe} />
      {grid && <gridHelper args={[2, 2, '#000000']} />}
      <CameraControls />
    </Canvas>
  )
}
