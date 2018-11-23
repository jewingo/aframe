/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/CopyColorShader');
require('../../../../vendor/effects/GlowShader');
require('../../../../vendor/effects/GlowPass');

registerEffect('glow', {
  initPass: function () {
    var size = this.el.renderer.getDrawingBufferSize();
    this.pass = new THREE.GlowPass(size);
    this.update();
  }
});
