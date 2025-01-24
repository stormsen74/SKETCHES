import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Pane } from 'tweakpane'

const TweakpaneContext = createContext(null)

export const TweakpaneProvider = ({ children }) => {
  const paneRef = useRef(null)
  const [pane, setPane] = useState(null)

  useEffect(() => {
    paneRef.current = new Pane()
    setPane(paneRef.current)
    return () => {
      paneRef.current.dispose()
    }
  }, [])

  return <TweakpaneContext.Provider value={pane}>{children}</TweakpaneContext.Provider>
}

export const useTweakpane = () => {
  const context = useContext(TweakpaneContext)
  if (!context) {
    throw new Error('useTweakpane must be used within a TweakpaneProvider')
  }
  return context
}
