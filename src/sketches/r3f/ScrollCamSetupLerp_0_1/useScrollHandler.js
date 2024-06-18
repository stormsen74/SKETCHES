import { useEffect, useRef, useCallback } from 'react'
import { MathUtils } from 'three'
import { useScrollCam } from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/useScrollCam.js'

const MAX_SCROLL = 3000

const useScrollHandler = () => {
  const requestRef = useRef(null)
  const deltaY = useRef(0)
  const scrollY = useRef(0)
  const lastProgress = useRef(0)
  const scrollDirection = useRef(null)
  const setProgress = useScrollCam(state => state.setProgress)
  const setScrollSpeed = useScrollCam(state => state.setScrollSpeed)
  const timeout = useRef(null)
  const scrolling = useRef(false)

  const onWheel = event => {
    deltaY.current = event.wheelDeltaY || event.deltaY * -1
    clearTimeout(timeout.current)
    scrolling.current = true
    timeout.current = setTimeout(() => {
      const progress = useScrollCam.getState().progress
      scrolling.current = false
      setProgress(progress <= 0.5 ? 0 : 1)
    }, 1000)
  }

  const update = useCallback(() => {
    scrollY.current += deltaY.current
    scrollY.current = MathUtils.clamp(scrollY.current, -MAX_SCROLL, 0)
    const progress = Math.abs(-scrollY.current / MAX_SCROLL)
    if (scrolling.current) {
      setProgress(progress)
    }
    setScrollSpeed(progress - lastProgress.current)
    lastProgress.current = progress

    if (deltaY.current > 0) {
      scrollDirection.current = -1 // backward
    } else if (deltaY.current < 0) {
      scrollDirection.current = 1 // forward
    }

    deltaY.current = 0
    requestRef.current = requestAnimationFrame(update)
  }, [setProgress, setScrollSpeed])

  const startScroll = useCallback(() => {
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [update])

  const pauseScroll = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
  }, [])

  const resetScroll = useCallback((backward = false) => {
    scrollY.current = backward ? -MAX_SCROLL : 0
    setProgress(backward ? 1 : 0)
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    startScroll()

    return () => {
      window.removeEventListener('wheel', onWheel)
      pauseScroll()
    }
  }, [startScroll, pauseScroll])

  return { startScroll, pauseScroll, resetScroll, scrollDirection }
}

export default useScrollHandler
