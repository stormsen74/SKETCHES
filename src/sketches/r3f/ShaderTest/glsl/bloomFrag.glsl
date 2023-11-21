varying float intensity;
void main() {
    vec3 glow = vec3(0, 1, 0) * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
