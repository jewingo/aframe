var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

var bind = utils.bind;
var checkControllerPresentAndSetup = utils.trackedControls.checkControllerPresentAndSetup;

var GAMEPAD_ID_PREFIX = 'OpenVR Tracker';

/**
 * Vive controls.
 * Interface with Vive controllers and map Gamepad events to controller buttons:
 * trackpad, trigger, grip, menu, system
 * Load a controller model and highlight the pressed buttons.
 */
module.exports.Component = registerComponent('vive-tracker-controls', {
  schema: {model: {default: true}},

  init: function () {
    this.checkControllerPresentAndSetup = checkControllerPresentAndSetup;  // To allow mock.
    this.controllerPresent = false;
    this.bindMethods();
  },

  addEventListeners: function () {},
  removeEventListeners: function () {},

  bindMethods: function () {
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.addEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.removeEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  /**
   * Once OpenVR returns correct hand data in supporting browsers, we can use hand property.
   * var isPresent = this.checkControllerPresentAndSetup(this.el.sceneEl, GAMEPAD_ID_PREFIX,
                                                        { hand: data.hand });
   * Until then, use hardcoded index.
   */
  checkIfControllerPresent: function () {
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {});
  },

  injectTrackedControls: function () {
    // If we have an OpenVR Gamepad, use the fixed mapping.
    this.el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      rotationOffset: 0
    });

    // Load model.
    // if (!this.data.model) { return; }
    // this.el.setAttribute('obj-model', {
    //   obj: VIVE_CONTROLLER_MODEL_OBJ_URL,
    //   mtl: VIVE_CONTROLLER_MODEL_OBJ_MTL
    // });
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    this.checkIfControllerPresent();
  },

  onModelLoaded: function (evt) {
    var buttonMeshes;
    var controllerObject3D = evt.detail.model;
    var self = this;

    if (!this.data.model) { return; }

    // Store button meshes object to be able to change their colors.
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.grip = {
      left: controllerObject3D.getObjectByName('leftgrip'),
      right: controllerObject3D.getObjectByName('rightgrip')
    };
    buttonMeshes.menu = controllerObject3D.getObjectByName('menubutton');
    buttonMeshes.system = controllerObject3D.getObjectByName('systembutton');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('touchpad');
    buttonMeshes.trigger = controllerObject3D.getObjectByName('trigger');

    // Set default colors.
    Object.keys(buttonMeshes).forEach(function (buttonName) {
      self.setButtonColor(buttonName, self.data.buttonColor);
    });

    // Offset pivot point.
    controllerObject3D.position.set(0, -0.015, 0.04);
  }
});
