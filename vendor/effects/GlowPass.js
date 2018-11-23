THREE.GlowPass = function ( resolution, radius ) {

  THREE.Pass.call( this );

  this.radius = radius;

  this.scene = new THREE.Scene();

  // Geometry, Camera, Scene setup
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), null);
  this.quad.frustumCulled = false; // Avoid getting clipped
  this.scene.add(this.quad);

  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

  // Copy Color Step
  var targetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false,
    depthBuffer: false
  };

  this.colorTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, targetParameters);
  this.colorTarget.texture.name = "colorTarget";
  this.colorTarget.texture.generateMipmaps = false;

  var copyColorShader = THREE.CopyColorShader;
  this.copyColorUniforms = THREE.UniformsUtils.clone( copyColorShader.uniforms );
  this.copyColorShaderMaterial = new THREE.ShaderMaterial({
    uniforms: this.copyColorUniforms,
    vertexShader: copyColorShader.vertexShader,
    fragmentShader: copyColorShader.fragmentShader,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    transparent: false
  });

  // Glow Step
  this.glowTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, targetParameters);
  this.glowTarget.texture.name = "glowTarget";
  this.glowTarget.texture.generateMipmaps = false;

  var glowShader = THREE.GlowShader;
  this.glowUniforms = THREE.UniformsUtils.clone( glowShader.uniforms );
  this.glowShaderMaterial = new THREE.ShaderMaterial({
    uniforms: this.glowUniforms,
    vertexShader: glowShader.vertexShader,
    fragmentShader: glowShader.fragmentShader,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    transparent: false
  });
};

THREE.GlowPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

  constructor: THREE.GlowPass,

  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.quad.material = this.copyColorShaderMaterial;
    this.copyColorUniforms["dilation"].value = this.radius;
    this.copyColorUniforms["tDiffuse"].value = readBuffer.texture;
    renderer.render(this.scene, this.camera, this.colorTarget, false);

    this.quad.material = this.glowShaderMaterial;
    this.glowUniforms["tInput"].value = readBuffer.texture;
    this.glowUniforms["tMask"].value = this.colorTarget.texture;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera, undefined, false);
    } else {
      renderer.render(this.scene, this.camera, readBuffer, false);
    }

    // Restore renderer settings
    renderer.autoClear = oldAutoClear;
  },

  setSize: function ( width, height ) {
    this.colorTarget.setSize(width, height);
    this.glowTarget.setSize(width, height);
  }
});
