/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/CopyColorShader');
require('../../../../vendor/effects/GlowShader');
require('../../../../vendor/effects/GlowPass');

registerEffect('glow', {
  schema: {
    intensity: {default: 1.0, min: 0.0, max: 10.0},
    radius: {default: 0.01},
    renderDepth: {default: true},
    threshold: {default: 0.001, min: 0.0, max: 1.0}
  },
  initPass: function () {
    var data = this.data;
    var size = this.el.renderer.getDrawingBufferSize();
    this.pass = new THREE.GlowPass(size, data.radius, data.intensity, data.threshold, data.renderDepth);
  },

  update: function () {
    var data = this.data;
    var pass = this.pass;
    if (!pass) { return; }
    pass.radius = data.radius;
    pass.intensity = data.intensity;
    pass.threshold = data.threshold;
    pass.renderDepth = data.renderDepth;
  }
});
