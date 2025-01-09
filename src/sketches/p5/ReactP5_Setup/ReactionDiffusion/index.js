import Sketch from 'react-p5'

export default function ReactionDiffusionCanvas() {
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
    p5.frameRate(60)
    p5.pixelDensity(window.devicePixelRatio)
    p5.colorMode(p5.RGB, 255, 255, 255, 1)
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  const draw = p5 => {
    p5.background(100)

    p5.noFill()
    p5.stroke('#ff0000')
    p5.strokeWeight(1)
    p5.rect(0, 0, 200, 200)
  }

  const windowResized = p5 => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  const handleClick = p5 => {
    const position = p5.createVector(p5.mouseX, p5.mouseY)
  }

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} mouseClicked={handleClick} />
}
