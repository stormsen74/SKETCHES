import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
import { useScrollCam } from '@src/sketches/r3f/ScrollCamSetup/useScrollCam.js'

const MAX_SCROLL = 3000

export default function ScrollHandler() {
  const requestRef = useRef(null)
  const deltaY = useRef(0)
  const scrollY = useRef(0)
  const smoothY = useRef(0)
  const touchStartY = useRef(0)
  const lastProgress = useRef(0)
  const setProgress = useScrollCam(state => state.setProgress)
  const setScrollSpeed = useScrollCam(state => state.setScrollSpeed)

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

  const update = () => {
    scrollY.current += deltaY.current
    scrollY.current = MathUtils.clamp(scrollY.current, -MAX_SCROLL, 0)
    smoothY.current = MathUtils.lerp(smoothY.current, -scrollY.current, 0.04)
    const progress = smoothY.current / MAX_SCROLL
    setProgress(progress)
    setScrollSpeed(progress - lastProgress.current)
    lastProgress.current = progress

    deltaY.current = 0
    requestRef.current = requestAnimationFrame(update)
  }

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    requestRef.current = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])
}
