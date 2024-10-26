// Vertex Shader: vertex.glsl
varying vec2 v_uv; // Varying for passing UV coordinates to the fragment shader

void main() {
    v_uv = uv; // Pass UV coordinates to the fragment shader

    // Standard transformation
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
