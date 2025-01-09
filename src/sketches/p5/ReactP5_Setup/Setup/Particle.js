export default class Particle {
  constructor(p5, position) {
    this.p5 = p5
    this.position = position
    this.acceleration = this.p5.createVector(this.p5.random(-0.1, 0.1), this.p5.random(-0.1, 0.1))
    this.velocity = this.p5.createVector(this.p5.random(-1, 1), this.p5.random(-1, 1))
    this.shapeColor = this.p5.color('#084761')
    this.lifespan = 500
    this.maxSize = 12
    this.tailLength = 50
    this.history = []
  }

  run() {
    this.update()
    this.display()
  }

  isDead() {
    return this.lifespan < 0
  }

  update() {
    this.velocity.add(this.acceleration)
    this.position.add(this.velocity)
    this.lifespan -= 2

    this.history.push(this.position.copy())

    if (this.history.length > this.tailLength) {
      this.history.splice(0, 1)
    }
  }

  display() {
    this.p5.noStroke()
    const size = this.p5.map(this.lifespan, 0, 500, this.maxSize, 0.1)
    // this.shapeColor.setAlpha(this.p5.map(this.lifespan, 0, 500, 0, 255));
    this.p5.fill(this.shapeColor)
    this.p5.ellipse(this.position.x, this.position.y, size, size)

    for (let i = 0; i < this.history.length; i++) {
      const pos = this.history[i]
      const shapeSize = (i / this.tailLength) * size
      this.p5.ellipse(pos.x, pos.y, shapeSize, shapeSize)
    }
  }
}
