uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress; // Progress value between 0 and 1
varying vec2 vUv;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Perlin noise function (stays static)
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = vUv;

    // Calculate warp effect based on progress: Max warp at 0, no warp at 1
    float warpFactor = (1.0 - uProgress) * 0.2; // Warp decreases as progress increases
    uv.x += sin(uv.y * 10.0) * warpFactor;
    uv.y += cos(uv.x * 10.0) * warpFactor;

    // Sample the texture
    vec4 color = texture2D(uTexture, uv);

    // Apply static Perlin noise-based fade-in, controlled by progress
    float noiseFactor = noise(uv * 5.0);  // Static noise pattern

    // Smoothly fade out the influence of noise as progress approaches 1
    float fadeFactor = smoothstep(0.0, 1.0, uProgress); // Smooth fade factor from 0 to 1

    // Calculate alpha by blending the noise and progress smoothly
    float alpha = mix(0.0, 1.0, fadeFactor) * (1.0 - noiseFactor * (1.0 - fadeFactor));  // Smooth alpha based on progress

    // Apply alpha to create fade-in effect, full opacity at progress = 1
    gl_FragColor = vec4(color.rgb, color.a * alpha);
}
