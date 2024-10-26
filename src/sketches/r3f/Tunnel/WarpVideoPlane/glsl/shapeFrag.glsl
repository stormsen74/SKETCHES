#ifdef GL_ES
precision mediump float;
#endif

uniform float progress;

uniform sampler2D u_texture;
varying vec2 vUv;

// Simplex Noise Funktionen von Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r)
{ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v)
{
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // Erste Ecke
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 =   v - i + dot(i, C.xxx);

    // Weitere Ecken
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    // x0 = x0 - 0.0 + 0.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutationen
    i = mod289(i);
    vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradienten
    float n_ = 0.142857142857;// 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
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

    // Normierung
    vec4 norm = taylorInvSqrt(vec4(
    dot(p0, p0),
    dot(p1, p1),
    dot(p2, p2),
    dot(p3, p3)
    ));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Finale Mischung
    vec4 m = max(0.6 - vec4(
    dot(x0, x0),
    dot(x1, x1),
    dot(x2, x2),
    dot(x3, x3)
    ), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(
    dot(p0, x0),
    dot(p1, x1),
    dot(p2, x2),
    dot(p3, x3)
    ));
}

void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    float dist = length(pos);

    // Parameter
    float maxRadius = sqrt(0.5);
    float noiseScale = 5.0;
    float edgeThickness = 0.02;
    float noiseSpeed = 4.0;
    float maxNoiseStrength = 0.1;

    // Basisradius, der mit 'progress' wächst
    float baseRadius = progress * maxRadius;

    // Dynamische Anpassung der Noise-Stärke mit smoothstep
    float startProgress = 0.8;// Beginn des Abfalls der Noise-Stärke
    float endProgress = 1.0;// Ende des Abfalls (Noise-Stärke = 0)
    float noiseFactor = smoothstep(startProgress, endProgress, progress);
    float dynamicNoiseStrength = (1.0 - noiseFactor) * maxNoiseStrength;

    // Noise-Berechnung, gebunden an 'progress'
    float noise = snoise(vec3(pos * noiseScale, progress * noiseSpeed)) * dynamicNoiseStrength;

    // Wabernder Radius
    float wavyRadius = baseRadius + noise;

    // Begrenzung des wavyRadius auf den maximalen Radius
    wavyRadius = clamp(wavyRadius, 0.0, maxRadius);

    // Alpha-Berechnung mit smoothstep
    float alpha = smoothstep(wavyRadius + edgeThickness, wavyRadius - edgeThickness, dist);

    // Schnelles Einfaden des Alpha-Werts am Anfang
    float fadeInEnd = 0.1; // Der progress-Wert, bis zu dem eingefadet wird
    float fadeIn = smoothstep(0.0, fadeInEnd, progress);
    alpha *= fadeIn;

    // Anwendung des Alpha-Werts auf die Textur
    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = vec4(color.rgb, color.a * alpha);
}
