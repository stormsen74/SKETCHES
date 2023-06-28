import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import coin from './assets/chinese_coin.glb'
import { Quaternion, Vector3 } from 'three'
import { CylinderCollider, RigidBody } from '@react-three/rapier'

// Sketchfab-Source
// https://sketchfab.com/3d-models/chinese-coin-384f557db51a407e807c59af188cc9cc

const Coin = forwardRef(({ id, position, onThrowEnd = () => {} }, ref) => {
  const { scene, nodes } = useGLTF(coin)
  const coinRef = useRef()
  const coinMeshRef = useRef()
  const [numContacts, setNumContacts] = useState(0)

  useLayoutEffect(() => {
    scene.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
    coinMeshRef.current.traverse(o => o.isMesh && (o.castShadow = o.receiveShadow = true))
  }, [])

  useEffect(() => {
    // const position = vec3(coinRef.current.translation())
    // const rotation = coinRef.current.lineVel()
    // console.log(coinRef.current.linevel())

    if (coinRef.current) {
      coinRef.current.setAngvel(getRandomAngularVelocity(), true)
    }
  }, [])

  const randomBetween = (min, max) => {
    return Math.random() * (max - min) + min
  }

  const getRandomAngularVelocity = () => {
    const signA = Math.random() > 0.5 ? 1 : -1
    const signB = Math.random() > 0.5 ? 1 : -1
    const signC = Math.random() > 0.5 ? 1 : -1
    return new Vector3(signA * randomBetween(1, 2), signB * randomBetween(1, 3), signC * randomBetween(1, 2))
  }

  const applyRandomTorqueImpulse = () => {
    const signA = Math.random() > 0.5 ? 1 : -1
    const signB = Math.random() > 0.5 ? 1 : -1
    const signC = Math.random() > 0.5 ? 1 : -1
    coinRef.current.applyTorqueImpulse(
      { x: signA * randomBetween(60, 120), y: signC * randomBetween(100, 300), z: signB * randomBetween(60, 120) },
      true
    )
  }

  useImperativeHandle(ref, () => ({
    throw() {
      applyRandomTorqueImpulse()
      coinRef.current.setGravityScale(3, true)
      coinRef.current.setAngularDamping(1, true)
    },

    reset() {
      setNumContacts(0)
      const vPos = new Vector3().fromArray(position)
      coinRef.current.resetForces()
      coinRef.current.resetTorques()
      coinRef.current.setGravityScale(0)
      coinRef.current.setAngularDamping(0)
      coinRef.current.setTranslation(vPos)
      coinRef.current.setLinvel(new Vector3())
      coinRef.current.setRotation(new Quaternion())
      // coinRef.current.sleep()
      coinRef.current.setAngvel(getRandomAngularVelocity(), true)
    },
  }))

  useEffect(() => {
    if (numContacts >= 5) {
      setNumContacts(0)
      applyRandomTorqueImpulse()
    }
  }, [numContacts])

  return (
    <RigidBody
      ref={coinRef}
      colliders={false}
      type={'dynamic'}
      restitution={1}
      angularDamping={0}
      gravityScale={0}
      ccd={true}
      position={position}
      rotation={[0, 0, 0]}
      name={'coin' + id}
      onSleep={() => {
        const yang = 3
        const ying = 2
        onThrowEnd(id, coinMeshRef.current.parent.rotation.x < 0 ? yang : ying)
      }}
      onCollisionEnter={({ manifold, target, other }) => {
        if (other.rigidBodyObject.name) {
          setNumContacts(numContacts + 1)
        }
      }}
    >
      <primitive ref={coinMeshRef} renderOrder={1} castShadow={true} object={scene.clone(true)} />
      <CylinderCollider args={[0.15, 2.85]} rotation={[Math.PI * 0.5, 0, 0]} />
    </RigidBody>
  )
})

export default Coin
