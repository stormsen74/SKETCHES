import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import { HEXAGRAM } from './hexagram.js'
import Coin from './Coin.js'
import Light from './Light'
import Table from './Table'
import { TRIGRAM } from './trigram.js'
import Camera from './Camera.js'
import ResultView from './ResultView.js'
import HexagramPreview from './HexagramPreview.js'
import { Button, Buttons, WrapperUI } from './styles.js'
import { Environment } from '@react-three/drei'

// https://www.youtube.com/watch?v=lN1lfXtrbzU
// https://en.wikipedia.org/wiki/Hexagram_(I_Ching)

// Todo fixTableCollider / Perf CoinCollider

export default function IChing() {
  const coin_1 = useRef()
  const coin_2 = useRef()
  const coin_3 = useRef()
  const [line, setLine] = useState([])
  const [hexagramLines, setHexagramLines] = useState([])
  const [isThrowing, setIsThrowing] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleThrow = () => {
    setIsThrowing(true)
    setLine([])
    coin_1.current.throw()
    coin_2.current.throw()
    coin_3.current.throw()
  }

  const handleReset = () => {
    setIsThrowing(false)
    coin_1.current.reset()
    coin_2.current.reset()
    coin_3.current.reset()
  }

  const onThrowEnd = (id, a) => {
    setLine(array => [...array, a])
  }

  const handleRestart = () => {
    console.log('handleRestart')

    setShowResult(false)
    setIsThrowing(false)
    setHexagramLines([])
    setLine([])
  }

  useEffect(() => {
    if (line.length === 3) {
      const value = line.reduce((total, value) => total + value)
      // yang = 7 || 9 # ying = 6 || 8
      const binaryValue = value === 7 || value === 9 ? 1 : 0
      const changing = value === 6 || value === 9
      setHexagramLines(array => [...array, { value: binaryValue, changing }])

      handleReset()
    }
  }, [line])

  useEffect(() => {
    if (hexagramLines.length === 0) return

    if (hexagramLines.length === 6) {
      setShowResult(true)
    }
  }, [hexagramLines])

  return (
    <>
      <Canvas shadows camera={{ fov: 35, position: [-10, 25, 40] }}>
        <Camera />
        <Environment preset='studio' background={true} blur={0.7} />
        <Light />

        <Physics debug={false}>
          <Coin id={1} ref={coin_1} position={[-7, 7.5, 0]} onThrowEnd={onThrowEnd} />
          <Coin id={2} ref={coin_2} position={[0, 7.5, 0]} onThrowEnd={onThrowEnd} />
          <Coin id={3} ref={coin_3} position={[7, 7.5, 0]} onThrowEnd={onThrowEnd} />

          <RigidBody type='fixed' position-y={-0.05} rotation={[-Math.PI / 2, 0, 0]} ccd={true}>
            <mesh>
              <boxGeometry args={[100, 100, 0.1]} />
              <meshBasicMaterial color={'#21586d'} transparent={true} opacity={0.75} visible={false} />
            </mesh>
          </RigidBody>
        </Physics>

        <Table />
      </Canvas>
      <WrapperUI>
        <ResultView show={showResult} hexagramLines={hexagramLines} handleRestart={handleRestart} />
        <HexagramPreview hexagramLines={hexagramLines} />
        {!showResult && (
          <Buttons>
            <Button onClick={handleThrow} disabled={isThrowing}>
              {hexagramLines.length === 0 ? 'ask the oracle' : 'throw again'}
            </Button>
            <Button onClick={handleReset}>{'reset coins'}</Button>
          </Buttons>
        )}
      </WrapperUI>
    </>
  )
}
