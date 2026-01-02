// Fragment Shader (fake3d.frag.glsl)
precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;   // Farbbild
uniform sampler2D uDepthMap;  // Tiefenmap (Graustufen)
uniform float uScale;         // Parallax-Stärke
uniform float uFocus;         // Fokus-Tiefe (Referenz, zwischen 0 und 1)
uniform float uInvertDepth;   // 0.0 = normal, 1.0 = invertiere Depth Map
uniform vec2 uMouse;          // Maus-Offset (-1 bis 1)

void main() {
  // Depth-Wert an aktueller UV-Position aus der Tiefenmap (Graustufen: R-Kanal genügt)
  float depthValue = texture2D(uDepthMap, vUv).r;
  
  // Falls Invertierung aktiviert, Depth-Wert umkehren (weiß = fern, schwarz = nah)
  if (uInvertDepth > 0.5) {
    depthValue = 1.0 - depthValue;
  }
  // Parallax-Verschiebung berechnen relativ zur Fokus-Tiefe
  // Pixel mit depthValue == uFocus bleiben (nahezu) an Ort und Stelle
  float parallax = (depthValue - uFocus) * uScale;
  
  // Verschobene UV-Koordinate basierend auf Mausbewegung und Parallax-Wert
  vec2 displacedUV = vUv + parallax * uMouse;
  
  // Optionale Korrektur: UV in [0,1] halten, um Ränder nicht schwarz auslaufen zu lassen
  // (Aktivieren, falls nötig)
  // displacedUV = clamp(displacedUV, 0.0, 1.0);
  
  // Farbe von der verschobenen UV-Koordinate aus dem Farbbild samplen
  vec4 color = texture2D(uTexture, displacedUV);
  
  gl_FragColor = color;
}
