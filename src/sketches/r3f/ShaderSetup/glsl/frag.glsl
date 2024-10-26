// Fragment Shader: fragment.glsl
uniform float u_progress; // Uniform to control the progress
varying vec2 v_uv; // Varying to receive UV coordinates from the vertex shader

#define PI 3.141592653589793
#define TAU 6.283185307179586

// Function to create a cubic pulse pattern
float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if (x > w) return 0.0;
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}

void main() {
    // Normalized coordinates (-1 to 1 vertically)
    vec2 p = v_uv * 2.0 - 1.0;
    vec2 uvOrig = p;

    // Compute angle and distance
    float a = atan(p.y, p.x);
    float rSquare = pow(pow(p.x * p.x, 4.0) + pow(p.y * p.y, 4.0), 1.0 / 8.0);
//    float rRound = length(p);
    float r = rSquare;

    // Generate tunnel coordinates
    vec2 uv = vec2(0.3 / r + u_progress, a / PI);

    // Create grid pattern
//    uv += vec2(0.0, 0.25 * sin(u_progress + uv.x * 1.2));
//    uv /= vec2(1.0 + 0.0002 * length(uvOrig));
    vec2 uvDraw = fract(uv * 8.0);

    // Draw grid lines
    float col = cubicPulse(0.5, 0.06, uvDraw.x);
    col = max(col, cubicPulse(0.5, 0.06, uvDraw.y));

    // Darker towards the center, light towards the outer
    col = col * r * 0.8;
    col += 0.15 * length(uvOrig);

    // Set final color
    gl_FragColor = vec4(vec3(0.0, col, 0.0), 1.0);
}
