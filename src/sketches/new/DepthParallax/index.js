import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react' // Import useState
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import { Pane } from 'tweakpane' // Import Tweakpane

// --- Vertex Shader (unverändert) ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// --- Fragment Shader (OHNE Offset Clamping) ---
const fragmentShader = `
  precision highp float;

  uniform sampler2D uColorMap;
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uScale;
  uniform float uFocus;
  uniform bool uShowOffsetDebug; // Für Debug-Toggle
  // uniform float uMaxOffset; // <-- ENTFERNT

  varying vec2 vUv;

  void main() {
    
    float depthValue = texture2D(uDepthMap, vUv).r;

    // --- Depth Map Konvention ---
    // depthValue = 1.0 - depthValue; // <-- HIER ENTSCHEIDEN!

    float depthDifference = depthValue - uFocus;
    vec2 parallaxOffsetValue = uMouse * depthDifference * uScale;

    // --- KEIN Offset Clamping mehr ---
    // parallaxOffsetValue.x = clamp(parallaxOffsetValue.x, -uMaxOffset, uMaxOffset); // <-- ENTFERNT
    // parallaxOffsetValue.y = clamp(parallaxOffsetValue.y, -uMaxOffset, uMaxOffset); // <-- ENTFERNT

    vec2 displacedUv = vUv + parallaxOffsetValue;
    displacedUv = clamp(displacedUv, 0.0, 1.0); // Clamp final UVs weiterhin
    vec4 finalColor = texture2D(uColorMap, displacedUv);

    if (uShowOffsetDebug) {
        gl_FragColor = vec4(parallaxOffsetValue.x + 0.5, parallaxOffsetValue.y + 0.5, 0.0, 1.0);
    } else {
        gl_FragColor = finalColor;
    }
  }
`

// --- Custom Mesh Komponente (OHNE maxOffset Prop) ---
const Fake3DMesh = ({
  colorMap,
  depthMap,
  scaleFactor,
  focusPoint,
  showOffsetDebug,
  // maxOffset, // <-- ENTFERNT
}) => {
  const meshRef = useRef()
  const { viewport, gl } = useThree()
  const mouseRef = useRef(new THREE.Vector2(0, 0))
  const isHovering = useRef(false)

  // Plane Size Berechnung (unverändert)
  const planeSize = useMemo(() => {
    /* ... (wie oben) ... */
    if (!colorMap?.image) return [1, 1]
    const imgWidth = colorMap.image.naturalWidth
    const imgHeight = colorMap.image.naturalHeight
    const imgAspect = imgWidth / imgHeight
    const viewAspect = viewport.width / viewport.height
    let scaleX, scaleY
    if (imgAspect > viewAspect) {
      scaleX = viewport.width
      scaleY = viewport.width / imgAspect
    } else {
      scaleY = viewport.height
      scaleX = viewport.height * imgAspect
    }
    return [scaleX, scaleY]
  }, [colorMap, viewport])

  // Pointer Events (unverändert)
  const onPointerMove = event => {
    /* ... (wie oben) ... */
    isHovering.current = true
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    mouseRef.current.set(x, y)
  }
  const onPointerLeave = () => {
    isHovering.current = false
  }

  // Shader Material Argumente (OHNE uMaxOffset)
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uColorMap: { value: colorMap },
        uDepthMap: { value: depthMap },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScale: { value: scaleFactor },
        uFocus: { value: focusPoint },
        uShowOffsetDebug: { value: showOffsetDebug },
        // uMaxOffset: { value: maxOffset }, // <-- ENTFERNT
      },
      vertexShader,
      fragmentShader,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorMap, depthMap, scaleFactor, focusPoint, showOffsetDebug /*, maxOffset*/] // <-- maxOffset aus Abhängigkeiten entfernt
  )

  // Frame-Update (OHNE uMaxOffset)
  useFrame((state, delta) => {
    if (meshRef.current?.material) {
      if (!isHovering.current) {
        mouseRef.current.lerp(new THREE.Vector2(0, 0), 5 * delta)
      }
      meshRef.current.material.uniforms.uMouse.value.copy(mouseRef.current)
      meshRef.current.material.uniforms.uScale.value = scaleFactor
      meshRef.current.material.uniforms.uFocus.value = focusPoint
      meshRef.current.material.uniforms.uShowOffsetDebug.value = showOffsetDebug
      // meshRef.current.material.uniforms.uMaxOffset.value = maxOffset; // <-- ENTFERNT
    }
  })

  return (
    <mesh
      ref={meshRef}
      onPointerMove={onPointerMove}
      onPointerEnter={() => (isHovering.current = true)}
      onPointerLeave={onPointerLeave}
    >
      <planeGeometry args={planeSize} />
      <shaderMaterial
        args={[shaderArgs]}
        key={fragmentShader + vertexShader + showOffsetDebug} // Key bleibt gleich
      />
    </mesh>
  )
}

