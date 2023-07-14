void main() {
    vec3 color = vec3(255.0/255.0, 155.0/255.0, 25.0/255.0);

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 2.0);
    color = mix(vec3(0.0), color, strength);

    gl_FragColor = vec4(color, 1.0);
}
