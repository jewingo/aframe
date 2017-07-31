var registerComponent = require('../../core/component').registerComponent;

var utils = require('../../utils/');
var bind = utils.bind;
var constants = require('../../constants/');

var shouldCaptureKeyEvent = utils.shouldCaptureKeyEvent;

var SPECTATOR_CAMERA_ATTR = 'data-aframe-spectator-camera';

/**
 * Component to embed an a-frame scene within the layout of a 2D page.
 */
module.exports.Component = registerComponent('spectator-camera', {
  schema: {trackerControls: {default: false}},
  init: function () {
    // Wait for the scene to load before setting up the camera
    this.el.addEventListener('loaded', bind(this.setupSpectatorCamera, this));
    this.onKeyDown = bind(this.onKeyDown, this);
  },

  remove: function () {
    this.removeKeyEventListeners();
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  pause: function () {
    this.removeKeyEventListeners();
  },

  attachKeyEventListeners: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  removeKeyEventListeners: function () {
    window.removeEventListener('keydown', this.onKeyDown);
  },

  onKeyDown: function (event) {
    var deltaHeight = 0;
    var deltaFov = 0;
    var position = this.spectatorCameraContainerEl.getAttribute('position');
    var fov = this.spectatorCameraEl.getAttribute('camera').fov;
    if (!shouldCaptureKeyEvent(event)) { return; }

    // Height controls
    if (event.code === 'KeyE') { deltaHeight = 0.1; }
    if (event.code === 'KeyQ') { deltaHeight = -0.1; }
    this.spectatorCameraContainerEl.setAttribute('position', {
      x: position.x,
      y: position.y + deltaHeight,
      z: position.z
    });

    // Delta FOV
    if (event.code === 'KeyM') { deltaFov = 0.2; }
    if (event.code === 'KeyN') { deltaFov = -0.2; }
    this.spectatorCameraEl.setAttribute('camera', 'fov', fov + deltaFov);
  },

  /**
   * Create a default camera if user has not added one during the initial scene traversal.
   *
   * Default camera offset height is at average eye level (~1.6m).
   */
  setupSpectatorCamera: function () {
    var sceneEl = this.el;
    var spectatorCameraEl;
    // Set up spectator camera.
    var spectatorCameraContainerEl = this.spectatorCameraContainerEl = document.createElement('a-entity');
    this.spectatorCameraEl = spectatorCameraEl = document.createElement('a-entity');
    spectatorCameraEl.setAttribute('position', '0 0 0');
    spectatorCameraEl.setAttribute(SPECTATOR_CAMERA_ATTR, '');
    spectatorCameraEl.setAttribute('camera', {active: false, userHeight: constants.DEFAULT_CAMERA_HEIGHT, fov: 63});
    spectatorCameraEl.setAttribute('wasd-controls', '');
    spectatorCameraEl.setAttribute('look-controls', 'hmdEnabled: false');
    spectatorCameraEl.setAttribute('vive-tracker-controls', '');
    spectatorCameraEl.setAttribute(constants.AFRAME_INJECTED, '');
    spectatorCameraEl.addEventListener('loaded', function spectatorCameraLoaded () {
      sceneEl.spectatorCameraEl = spectatorCameraEl;
      sceneEl.emit('spectator-camera-ready', {cameraEl: spectatorCameraEl});
    });
    spectatorCameraContainerEl.appendChild(spectatorCameraEl);
    sceneEl.appendChild(spectatorCameraContainerEl);
  }
});
