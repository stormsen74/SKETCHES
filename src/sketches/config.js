import React from 'react'
import Bending from '@src/sketches/r3f/Bending/Bending.js'
import ShaderTest from '@src/sketches/r3f/ShaderTest/index.js'
import FBOPaint from '@src/sketches/r3f/FBOPaint/index.js'
import FBOPaint2 from '@src/sketches/r3f/FBOPaint2/index.js'
import PortalSetup from '@src/sketches/r3f/PortalSetup/index.js'
import SimpleTree from '@src/sketches/r3f/SimpleTree/index.js'
import LorenzAttractor from '@src/sketches/r3f/LorenzAttractor/index.js'
import ScrollCamSetup from '@src/sketches/r3f/ScrollCamSetup/index.js'
import ScrollCamSetupLerp_0_1 from '@src/sketches/r3f/ScrollCamSetupLerp_0_1/index.js'
import SecondUVSet from '@src/sketches/r3f/SecondUVSet/index.js'
import ShaderSetup from '@src/sketches/r3f/ShaderSetup/ShaderSetup.js'
import Tunnel from '@src/sketches/r3f/Tunnel/index.js'
import ScrollGrid from '@src/sketches/r3f/ScrollGrid/index.js'
import FlightCam from '@src/sketches/r3f/FlightCam/index.js'
import R3RapierSetup from '@src/sketches/r3f/R3RapierSetup/index.js'
import DreiSampler from '@src/sketches/r3f/Sampler/index.js'
import IChing from '@src/sketches/r3f/IChing/index.js'
import DustParticles from '@src/sketches/r3f/DustParticles/index.js'
import FakeGodRays from '@src/sketches/r3f/FakeGodRays/index.js'
import SunWalk from '@src/sketches/r3f/SunWalk/index.js'
import VertexParticles from '@src/sketches/r3f/VertexParticles/index.js'
import FBOParticles from './r3f/FBOParticles/index.js'
import Icosahedron from '@src/sketches/r3f/Icosahedron/index.js'
import ImageHoverReveal from '@src/sketches/r3f/ImageHoverReveal/index.js'
import ImageUVCoordinates from '@src/sketches/r3f/ImageUVCoordinates/index.js'
import OrbitingWisps from '@src/sketches/r3f/OrbitingWisps/index.js'
import Postprocessing from '@src/sketches/r3f/Postprocessing/index.js'
import ReactionDiffusion from './r3f/ReactionDiffusion/index.js'
import PerlinFlow from './r3f/PerlinFlowShader/index.js'
import ReactP5_Setup from './p5/ReactP5_Setup/Setup/index.js'

export const sketches = [
  { component: <ReactP5_Setup />, name: 'ReactP5 Setup', type: 'p5' },
  { component: <R3RapierSetup />, name: 'R3 Rapier Setup', type: 'r3f' },
  { component: <DreiSampler />, name: 'Drei Sampler', type: 'r3f' },
  { component: <IChing />, name: 'I Ching', type: 'r3f' },
  { component: <DustParticles />, name: 'Dust Particles', type: 'r3f' },
  { component: <FakeGodRays />, name: 'Fake God Rays', type: 'r3f' },
  { component: <SunWalk />, name: 'Sun Walk', type: 'r3f' },
  { component: <VertexParticles />, name: 'Vertex Particles', type: 'r3f' },
  { component: <Icosahedron />, name: 'Icosahedron', type: 'r3f' },
  { component: <ImageHoverReveal />, name: 'Image Hover Reveal', type: 'r3f' },
  { component: <ImageUVCoordinates />, name: 'Image UV Coordinates', type: 'r3f' },
  { component: <OrbitingWisps />, name: 'Orbiting Wisps', type: 'r3f' },
  { component: <Bending />, name: 'Bending', type: 'r3f' },
  { component: <ShaderTest />, name: 'Mesh Glow', type: 'r3f' },
  { component: <FBOPaint />, name: 'FBO Paint', type: 'r3f' },
  { component: <FBOPaint2 />, name: 'FBO Paint 2', type: 'r3f' },
  { component: <PortalSetup />, name: 'Portal Setup', type: 'r3f' },
  { component: <SimpleTree />, name: 'Simple Tree', type: 'r3f' },
  { component: <LorenzAttractor />, name: 'Lorenz Attractor', type: 'r3f' },
  { component: <ScrollCamSetup />, name: 'Scroll Cam Setup', type: 'r3f' },
  { component: <ScrollCamSetupLerp_0_1 />, name: 'Scroll Cam Setup Lerp 0.1', type: 'r3f' },
  { component: <SecondUVSet />, name: 'Second UV Set', type: 'r3f' },
  { component: <ShaderSetup />, name: 'Shader Setup', type: 'r3f' },
  { component: <Tunnel />, name: 'Tunnel', type: 'r3f' },
  { component: <ScrollGrid />, name: 'Scroll Grid', type: 'r3f' },
  { component: <FlightCam />, name: 'Flight Cam', type: 'r3f' },
  { component: <Postprocessing />, name: 'React Post', type: 'r3f' },
  { component: <FBOParticles />, name: 'FBO Particles', type: 'r3f' },
  { component: <PerlinFlow />, name: 'Perlin Flow', type: 'r3f' },
  { component: <ReactionDiffusion />, name: 'ReactionDiffusion', type: 'r3f' },
]
