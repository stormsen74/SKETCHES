// // Potential Sketches

// // ~ isolines
// // https://github.com/winkerVSbecks/sketchbook/blob/master/basic-noise.js

// Updated App.js with dynamic routing for R3F sketches
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { sketches } from './sketches/config'
import UILayer from './ui/UILayer'
import styled from 'styled-components'

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

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Dynamically generate routes for each sketch */}
        {sketches.map((sketch, index) => (
          <Route
            key={index}
            path={`/${sketch.name.replace(/\s+/g, '-').toLowerCase()}`}
            element={<SketchWrapper>{sketch.component}</SketchWrapper>}
          />
        ))}
        {/* Default route rendering UILayer */}
        <Route
          path='/'
          element={
            <UILayer
              sketches={sketches}
              sketch={null}
              handleSelectSketch={selectedSketch => {
                window.location.href = `/${selectedSketch.name.replace(/\s+/g, '-').toLowerCase()}`
              }}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
