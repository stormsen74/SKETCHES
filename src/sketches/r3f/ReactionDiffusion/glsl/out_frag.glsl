precision mediump float;
uniform sampler2D bufferTexture;
varying vec2 vUv;

vec3 rgbToHsv(vec3 c) {
    vec4 K = vec4(0.0, - 1.0 / 3.0, 2.0 / 3.0, - 1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsvToRgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv;
    uv = vUv;

    vec4 data = texture2D(bufferTexture, uv);
    vec3 baseColor = vec3(data.x, data.y, 1.0 - data.x - data.y);
    baseColor.b = fract(1.0001 - baseColor.x - baseColor.y);
    // map to firey colours
    baseColor.rgb = mix(mix(vec3(0), vec3(1, 0, 0), 1.0 - baseColor.r), vec3(1, 1, 0), baseColor.g);
    baseColor.rgb = pow(baseColor.rgb, vec3(1. / 2.2));

    vec3 color1 = vec3(0.0);
    vec3 color2 = vec3(0.82, 0.52, 0.11);

    // vec3 color = data.rgb;
    // vec3 color = mix(color1, color2, min(data.r * 1.0, 1.0));
    // vec3 color = mix(color1, color2, min(pow(data.r, 3.0), 1.0));

    float threshold = 0.2; // Adjust threshold for sharpness
    float intensity = smoothstep(threshold - 0.1, threshold + 0.1, data.g);
    vec3 remapped = mix(color1, color2, intensity);

    // float remapped = smoothstep(0.5, 0.7, data.r); // Adjust range for contrast
    // vec3 color = mix(color1, color2, remapped);

// Increase contrast and sharpness
    // float sharpness = .75;
    // float remapped = sness = .75;
    // float remapped = smoothstep(0.3, 0.7, pow(data.r, sharpness));

// Final color with sharp, contrasting lines
    vec3 color = mix(color1, color2, remapped);

    float hueShift = 180.0;
    vec3 hsv = rgbToHsv(color);
    hsv.x = mod(hsv.x + hueShift / 360.0, 1.0);
    vec3 finalColor = hsvToRgb(hsv);

    gl_FragColor = vec4(baseColor.rgb, 1.0);
}