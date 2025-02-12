import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, TextureLoader, Vector2, Vector3, Vector4 } from 'three'
import simulationFrag from './glsl/simulationFrag.glsl'
import simulationVert from './glsl/simulationVert.glsl'

import black from './assets/black.png'
import styleMapImage from './assets/testPattern.png'
// import styleMapImage from './assets/reaction-diffusion-text.jpg'
import { useTweakpane } from './TweakpaneProvider'
import { presets } from './presets'

export const OffScreenScene = forwardRef((props, ref) => {
  const { size } = useThree()

  const [styleMapImageTexture, blackTexture] = useLoader(TextureLoader, [styleMapImage, black])

  console.log(blackTexture)

  const pane = useTweakpane()

  const PARAMS = useRef({
    feed: 0.023,
    kill: 0.055,
    dA: 1.0,
    dB: 0.5,
    feedM: 0.023,
    killM: 0.055,
    dAM: 1.0,
    dBM: 0.5,
    timestep: 1.0,
    brushRadius: 10.0,
    preset: 'Dfault',
    useStyleMap: true,
  })

  const sim_uniforms = useMemo(
    () => ({
      res: { value: new Vector2(props.res, props.res) },
      bufferTexture: { value: props.map },
      f: { value: PARAMS.current.feed },
      k: { value: PARAMS.current.kill },
      dA: { value: PARAMS.current.dA },
      dB: { value: PARAMS.current.dB },
      useStyleMap: { value: 1 },
      styleMapTexture: { value: styleMapImageTexture },
      styleMapResolution: { value: new Vector2(props.res, props.res) },
      styleMapParameters: {
        value: new Vector4(PARAMS.current.feedM, PARAMS.current.killM, PARAMS.current.dAM, PARAMS.current.dBM),
      },
      mouse: { value: new Vector3(0, 0, 0) },
      brushRadius: { value: 5 },
      timestep: { value: 1.0 },
    }),
    []
  )

  useEffect(() => {
    // Dropdown for presets
    const presetOptions = Object.keys(presets).reduce((acc, key) => {
      acc[key] = key
      return acc
    }, {})

    pane.addBinding({ preset: '-' }, 'preset', { options: presetOptions }).on('change', e => {
      const selectedPreset = presets[e.value]

      console.log(selectedPreset)

      PARAMS.current.feed = selectedPreset.feed
      PARAMS.current.kill = selectedPreset.kill

      ref.current.material.uniforms.f.value = selectedPreset.feed
      ref.current.material.uniforms.k.value = selectedPreset.kill

      pane.refresh()
    })
    pane.addBinding(PARAMS.current, 'brushRadius', { min: 0, max: 100, step: 1.0 }).on('change', e => {
      ref.current.material.uniforms.brushRadius.value = e.value
    })
    pane.addBinding(PARAMS.current, 'timestep', { min: 0, max: 2, step: 0.01 }).on('change', e => {
      ref.current.material.uniforms.timestep.value = e.value
    })

    pane.addBinding(PARAMS.current, 'useStyleMap').on('change', e => {
      ref.current.material.uniforms.useStyleMap.value = e.value ? 1.0 : 0.0
    })

    pane.addButton({ title: 'clear' }).on('click', () => {
      console.log('#c')
      ref.current.material.uniforms.bufferTexture.value = blackTexture
    })

    const folderA = pane.addFolder({ title: 'Base Params' })

    folderA.addBinding(PARAMS.current, 'feed', { min: 0, max: 0.1, step: 0.001 }).on('change', e => {
      ref.current.material.uniforms.f.value = e.value
    })
    folderA.addBinding(PARAMS.current, 'kill', { min: 0.03, max: 0.07, step: 0.001 }).on('change', e => {
      ref.current.material.uniforms.k.value = e.value
    })
    folderA.addBinding(PARAMS.current, 'dA', { min: 0, max: 1, step: 0.01 }).on('change', e => {
      ref.current.material.uniforms.dA.value = e.value
    })
    folderA.addBinding(PARAMS.current, 'dB', { min: 0, max: 1, step: 0.01 }).on('change', e => {
      ref.current.material.uniforms.dB.value = e.value
    })

    const folderB = pane.addFolder({ title: 'Mask Params' })

    folderB.addBinding(PARAMS.current, 'feedM', { min: 0, max: 0.1, step: 0.001 }).on('change', e => {
      ref.current.material.uniforms.styleMapParameters.value.x = e.value
    })
    folderB.addBinding(PARAMS.current, 'killM', { min: 0.03, max: 0.07, step: 0.001 }).on('change', e => {
      ref.current.material.uniforms.styleMapParameters.value.y = e.value
    })
    folderB.addBinding(PARAMS.current, 'dAM', { min: 0, max: 1, step: 0.01 }).on('change', e => {
      ref.current.material.uniforms.styleMapParameters.value.z = e.value
    })
    folderB.addBinding(PARAMS.current, 'dBM', { min: 0, max: 1, step: 0.01 }).on('change', e => {
      ref.current.material.uniforms.styleMapParameters.value.w = e.value
    })

    return () => {
      folderA.dispose()
      folderB.dispose()
    }
  }, [pane])

  return (
    <group>
      <mesh ref={ref}>
        <planeGeometry args={[size.width, size.height]} />
        <shaderMaterial vertexShader={simulationVert} fragmentShader={simulationFrag} uniforms={sim_uniforms} />
      </mesh>
    </group>
  )
})
