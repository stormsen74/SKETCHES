


varying vec2 vUv;
varying vec4 vPos;

void main(){
    vec4 wPos = modelMatrix * vec4(position, 1.0);
    vPos = wPos;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
