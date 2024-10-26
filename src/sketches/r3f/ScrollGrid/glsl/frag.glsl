#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

// Uniforms für Grid und Kreuze
uniform float uLines;
uniform float uLineThickness;
uniform float uCrossFrequency;
uniform float uCrossSize;
uniform float uProgress;

// Uniforms für Texturen
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;

#define MAX_TEXTURES 4

uniform float uTexturePositions[MAX_TEXTURES * 2];// 4 Texturen, x und y pro Textur
uniform float uTextureSizes[MAX_TEXTURES];// 4 Texturgrößen
uniform int uTextureIndices[MAX_TEXTURES];// 4 Texturindizes
uniform int uTextureCount;// Anzahl der Texturen

// Pseudozufallsfunktion zur Bestimmung der Kreuzpositionen
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Funktion zum Abfragen der richtigen Textur basierend auf dem Index
vec4 getTextureColor(int index, vec2 coord) {
    if (index == 0){
        return texture2D(uTexture0, coord);
    } else if (index == 1){
        return texture2D(uTexture1, coord);
    } else if (index == 2){
        return texture2D(uTexture2, coord);
    } else if (index == 3){
        return texture2D(uTexture3, coord);
    } else {
        return vec4(0.0);
    }
}

void main() {
    vec2 uv = vUv;
    uv.y += uProgress; // Verschiebung der UV-Koordinaten für Bewegung

    // Gridposition und Zellindex
    vec2 gridPos = uv * uLines;
    vec2 gridIndex = floor(gridPos);
    vec2 grid = fract(gridPos);

    // Abstand zum Zentrum der Gitterzelle
    vec2 gridCenterDist = abs(grid - 0.5);

    // Anti-Aliasing-Faktor
    vec2 aaf = fwidth(gridPos);

    // Linienstärke in Grid-Einheiten
    float thickness = uLineThickness / uLines;

    // Linienintensität
    float lineX = 1.0 - smoothstep(thickness - aaf.x, thickness + aaf.x, gridCenterDist.x);
    float lineY = 1.0 - smoothstep(thickness - aaf.y, thickness + aaf.y, gridCenterDist.y);
    float lineIntensity = max(lineX, lineY);

    // Kreuzintensität
    float crossIntensity = 0.0;
    float rnd = random(gridIndex);
    if (rnd > (1.0 - uCrossFrequency)) {
        float crossThickness = thickness * 1.2;
        float crossSize = uCrossSize / uLines;

        // Vertikaler Balken des Kreuzes
        float crossVerticalEdgeX = 1.0 - smoothstep(crossThickness - aaf.x, crossThickness + aaf.x, gridCenterDist.x);
        float crossVerticalEdgeY = 1.0 - smoothstep(crossSize - aaf.y, crossSize + aaf.y, abs(grid.y - 0.5));
        float verticalCross = crossVerticalEdgeX * crossVerticalEdgeY;

        // Horizontaler Balken des Kreuzes
        float crossHorizontalEdgeX = 1.0 - smoothstep(crossSize - aaf.x, crossSize + aaf.x, abs(grid.x - 0.5));
        float crossHorizontalEdgeY = 1.0 - smoothstep(crossThickness - aaf.y, crossThickness + aaf.y, gridCenterDist.y);
        float horizontalCross = crossHorizontalEdgeX * crossHorizontalEdgeY;

        // Kombinieren der Kreuzintensitäten
        crossIntensity = max(verticalCross, horizontalCross);
    }

    // Texturintensität und Farbe
    vec3 textureColor = vec3(0.0);
    float textureIntensity = 0.0;

    // Schleife über alle Texturen
    for (int i=0; i < MAX_TEXTURES; i++) { // Maximal 4 Texturen
        if (i >= uTextureCount) break;

        // Position der Textur abrufen
        vec2 texturePos = vec2(uTexturePositions[i * 2], uTexturePositions[i * 2 + 1]);

        // Anpassung der Texturposition für die Grid-Bewegung
        texturePos.y -= uProgress * uLines * 0.5;// Synchronisierung der Bewegung

        // Abstand zur Texturposition berechnen
        vec2 textureGridPos = gridPos - texturePos;

        // Größe der Textur abrufen
        float textureSize = uTextureSizes[i];

        // Überprüfen, ob das Fragment innerhalb des Texturbereichs liegt
        if (all(lessThanEqual(abs(textureGridPos), vec2(textureSize * 0.5)))) {
            // Texturkoordinaten berechnen
            vec2 textureCoord = (textureGridPos + vec2(textureSize * 0.5)) / textureSize;

            // Texturindex abrufen
            int textureIndex = uTextureIndices[i];

            // Richtige Textur sampeln
            vec4 texColor = getTextureColor(textureIndex, textureCoord);

            // Texturfarbe und Intensität additiv akkumulieren
            textureColor += texColor.rgb * texColor.a;
            textureIntensity += texColor.a;

            // Optional: Entfernen des Breaks, um mehrere Texturen gleichzeitig zu erlauben
            // break;
        }
    }

    // Additives Blending der Farben mit angepasster Intensität
    vec3 finalColor = vec3(0.0);
    finalColor += vec3(1.0) * lineIntensity * 0.5;// Weiße Linien mit halber Intensität
    finalColor += vec3(1.0) * crossIntensity;// Rote Kreuze mit erhöhter Intensität
    finalColor += textureColor;// Texturen

    // Begrenzen der finalen Farbe auf [0,1]
    finalColor = clamp(finalColor, 0.0, 1.0);

    // Finales Alpha basierend auf den maximalen Intensitäten
    float finalAlpha = max(max(lineIntensity, crossIntensity), textureIntensity);

    // Fragment verwerfen, wenn es transparent ist
    if (finalAlpha < 0.01) discard;

    gl_FragColor = vec4(finalColor, finalAlpha);
}
