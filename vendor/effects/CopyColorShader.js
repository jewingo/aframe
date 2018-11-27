THREE.CopyColorShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "tDepth": { value: null },
    "dilation": { value: null },
    "threshold": { value: null },

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
    "const vec4 BLACK = vec4(vec3(0.0), 1.0);",
    "const float NEAR = 0.001;",
    "const float FAR = 1.0;",
    "uniform float amount;",
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tDepth;",
    "uniform float dilation;",
    "uniform float threshold;",
    "varying vec2 vUv;",

    "float normalizeDepth( const in float z) {",
      "float d =  ( NEAR * FAR ) / ( ( FAR - NEAR ) * z - FAR );",
      "return ( d + NEAR ) / ( NEAR - FAR );",
    "}",

    "float isNotColor(vec4 c, vec4 col) {",
      "return step(threshold, distance(c, col));",
    "}",

    "vec4 dilate(vec2 uv, vec4 original){",
      "uv = clamp(uv, vec2(0.0, 0.0), vec2(1.0, 1.0));",
      "vec4 color = texture2D(tDiffuse, uv);",
      "float isNotBlue = isNotColor(color, BLUE);",
      "float isNotRed = isNotColor(color, RED);",
      "color = mix(BLUE, color, isNotBlue);",
      "color = mix(RED, color, isNotRed);",
      "color = mix(color, BLACK, isNotRed * isNotBlue);",
      "return max(original, color);",
    "}",

    "void main() {",
      "vec4 color = vec4(0.0, 0.0, 0.0, 1.0);",
      "color = dilate(vUv, color);",
      "float W = dilation;",

      "if (color == BLACK) {",
        "vec2 uv = vec2(vUv.x - W, vUv.y);",
        "float depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x - W * depth, vUv.y), color);",
        "uv = vec2(vUv.x + W, vUv.y);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x + W * depth, vUv.y), color);",
        "uv = vec2(vUv.x, vUv.y - W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x, vUv.y - W * depth), color);",
        "uv = vec2(vUv.x, vUv.y + W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x, vUv.y + W * depth), color);",

        "uv = vec2(vUv.x - W, vUv.y - W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x - W * depth, vUv.y - W * depth), color);",
        "uv = vec2(vUv.x + W, vUv.y + W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x + W * depth, vUv.y + W * depth), color);",
        "uv = vec2(vUv.x + W, vUv.y - W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x + W * depth, vUv.y - W * depth), color);",
        "uv = vec2(vUv.x - W, vUv.y + W);",
        "depth = 1.0 - normalizeDepth(texture2D(tDepth, uv).x);",
        "color = dilate(vec2(vUv.x - W * depth, vUv.y + W * depth), color);",
      "}",
      //"gl_FragColor = vec4(vec3(depth), 1.0);",
      "gl_FragColor = color;",

    "}"

  ].join( "\n" ),


  fragmentShaderNoDepth: [
    "const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);",
    "const vec4 BLUE = vec4(0.0, 0.0, 1.0, 1.0);",
    "const vec4 BLACK = vec4(vec3(0.0), 1.0);",
    "const float NEAR = 0.001;",
    "const float FAR = 1.0;",
    "uniform float amount;",
    "uniform sampler2D tDiffuse;",
    "uniform float dilation;",
    "uniform float threshold;",
    "varying vec2 vUv;",

    "float isNotColor(vec4 c, vec4 col) {",
      "return step(threshold, distance(c, col));",
    "}",

    "vec4 dilate(vec2 uv, vec4 original){",
      "uv = clamp(uv, vec2(0.0, 0.0), vec2(1.0, 1.0));",
      "vec4 color = texture2D(tDiffuse, uv);",
      "float isNotBlue = isNotColor(color, BLUE);",
      "float isNotRed = isNotColor(color, RED);",
      "color = mix(BLUE, color, isNotBlue);",
      "color = mix(RED, color, isNotRed);",
      "color = mix(color, BLACK, isNotRed * isNotBlue);",
      "return max(original, color);",
    "}",

    "void main() {",
      "vec4 color = vec4(0.0, 0.0, 0.0, 1.0);",
      "color = dilate(vUv, color);",
      "float W = dilation;",

      "if (color == BLACK) {",
        "vec2 uv = vec2(vUv.x - W, vUv.y);",
        "color = dilate(vec2(vUv.x - W, vUv.y), color);",
        "uv = vec2(vUv.x + W, vUv.y);",
        "color = dilate(vec2(vUv.x + W, vUv.y), color);",
        "uv = vec2(vUv.x, vUv.y - W);",
        "color = dilate(vec2(vUv.x, vUv.y - W), color);",
        "uv = vec2(vUv.x, vUv.y + W);",
        "color = dilate(vec2(vUv.x, vUv.y + W), color);",

        "uv = vec2(vUv.x - W, vUv.y - W);",
        "color = dilate(vec2(vUv.x - W, vUv.y - W), color);",
        "uv = vec2(vUv.x + W, vUv.y + W);",
        "color = dilate(vec2(vUv.x + W, vUv.y + W), color);",
        "uv = vec2(vUv.x + W, vUv.y - W);",
        "color = dilate(vec2(vUv.x + W, vUv.y - W), color);",
        "uv = vec2(vUv.x - W, vUv.y + W);",
        "color = dilate(vec2(vUv.x - W, vUv.y + W), color);",
      "}",
      //"gl_FragColor = vec4(vec3(depth), 1.0);",
      "gl_FragColor = color;",

    "}"

  ].join( "\n" )

};
