import table from './assets/table.glb'
import { useGLTF } from '@react-three/drei'

export default function Table() {
  const { scene } = useGLTF(table)

  return (
    <>
      <primitive renderOrder={1} receiveShadow={true} object={scene.clone()} />
      <mesh receiveShadow scale={100} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.7} color={'#18100a'} />
      </mesh>
    </>
  )
}
