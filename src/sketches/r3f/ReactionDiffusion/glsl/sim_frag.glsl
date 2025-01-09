precision highp float;

uniform vec2 res; // Resolution
uniform sampler2D bufferTexture; // Input texture
uniform vec3 mouse; // Mouse interaction: x, y (position), z (pressed state)
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 fragColour = texture2D(bufferTexture, uv);

      // Reaction-diffusion parameters
  float laplaceSelf = - 1.0;
  float laplaceAdjacent = 0.2;
  float laplaceDiagonal = 0.05;
  float deltaT = .9;
  vec2 diffusionRate = vec2(1.0, 0.5);

  // vec2 feedKill = mix(vec2(0, .04), vec2(.1, .07), vec2(.23, .5)); // terminating worms
  // vec2 feedKill = vec2(0.02, 0.055); // Example: plankton
  // vec2 feedKill = vec2(.031, .058); // fungal
  // vec2 feedKill = vec2(uv.x * uv.y, uv.y) * vec2(.02, .06); // smoke waves
  vec2 feedKill = vec2(.75, .8) * vec2(.02, .06); // spiral puffs

  vec2 AB = fragColour.xy;

      // Sample neighboring pixels
  vec2 texel = 1.0 / res; // Size of a single texel
  vec2 laplace = laplaceSelf * AB;
  laplace += (texture2D(bufferTexture, uv + vec2(texel.x, 0)).xy +
    texture2D(bufferTexture, uv - vec2(texel.x, 0)).xy +
    texture2D(bufferTexture, uv + vec2(0, texel.y)).xy +
    texture2D(bufferTexture, uv - vec2(0, texel.y)).xy) * laplaceAdjacent;

  laplace += (texture2D(bufferTexture, uv + vec2(texel.x, texel.y)).xy +
    texture2D(bufferTexture, uv + vec2(texel.x, - texel.y)).xy +
    texture2D(bufferTexture, uv - vec2(texel.x, texel.y)).xy +
    texture2D(bufferTexture, uv - vec2(texel.x, - texel.y)).xy) * laplaceDiagonal;

      // Reaction-diffusion update
  vec2 deltaAB = diffusionRate * laplace;
  deltaAB += vec2(- 1.0, 1.0) * AB.x * AB.y * AB.y;
  deltaAB.x += feedKill.x * (1.0 - AB.x);
  deltaAB.y -= (feedKill.y + feedKill.x) * AB.y;

  AB += deltaT * deltaAB;
  AB = clamp(AB, 0.0, 1.0);

  fragColour.xy = AB;

      // Mouse interaction
  if(mouse.z > 0.0) {
    float dist = length(mouse.xy * res - uv * res);
    fragColour.xy = mix(fragColour.xy, vec2(0.0, 1.0), smoothstep(4.0, 3.0, dist));
  }

  gl_FragColor = fragColour;

}