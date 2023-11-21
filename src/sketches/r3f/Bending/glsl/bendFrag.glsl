
uniform sampler2D u_map;
varying vec2 vUv;

void main(void) {
    gl_FragColor = texture2D( u_map, vUv );
}
