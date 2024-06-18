import { CatmullRomCurve3 } from 'three'

export default class Curve {
  constructor(points, resolution = 32, tension = 0) {
    if (points.length < 2) {
      throw new Error('At least two points are required to create a curve.')
    }
    this.curve = new CatmullRomCurve3(points)
    this.curve.resolution = resolution
    this.curve.tension = tension
    this.curve.curveType = 'catmullrom'
  }

  getCurvePoints() {
    return this.curve.getPoints(this.curve.resolution)
  }

  getPointAt(p = 0) {
    return this.curve.getPointAt(p)
  }

  getTangentAt(p = 0) {
    return this.curve.getTangentAt(p)
  }
}