// --- Hauptkomponente (OHNE Tweakpane für neue Optionen) ---
const DepthParallax = () => {
  // Deine Bildpfade
  const colorMap = useLoader(TextureLoader, './depth/emerald.png')
  const depthMap = useLoader(TextureLoader, './depth/ed.png')

  const paneContainerRef = useRef(null)
  const paneRef = useRef(null)

  // State für die kontrollierten Werte (OHNE Optimierungs-States)
  const [scaleFactor, setScaleFactor] = useState(0.015)
  const [focusPoint, setFocusPoint] = useState(0.15) // 3 Nachkommastellen beibehalten
  const [showOffsetDebug, setShowOffsetDebug] = useState(false)
  const [colorFlipY, setColorFlipY] = useState(true)
  const [depthFlipY, setDepthFlipY] = useState(true)
  // const [depthFilterNearest, setDepthFilterNearest] = useState(false); // <-- ENTFERNT
  // const [maxOffset, setMaxOffset] = useState(0.05); // <-- ENTFERNT

  // Tweakpane Initialisierung (OHNE Optimierungs-Controls)
  useEffect(() => {
    if (!paneContainerRef.current || paneRef.current) return
    const pane = new Pane({ container: paneContainerRef.current, title: 'Controls' })
    paneRef.current = pane

    const PARAMS = {
      scaleFactor,
      focusPoint,
      showOffsetDebug,
      colorFlipY,
      depthFlipY,
      // depthFilterNearest, // <-- ENTFERNT
      // maxOffset           // <-- ENTFERNT
    }

    const parallaxFolder = pane.addFolder({ title: 'Parallax Controls' })
    const debugFolder = pane.addFolder({ title: 'Debug' }) // Nur Debug-Toggle
    const textureFolder = pane.addFolder({ title: 'Texture Settings' })

    parallaxFolder
      .addBinding(PARAMS, 'scaleFactor', {
        label: 'Scale (Stärke)',
        min: 0,
        max: 0.15,
        step: 0.001,
        format: v => v.toFixed(3),
      })
      .on('change', ev => setScaleFactor(ev.value))
    parallaxFolder
      .addBinding(PARAMS, 'focusPoint', { label: 'Focus', min: 0, max: 1, step: 0.001, format: v => v.toFixed(3) })
      .on('change', ev => setFocusPoint(ev.value))

    // Nur Debug-Toggle im Debug-Ordner
    debugFolder
      .addBinding(PARAMS, 'showOffsetDebug', { label: 'Show Offset Debug' })
      .on('change', ev => setShowOffsetDebug(ev.value))
    // KEIN MaxOffset Control mehr

    textureFolder
      .addBinding(PARAMS, 'colorFlipY', { label: 'Flip Color Map Y' })
      .on('change', ev => setColorFlipY(ev.value))
    textureFolder
      .addBinding(PARAMS, 'depthFlipY', { label: 'Flip Depth Map Y' })
      .on('change', ev => setDepthFlipY(ev.value))
    // KEIN Depth Filter Control mehr

    return () => {
      paneRef.current?.dispose()
      paneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Textur FlipY Effekt (unverändert) ---
  useEffect(() => {
    /* ... (wie oben) ... */
    if (colorMap) {
      if (colorMap.flipY !== colorFlipY) {
        colorMap.flipY = colorFlipY
        colorMap.needsUpdate = true
      }
    }
  }, [colorMap, colorFlipY])

  useEffect(() => {
    /* ... (wie oben) ... */
    if (depthMap) {
      if (depthMap.flipY !== depthFlipY) {
        depthMap.flipY = depthFlipY
        depthMap.needsUpdate = true
      }
    }
  }, [depthMap, depthFlipY])

  // --- KEIN Depth Map Filter Effekt mehr ---
  // useEffect(() => { ... }, [depthMap, depthFilterNearest]); // <-- ENTFERNT

  // Initiale Textur Einstellungen (Setzt Filter auf Linear)
  useEffect(() => {
    if (colorMap) {
      colorMap.minFilter = THREE.LinearFilter
      colorMap.magFilter = THREE.LinearFilter
      if (colorMap.flipY !== colorFlipY) {
        colorMap.flipY = colorFlipY
        colorMap.needsUpdate = true
      }
    }
    if (depthMap) {
      // Stelle sicher, dass der Filter Linear ist
      depthMap.minFilter = THREE.LinearFilter
      depthMap.magFilter = THREE.LinearFilter
      if (depthMap.flipY !== depthFlipY) {
        depthMap.flipY = depthFlipY
        depthMap.needsUpdate = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMap, depthMap, colorFlipY, depthFlipY]) // Behalte Abhängigkeiten

  const paneStyle = {
    /* ... (wie oben) ... */ position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 10,
    width: '280px',
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={paneContainerRef} style={paneStyle}></div>
      <Canvas style={{ background: '#333', width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          {colorMap && depthMap && (
            <Fake3DMesh
              colorMap={colorMap}
              depthMap={depthMap}
              scaleFactor={scaleFactor}
              focusPoint={focusPoint}
              showOffsetDebug={showOffsetDebug}
              // maxOffset={maxOffset} // <-- ENTFERNT
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

export default DepthParallax
