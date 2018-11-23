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
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "const float color_threshold = 0.001;",

    "const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);",

    "const vec4 BLUE = vec4(0.0, 0.0, 1.0, 1.0);",

    "const vec4 BLACK = vec4(0.0);",

    "const vec4 WHITE = vec4(1.0);",
    "uniform sampler2D tInput;",
    "uniform sampler2D tMask;",
    "varying vec2 vUv;",
    "const int c_samplesX = 10;",
    "const int c_samplesY = 10;",
    "const float c_textureSize = 512.0;",
    "const float c_pixelSize = (1.0 / c_textureSize);",
    "const int   c_halfSamplesX = c_samplesX / 2;",
    "const int   c_halfSamplesY = c_samplesY / 2;",

    "vec4 boxBlur (in vec2 uv)",
    "{",
        "int c_distX = c_halfSamplesX + 1;",
        "int c_distY = c_halfSamplesY + 1;",

        "float c_pixelWeight = 1.0 / float((c_distX*2+1)*(c_distY*2+1));",

        "vec4 ret = vec4(0);",
        "for (int iy = -c_halfSamplesY; iy <= c_halfSamplesY; ++iy)",
        "{",
          "for (int ix = -c_halfSamplesX; ix <= c_halfSamplesX; ++ix)",
            "{",
                "if (abs(float(iy)) <= float(c_distY) && abs(float(ix)) <= float(c_distX))",
                "{",
                    "vec2 offset = vec2(ix, iy) * c_pixelSize;",
                    "ret += texture2D(tMask, uv + offset) * c_pixelWeight;",
                "}",
            "}",
        "}",
        "return ret;",
    "}",

    "float isBlue(vec4 c) {",
      "return c.r < color_threshold && c.g < color_threshold && c.b > 1.0 - color_threshold ? 1.0 : 0.0;",
    "}",

    "float isRed(vec4 c) {",
      "return c.r > 1.0 - color_threshold && c.g < color_threshold && c.b < color_threshold ? 1.0 : 0.0;",
    "}",

    "void main() {",

      // WHITE
      "vec4 color = texture2D(tInput, vUv);",
      "vec4 blur = boxBlur(vUv);",
      "color = mix(color, WHITE, isRed(color));",
      "color = mix(color, WHITE, isBlue(color));",
      "color += blur;",
      "gl_FragColor = vec4(color.rgb, 1.0);",

    "}"

  ].join( "\n" )

};
