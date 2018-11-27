/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.GlowShader = {

  uniforms: {
    "tInput": { type: "t", value: null },
    "tMask": { type: "t", value: null },
    "intensity": { type: "f", value: null },
    "threshold": { type: "f", value: null },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join( "\n" ),

  fragmentShader: [
    "const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);",
    "const vec4 BLUE = vec4(0.0, 0.0, 1.0, 1.0);",
    "const vec4 BLACK = vec4(0.0);",
    "const vec4 WHITE = vec4(1.0);",
    "uniform sampler2D tInput;",
    "uniform sampler2D tMask;",
    "uniform float intensity;",
    "uniform float threshold;",
    "varying vec2 vUv;",
    "const int c_samplesX = 5;",
    "const int c_samplesY = 5;",
    "const float c_textureSize = 512.0;",
    "const float c_pixelSize = (1.0 / c_textureSize);",
    "const int c_halfSamplesX = c_samplesX / 2;",
    "const int c_halfSamplesY = c_samplesY / 2;",

    "vec4 boxBlur (in vec2 uv, in sampler2D tex)",
    "{",
        "int c_distX = c_halfSamplesX + 1;",
        "int c_distY = c_halfSamplesY + 1;",

        "float c_pixelWeight = 1.0 / float((c_distX*2+1)*(c_distY*2+1));",

        "vec4 ret = vec4(0);",
        "for (int iy = -c_halfSamplesY; iy <= c_halfSamplesY; ++iy)",
        "{",
          "for (int ix = -c_halfSamplesX; ix <= c_halfSamplesX; ++ix)",
            "{",
                "vec2 offset = vec2(ix, iy) * c_pixelSize;",
                "ret += texture2D(tex, uv + offset) * c_pixelWeight;",
            "}",
        "}",
        "return ret;",
    "}",

    "void main() {",
      "vec4 color = texture2D(tInput, vUv);",
      "vec4 blur = boxBlur(vUv, tMask);",
      "color = mix(WHITE, color, step(threshold, distance(color, RED)));",
      "color = mix(WHITE, color, step(threshold, distance(color, BLUE)));",
      "color += blur * intensity;",
      "gl_FragColor = vec4(color.rgb, 1.0);",

    "}"

  ].join( "\n" )

};
