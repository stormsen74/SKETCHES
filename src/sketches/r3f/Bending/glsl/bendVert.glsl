//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 =   v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0;// N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);//  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);// mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1),
    dot(p2, x2), dot(p3, x3)));
}


// => simple -noise

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898, 78.233)))
    * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

mat2 rotate2d(float angle){
    return mat2(cos(angle), -sin(angle),
    sin(angle), cos(angle));
}

// <= simple -noise

// => bend

vec3 bend(vec3 ip, float ba, vec2 b, float o, float a) {
    vec3 op = ip;
    ip.x = op.x * cos(a) - op.y * sin(a);
    ip.y = op.x * sin(a) + op.y * cos(a);
    if (ba != 0.0) {
        float radius = b.y / ba;
        float onp = (ip.x - b.x) / b.y - o;
        ip.z = cos(onp * ba) * radius - radius;
        ip.x = (b.x + b.y * o) + sin(onp * ba) * radius;
    }
    op = ip;
    ip.x = op.x * cos(-a) - op.y * sin(-a);
    ip.y = op.x * sin(-a) + op.y * cos(-a);
    return ip;
}

// <= bend



varying vec2 vUv;

uniform float bendAngle;
uniform vec2 bounds;
uniform float bendOffset;
uniform float bendAxisAngle;
uniform float u_time;

// noise
uniform float u_noise_amp1;
uniform float u_noise_f1;
uniform float u_m1;

uniform float u_noise_amp2;
uniform float u_noise_f2;
uniform float u_m2;

#define PI 3.14159265359


void main(void) {
    vUv = uv;


    vec3 posBend = bend(position, bendAngle, bounds, bendOffset, bendAxisAngle);

    //    https://dhrumillimbad.medium.com/wavy-mesh-using-shaders-r3f-328317fd22ed
    vec3 pos = position;
    vec3 noisePos = vec3(pos.x * u_noise_f1 + u_time * u_m1, pos.y * u_noise_f1 + u_time * u_m1, pos.z);
    posBend.z += snoise(noisePos) * u_noise_amp1;

    //    https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/
    //    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //    posBend.z += sin(modelPosition.y * 4.0 + u_time * 2.0) * 0.2;
    //    posBend.z += sin(modelPosition.x * 6.0 + u_time * 2.0) * 0.1;


    //    https://github.com/franky-adl/waves-value-noise/blob/master/src/index.js
    //    vec3 posNoise = position;
    //    posNoise.z += noise(posNoise.xy * u_noise_f1 + u_time * u_m1) * u_noise_amp1;
    //    posNoise.z += noise(rotate2d(PI / 4.) * posNoise.yx * u_noise_f2 - u_time * u_m2 * 0.6) * u_noise_amp2;
    //    posBend.z += posNoise.z;


    gl_Position = projectionMatrix * modelViewMatrix * vec4(posBend, 1.0);

}




