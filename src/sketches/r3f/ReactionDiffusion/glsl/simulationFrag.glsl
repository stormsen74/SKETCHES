precision highp float;

uniform vec2 res; // Resolution
uniform sampler2D bufferTexture; // Input texture
uniform vec3 mouse; // Mouse interaction: x, y (position), z (pressed state)
uniform float brushRadius;

// varying vec2 vUv;
varying vec2 v_uvs[9];

uniform float f;
uniform float k;
uniform float dA;
uniform float dB;
uniform float timestep;

vec2 bias = vec2(0.0, 0.0);

vec3 weights[3];

void setWeights(int type) {
  // Karl Sim's weights from http://www.karlsims.com/rd.html
  if(type == 0) {
    weights[0] = vec3(0.05, 0.2, 0.05);
    weights[1] = vec3(0.2, - 1.0, 0.2);
    weights[2] = vec3(0.05, 0.2, 0.05);

  // Diagonal Emphasis | This kernel emphasizes diagonal diffusion for more organic-looking patterns:
  } else if(type == 1) {
    weights[0] = vec3(0.15, 0.05, 0.15);
    weights[1] = vec3(0.05, - 0.8, 0.05);
    weights[2] = vec3(0.15, 0.05, 0.15);
  // The sum has to be 1?!
  } else if(type == 2) {
    weights[0] = vec3(0.1, 0.15, 0.1);
    weights[1] = vec3(0.15, - 1.0, 0.15);
    weights[2] = vec3(0.1, 0.15, 0.1);
  }
}

vec2 getLaplacian(vec4 centerTexel) {
  // Begin by setting up the Laplacian stencil weights based on desired model
  setWeights(0);

  // Start with center value
  vec2 laplacian = centerTexel.xy * weights[1][1];  // center

  // Add in orthogonal values
  laplacian += texture2D(bufferTexture, fract(v_uvs[1])).xy * (weights[0][1] + bias.y);  // top
  laplacian += texture2D(bufferTexture, fract(v_uvs[2])).xy * (weights[1][2] + bias.x);  // right
  laplacian += texture2D(bufferTexture, fract(v_uvs[3])).xy * (weights[2][1] - bias.y);  // bottom
  laplacian += texture2D(bufferTexture, fract(v_uvs[4])).xy * (weights[1][0] - bias.x);  // left

  // Add in diagonal values
  laplacian += texture2D(bufferTexture, fract(v_uvs[5])).xy * weights[0][2];  // top-right
  laplacian += texture2D(bufferTexture, fract(v_uvs[6])).xy * weights[2][2];  // bottom-right
  laplacian += texture2D(bufferTexture, fract(v_uvs[7])).xy * weights[2][0];  // bottom-left
  laplacian += texture2D(bufferTexture, fract(v_uvs[8])).xy * weights[0][0];  // top-left

  return laplacian;
}

void main() {
    // vec2 uv = vUv;
    // vec4 fragColour = texture2D(bufferTexture, uv);

     // Get A/B chemical data
  vec4 centerTexel = texture2D(bufferTexture, v_uvs[0]);
  float A = centerTexel[0];
  float B = centerTexel[1];

     // Copy the f/k/dA/dB parameters so they can be modified locally ("n" for "new")
  float nf = f;
  float nk = k;
  float ndA = dA;
  float ndB = dB;

    // Draw more of the B chemical around the mouse on mouse down
  if(mouse.z > 0.0) {
    float distToMouse = distance(mouse.xy * res, v_uvs[0] * res);

    if(distToMouse < brushRadius) {
      gl_FragColor = vec4(mix(0.0, 0.3, distToMouse / brushRadius), 0.5, 0.0, 1.0);
      return;
    }
  }

      // DEBUGGING: override f/k uniforms to generate parameter map
      // nf = 0.1 * v_uvs[0].y;
      // nk = 0.03 + 0.04 * v_uvs[0].x;

      // Pre-calculate complex and repeated terms
  vec2 laplacian = getLaplacian(centerTexel);
  float reactionTerm = A * B * B;

  gl_FragColor = vec4(A + ((ndA * laplacian[0] - reactionTerm + nf * (1.0 - A)) * timestep), B + ((ndB * laplacian[1] + reactionTerm - (nk + nf) * B) * timestep), centerTexel.b, 1.0);
}