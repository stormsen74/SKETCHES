varying float vDistance;

void main() {
    //    gl_FragColor = vec4(0.34, 0.53, 0.96, 1.0);

    vec3 color = vec3(0.0, 0.0, 0.0);
    vec3 color_a = vec3(0.34, 0.53, 0.96);
    vec3 color_b = vec3(0.97, 0.70, 0.45);
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 2.0);

//    color = mix(color_a, vec3(0.0), vDistance * .3);
        color = mix(color_a, color_b, vDistance * 0.5);
    color = mix(vec3(0.0), color, strength);
    gl_FragColor = vec4(color, strength);
}
