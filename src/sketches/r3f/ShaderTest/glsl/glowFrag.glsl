varying float intensity;
uniform vec3 glowColor;
uniform float multiplier;
void main() {
    vec3 glow = glowColor * intensity * multiplier;
    gl_FragColor = vec4(glow, 1.0);
}
