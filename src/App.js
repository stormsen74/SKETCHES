import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import texture from '/texture.jpg'
import dust from './assets/dustP.png'
import ReactP5_Setup from './sketches/p5/ReactP5_Setup'
import R3RapierSetup from './sketches/r3f/R3RapierSetup'
import DreiSampler from './sketches/r3f/Sampler'
import IChing from './sketches/r3f/IChing'
import DustParticles from './sketches/r3f/DustParticles'
import FakeGodRays from './sketches/r3f/FakeGodRays'
import SunWalk from './sketches/r3f/SunWalk/index.js'
import VertexParticles from './sketches/r3f/VertexParticles'

const Bla = styled.div`
  position: absolute;
  bottom: 0;
  width: 100px;
  height: 100px;
  background-color: aqua;
  background-image: url(${props => props.src});
  background-size: contain;
`

const App = () => {
  const [sketch, applySketch] = useState(null)

  useEffect(() => {
    setTimeout(() => {
      applySketch(<VertexParticles />)
    }, 0)

    return () => {
      applySketch(null)
    }
  }, [])

  return (
    <>
      {sketch}
      {/*<Bla src={texture} />*/}
    </>
  )
}

export default App
