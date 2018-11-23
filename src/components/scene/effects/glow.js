/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/CopyColorShader');
require('../../../../vendor/effects/GlowShader');
require('../../../../vendor/effects/GlowPass');

registerEffect('glow', {
  schema: {
    radius: {default: 0.01}
  },
  initPass: function () {
    var data = this.data;
    var size = this.el.renderer.getDrawingBufferSize();
    this.pass = new THREE.GlowPass(size, data.radius);
  },

  update: function () {
    var data = this.data;
    var pass = this.pass;
    if (!pass) { return; }
    pass.radius = data.radius;
  }
});
