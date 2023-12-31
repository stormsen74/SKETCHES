/* eslint-disable */


// An icosahedron has 12 vertices, and
// since it's completely symmetrical the
// formula for calculating them is kind of
// symmetrical too:

const tau = (1.0 + Math.sqrt(5.0)) / 2.0;
const r = 1 / tau;

export const types = {
  'hexahedron': {
    vertices: [
      -1, -1, -1,
      1, -1, -1,
      1, 1, -1,
      -1, 1, -1,
      -1, -1, 1,
      1, -1, 1,
      1, 1, 1,
      -1, 1, 1,
    ],
    indices: [
      2, 1, 0,
      0, 3, 2,
      0, 4, 7,
      7, 3, 0,
      0, 1, 5,
      5, 4, 0,
      1, 2, 6,
      6, 5, 1,
      2, 3, 7,
      7, 6, 2,
      4, 5, 6,
      6, 7, 4
    ]
  },
  'tetrahedron': {
    vertices: [
      .5, .5, .5,
      -.5, .5, -.5,
      .5, -.5, -.5,
      -.5, -.5, .5

    ],
    indices: [
      0, 1, 2,
      1, 3, 2,
      0, 2, 3,
      0, 3, 1
    ]
  },
  'octahedron': {
    vertices: [
      0, -1, 0,
      0, 0, 1,
      -1, 0, 0,
      0, 0, -1,
      1, 0, 0,
      0, 1, 0

    ],
    indices: [
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 1,
      5, 2, 1,
      5, 3, 2,
      5, 4, 3,
      5, 1, 4,
    ]
  },
  'icosahedron': {
    vertices: [
      -1, tau, 0,
      1, tau, 0,
      -1, -tau, 0,
      1, -tau, 0,
      0, -1, tau,
      0, 1, tau,
      0, -1, -tau,
      0, 1, -tau,
      tau, 0, -1,
      tau, 0, 1,
      -tau, 0, -1,
      -tau, 0, 1,

    ],
    indices: [
      0, 11, 5,
      0, 5, 1,
      0, 1, 7,
      0, 7, 10,
      0, 10, 11,
      1, 5, 9,
      5, 11, 4,
      11, 10, 2,
      10, 7, 6,
      7, 1, 8,
      3, 9, 4,
      3, 4, 2,
      3, 2, 6,
      3, 6, 8,
      3, 8, 9,
      4, 9, 5,
      2, 4, 11,
      6, 2, 10,
      8, 6, 7,
      9, 8, 1,
    ]
  },
  'dodecahedron': {
    vertices: [
      // (±1, ±1, ±1)
      -1, -1, -1,
      -1, -1, 1,
      -1, 1, -1,
      -1, 1, 1,
      1, -1, -1,
      1, -1, 1,
      1, 1, -1,
      1, 1, 1,

      // (0, ±1/φ, ±φ)
      0, -r, -tau,
      0, -r, tau,
      0, r, -tau,
      0, r, tau,

      // (±1/φ, ±φ, 0)
      -r, -tau, 0,
      -r, tau, 0,
      r, -tau, 0,
      r, tau, 0,

      // (±φ, 0, ±1/φ)
      -tau, 0, -r,
      tau, 0, -r,
      -tau, 0, r,
      tau, 0, r

    ],
    indices: [
      3, 11, 7,
      3, 7, 15,
      3, 15, 13,
      7, 19, 17,
      7, 17, 6,
      7, 6, 15,
      17, 4, 8,
      17, 8, 10,
      17, 10, 6,
      8, 0, 16,
      8, 16, 2,
      8, 2, 10,
      0, 12, 1,
      0, 1, 18,
      0, 18, 16,
      6, 10, 2,
      6, 2, 13,
      6, 13, 15,
      2, 16, 18,
      2, 18, 3,
      2, 3, 13,
      18, 1, 9,
      18, 9, 11,
      18, 11, 3,
      4, 14, 12,
      4, 12, 0,
      4, 0, 8,
      11, 9, 5,
      11, 5, 19,
      11, 19, 7,
      19, 5, 14,
      19, 14, 4,
      19, 4, 17,
      1, 12, 14,
      1, 14, 5,
      1, 5, 9
    ]
  }
}

export const PLATONIC_TYPE = {
  TETRAHEDRON: 'tetrahedron',
  OCTAHEDRON: 'octahedron',
  HEXAHEDRON: 'hexahedron',
  ICOSAHEDRON: 'icosahedron',
  DODECAHEDRON: 'dodecahedron',
}

// export default types
