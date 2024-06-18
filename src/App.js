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
import FBOParticles from './sketches/r3f/FBOParticles'
import Icosahedron from './sketches/r3f/Icosahedron'
import ImageHoverReveal from './sketches/r3f/ImageHoverReveal'
import ImageUVCoordinates from './sketches/r3f/ImageUVCoordinates'
import OrbitingWisps from './sketches/r3f/OrbitingWisps'
import Bending from '@src/sketches/r3f/Bending/Bending.js'
import ShaderTest from '@src/sketches/r3f/ShaderTest/index.js'
import FBOPaint from '@src/sketches/r3f/FBOPaint/index.js'
import FBOPaint2 from '@src/sketches/r3f/FBOPaint2/index.js'
import PortalSetup from '@src/sketches/r3f/PortalSetup/index.js'
import SimpleTree from '@src/sketches/r3f/SimpleTree/index.js'
import LorenzAttractor from '@src/sketches/r3f/LorenzAttractor/index.js'
import ScrollCamSetup from '@src/sketches/r3f/ScrollCamSetup/index.js'
import ScrollCamSetupLerp_0_1 from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/index.js'

const Bla = styled.div`
  position: absolute;
  bottom: 0;
  width: 100px;
  height: 100px;
  background-color: aqua;
  background-image: url(${props => props.src});
  background-size: contain;
`

// Potential Sketches

// ~ isolines
// https://github.com/winkerVSbecks/sketchbook/blob/master/basic-noise.js

const App = () => {
  const [sketch, applySketch] = useState(null)

  useEffect(() => {
    setTimeout(() => {
      applySketch(<ScrollCamSetupLerp_0_1 />)
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
