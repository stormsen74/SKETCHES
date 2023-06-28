varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uBaseAlpha;
uniform float uGlowAlpha;
uniform float uTopFade;
uniform vec3 uRaysColor;
uniform vec3 uGlowColor;
uniform float uRaysStepMin;
uniform float uRaysStepMax;
uniform float uGlowStepMin;
uniform float m_uv_x;

void main() {
    //    vec2 raysUv = vUv;
    //    raysUv.x *= 3.0;
    //    raysUv.x += uTime * 0.03;
    //    raysUv.y = 0.5;

    vec2 raysUv = vUv;
    raysUv.x *= m_uv_x;
    raysUv.x += uTime * 0.03;
    raysUv.y = .5;


    vec4 t = texture2D(uTexture, raysUv);


    float raysFactor = smoothstep(uRaysStepMin, uRaysStepMax, t.g);
    float lengthFade = vUv.y - raysFactor * 0.1;
    float topFade = 1.0 - smoothstep(1.0 - uTopFade, 1.0, vUv.y);
    float sourceGlow = smoothstep(uGlowStepMin, 1.0, vUv.y);


    vec3 composite = uRaysColor * raysFactor;
    composite = mix(composite, uGlowColor, sourceGlow);

    float alpha = uBaseAlpha * lengthFade * raysFactor;
    alpha = mix(alpha, uGlowAlpha, sourceGlow);
    alpha *= topFade;

//    gl_FragColor.rgba = vec4(vec3(alpha), 1.0);
        gl_FragColor.rgba = vec4(composite, alpha);
    //    gl_FragColor.a = alpha;

    //    gl_FragColor.rgb = composite;
    //    gl_FragColor.rgb = composite*t.rgb;

}
