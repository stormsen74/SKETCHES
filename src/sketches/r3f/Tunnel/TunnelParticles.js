import { InstancedBufferAttribute, NormalBlending, Object3D, TextureLoader } from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useScrollStore } from '@src/sketches/r3f/Tunnel/useScrollStore.js'
import { randFloat } from 'three/src/math/MathUtils.js'
import tex from './assets/circle-blur.png'

const particleCount = 50 // Number of particles
const innerRadius = 7 // Inner radius of the circle
const outerRadius = 16 // Outer radius of the circle
const baseSpeed = 0.05 // Base speed for the particles
const maxDistance = 90 // Total distance of the tunnel
const fadeStart = -50 // Start fading in/out
const fadeEnd = 0 // End of fade effect

export default function TunnelParticles() {
  const particlesRef = useRef()
  const [texture] = useLoader(TextureLoader, [tex])

  // Store particle data (position, scale, opacity, and initial Z positions) in useMemo for better performance
  const particlesData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3) // Positions
    const scales = new Float32Array(particleCount) // Scales (sizes)
    const opacities = new Float32Array(particleCount) // Opacities for fading effect
    const initialZ = new Float32Array(particleCount) // Initial Z positions for reset

    for (let i = 0; i < particleCount; i++) {
      // Generate random angle (theta) and radius
      const theta = randFloat(0, 2 * Math.PI) // Angle in radians
      const radius = Math.sqrt(randFloat(innerRadius * innerRadius, outerRadius * outerRadius)) // Random radius between inner and outer radii
      // Convert polar coordinates (r, theta) to Cartesian coordinates (x, y)
      positions[i * 3] = radius * Math.cos(theta) // X position
      positions[i * 3 + 1] = radius * Math.sin(theta) // Y position
      initialZ[i] = randFloat(-maxDistance, 90) // Z position (randomized along the tunnel)
      positions[i * 3 + 2] = initialZ[i] // Assign the Z position

      // Randomize the scale (size) of each particle
      scales[i] = randFloat(0.1, 0.6)

      // Initial opacity (fully visible)
      opacities[i] = 1
    }

    return { positions, scales, opacities, initialZ }
  }, [maxDistance])

  // Store previous progress to detect direction of scroll
  const previousProgress = useRef(0)

  // Assign the positions, scales, and opacities to the instanced mesh
  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      const object3D = new Object3D()

      // Set initial position
      object3D.position.set(
        particlesData.positions[i * 3],
        particlesData.positions[i * 3 + 1],
        particlesData.positions[i * 3 + 2]
      )

      // Set initial scale
      object3D.scale.set(particlesData.scales[i], particlesData.scales[i], 1)

      object3D.updateMatrix()

      // Apply transformation to each instance
      particlesRef.current.setMatrixAt(i, object3D.matrix)
    }

    particlesRef.current.instanceMatrix.needsUpdate = true

    // Assign opacity values to instanced attributes
    particlesRef.current.geometry.setAttribute(
      'instanceOpacity',
      new InstancedBufferAttribute(particlesData.opacities, 1)
    )
  }, [particlesData])

  // Update particles' positions and opacity based on scroll progress and base speed
  useFrame(() => {
    const progress = useScrollStore.getState().progress // Get normalized scroll progress (0 to 1)
    const deltaProgress = progress - previousProgress.current // Calculate the change in progress (scroll direction and speed)

    previousProgress.current = progress // Update the previous progress

    for (let i = 0; i < particleCount; i++) {
      const object3D = new Object3D()

      // Move particles along the Z axis based on scroll progress and base speed
      let zPos = particlesData.positions[i * 3 + 2] + baseSpeed + deltaProgress * 1.0 * maxDistance // Add base speed for continuous movement + scroll influence

      // If the particle moves beyond the tunnel's end, wrap it back to the start
      if (zPos > 90) {
        zPos = -maxDistance + (zPos - 90) // Wrap to the back
      } else if (zPos < -maxDistance) {
        zPos = 90 - (-maxDistance - zPos) // Wrap to the front
      }

      particlesData.positions[i * 3 + 2] = zPos // Update Z position

      // Fade in only based on Z position (no fade out)
      if (zPos <= fadeStart) {
        particlesData.opacities[i] = 0 // Completely transparent before fadeStart
      } else if (zPos > fadeStart && zPos < fadeEnd) {
        particlesData.opacities[i] = (zPos - fadeStart) / (fadeEnd - fadeStart) // Fade in
      } else {
        particlesData.opacities[i] = 1 // Fully visible in the tunnel
      }

      // Update the dummy object with the new position and scale
      object3D.position.set(
        particlesData.positions[i * 3],
        particlesData.positions[i * 3 + 1],
        particlesData.positions[i * 3 + 2]
      )
      object3D.scale.set(particlesData.scales[i], particlesData.scales[i], 1)

      // Apply the transformation to the instanced mesh
      object3D.updateMatrix()
      particlesRef.current.setMatrixAt(i, object3D.matrix)
    }

    // Mark the instance matrix as needing an update
    particlesRef.current.instanceMatrix.needsUpdate = true

    // Update the opacity attribute for each particle
    particlesRef.current.geometry.attributes.instanceOpacity.needsUpdate = true
  })

  return (
    <instancedMesh ref={particlesRef} args={[null, null, particleCount]}>
      <planeGeometry attach='geometry' args={[1, 1]} />
      <shaderMaterial
        transparent={true}
        depthWrite={false}
        blending={NormalBlending}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
        }}
      />
    </instancedMesh>
  )
}

// Custom shaders to handle per-instance opacity
const vertexShader = `
  attribute float instanceOpacity;
  varying float vOpacity;
  varying vec2 vUv;

  void main() {
    vOpacity = instanceOpacity;
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying float vOpacity;
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    // Discard fully transparent pixels
    if (color.a < 0.01) discard;

    // Apply the instance opacity to the texture's alpha
    gl_FragColor = vec4(color.rgb, color.a * vOpacity);
  }
`
