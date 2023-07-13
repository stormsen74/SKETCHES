import { CatmullRomCurve3, Vector3 } from 'three'

const CONFIG_CURVE = {
  resolution: 32,
  tension: 0.5,
  distance_z: -50,
  offset_x: -100,
  width: 200,
  height: 60,
}
export default class Curve {
  constructor(resolution = 32, tension = 0.5) {
    this.points = [
      new Vector3(0 + CONFIG_CURVE.offset_x, 0, CONFIG_CURVE.distance_z),
      new Vector3(CONFIG_CURVE.width * 0.5 + CONFIG_CURVE.offset_x, CONFIG_CURVE.height, CONFIG_CURVE.distance_z),
      new Vector3(CONFIG_CURVE.width + CONFIG_CURVE.offset_x, 0, CONFIG_CURVE.distance_z),
    ]
    this.curve = new CatmullRomCurve3([this.points[0], this.points[1], this.points[2]])
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
