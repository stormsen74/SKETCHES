// Vertex Shader (fake3d.vert.glsl)
varying vec2 vUv;

void main() {
  // UV-Koordinate an Fragment-Shader weitergeben
  vUv = uv;
  // Standard-Transformation des Vertex (ModelViewProjection)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
