uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
varying vec2 vUv;
uniform vec2 repeat;
float PI = 3.1415926;

void main() {
    vec4 displacement = texture2D(uDisplacement, vUv);
    float theta = displacement.g * 2.0 * PI;
    vec2 dir = vec2(sin(theta), cos(theta));
    vec2 uv = vUv + dir * displacement.g * .1;
    vec4 colorResult = texture2D(uTexture, uv);
    vec4 colorDebug = vec4(0.0, displacement.g, 0.0, 1.0);
    gl_FragColor = colorResult;

//    https://discourse.threejs.org/t/repeat-a-shader-material-texture/47744
//    vec2 uv = vUv + dir * displacement.g * .1;
//    uv = fract(uv * repeat);
//    vec2 smooth_uv = repeat * vUv;
//    vec4 duv = vec4(dFdx(smooth_uv), dFdy(smooth_uv));
//    vec3 txl = textureGrad(uTexture, uv, duv.xy, duv.zw).rgb;
//    gl_FragColor =  vec4(txl, 1.0);
//    gl_FragColor =  displacement;
//    vec4 colorDebug = vec4(0.0, displacement.g, 0.0, 1.0);
//    gl_FragColor =  colorDebug;
}
