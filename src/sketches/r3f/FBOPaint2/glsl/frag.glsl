uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
varying vec2 vUv;
float PI = 3.1415926;

void main() {
    vec4 displacement = texture2D(uDisplacement, vUv);
    float theta = displacement.g * 2.0 * PI;
    vec2 dir = vec2(sin(theta), cos(theta));
    vec2 uv = vUv + dir * displacement.g * .1;
    vec4 colorResult = texture2D(uTexture, uv);
    vec4 colorDebug = vec4(0.0, displacement.g, 0.0, 1.0);
    gl_FragColor = colorDebug;
}
