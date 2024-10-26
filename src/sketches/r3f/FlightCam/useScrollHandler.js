import { useEffect, useRef, useCallback } from 'react'
import { MathUtils } from 'three'
import { useScrollStore } from '@src/sketches/r3f/FlightCam/useScrollStore.js'

const MAX_SCROLL = 6000

const useScrollHandler = () => {
  const requestRef = useRef(null)
  const deltaY = useRef(0)
  const scrollY = useRef(0)
  const smoothY = useRef(0)
  const touchStartY = useRef(0)
  const lastProgress = useRef(0)
  const setProgress = useScrollStore(state => state.setProgress)
  const setScrollSpeed = useScrollStore(state => state.setScrollSpeed)

  const onWheel = event => {
    deltaY.current = event.wheelDeltaY || event.deltaY * -1
  }

  const onTouchStart = event => {
    const t = event.targetTouches ? event.targetTouches[0] : event
    touchStartY.current = t.pageY
  }

  const onTouchMove = event => {
    const t = event.targetTouches ? event.targetTouches[0] : event
    deltaY.current = (t.pageY - touchStartY.current) * 10
    touchStartY.current = t.pageY
  }

  const update = useCallback(() => {
    scrollY.current += deltaY.current
    scrollY.current = MathUtils.clamp(scrollY.current, -MAX_SCROLL, 0)
    smoothY.current = MathUtils.lerp(smoothY.current, -scrollY.current, 0.04)
    const progress = smoothY.current / MAX_SCROLL
    setProgress(progress)
    setScrollSpeed(progress - lastProgress.current)
    lastProgress.current = progress

    deltaY.current = 0
    requestRef.current = requestAnimationFrame(update)
  }, [setProgress, setScrollSpeed])

  const start = useCallback(() => {
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [update])

  const pause = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    start()

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      pause()
    }
  }, [start, pause])

  return { start, pause }
}

export default useScrollHandler
