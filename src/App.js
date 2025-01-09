import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { sketches } from './sketches/config.js'
import UILayer from './ui/UILayer'

const SketchWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
`

// Potential Sketches

// ~ isolines
// https://github.com/winkerVSbecks/sketchbook/blob/master/basic-noise.js

// Reaction diffusion
// https://codepen.io/forerunrun/pen/poONERw
// https://www.shadertoy.com/view/WlSGzy

const App = () => {
  const [sketch, applySketch] = useState(null)

  const handleSelectSketch = sketchComponent => {
    applySketch(sketchComponent)
  }

  useEffect(() => {
    // applySketch(sketches[sketches.length - 1].component)

    return () => {
      applySketch(null)
    }
  }, [])

  return (
    <>
      <UILayer sketches={sketches} sketch={sketch} handleSelectSketch={handleSelectSketch} />
      <SketchWrapper>{sketch}</SketchWrapper>
      {/*<Bla src={texture} />*/}
    </>
  )
}

export default App

// Styled Components
