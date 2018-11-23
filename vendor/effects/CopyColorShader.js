THREE.CopyColorShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "dilation": { value: null },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "const float color_threshold = 0.5;",
    "const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);",
    "const vec4 BLUE = vec4(0.0, 0.0, 1.0, 1.0);",
    "const vec4 BLACK = vec4(vec3(0.0), 1.0);",
    "uniform float amount;",
    "uniform sampler2D tDiffuse;",
    "uniform float dilation;",
    "varying vec2 vUv;",

    "bool isBlue(vec4 c) {",
      "return c.r < color_threshold && c.g < color_threshold && c.b > 1.0 - color_threshold;",
    "}",

    "bool isRed(vec4 c) {",
      "return c.r > 1.0 - color_threshold && c.g < color_threshold && c.b < color_threshold;",
    "}",

    "vec4 dilate(vec2 uv, vec4 original){",
      "uv = clamp(uv, vec2(0.0, 0.0), vec2(1.0, 1.0));",
      "vec4 color = texture2D(tDiffuse, uv);",
      "if (isBlue(color)) color = BLUE;",
      "else if (isRed(color)) color = RED;",
      "else color = BLACK;",
      "return max(original, color);",
    "}",

    "void main() {",
      "float W = dilation;",
      "vec4 color = vec4(0.0);",
      "color = dilate(vUv, color);",

      "if (!isBlue(color) && !isRed(color)) {",
        "color = dilate(vec2(vUv.x - W, vUv.y), color);",
        "color = dilate(vec2(vUv.x + W, vUv.y), color);",
        "color = dilate(vec2(vUv.x, vUv.y - W), color);",
        "color = dilate(vec2(vUv.x, vUv.y + W), color);",

        "color = dilate(vec2(vUv.x - W, vUv.y - W), color);",
        "color = dilate(vec2(vUv.x + W, vUv.y + W), color);",
        "color = dilate(vec2(vUv.x + W, vUv.y - W), color);",
        "color = dilate(vec2(vUv.x - W, vUv.y + W), color);",
      "}",

      "gl_FragColor = color;",

    "}"

  ].join( "\n" )

};
