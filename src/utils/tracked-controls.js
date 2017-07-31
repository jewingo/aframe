var AXIS_LABELS = ['x', 'y', 'z', 'w'];

/**
 * Return enumerated gamepads matching id prefix.
 *
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 */
module.exports.getGamepadsByPrefix = function (idPrefix) {
  var gamepadsList = [];
  var gamepad;
  var gamepads = navigator.getGamepads && navigator.getGamepads();
  if (!gamepads) { return gamepadsList; }

  for (var i = 0; i < gamepads.length; ++i) {
    gamepad = gamepads[i];
    // need to check that gamepad is valid, since browsers may return array of null values
    if (gamepad) {
      if (!idPrefix || gamepad.id.indexOf(idPrefix) === 0) {
        gamepadsList.push(gamepad);
      }
    }
  }
  return gamepadsList;
};

/**
 * Called on controller component `.play` handlers.
 * Check if controller matches parameters and inject tracked-controls component.
 * Handle event listeners.
 * Generate controllerconnected or controllerdisconnected events.
 *
 * @param {object} component - the tracked controls component.
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 * @param {object} queryObject - map of values to match (hand; index among controllers with idPrefix)
 */
module.exports.checkControllerPresentAndSetup = function (component, idPrefix, queryObject) {
  var el = component.el;
  var controller = isControllerPresent(component, idPrefix, queryObject);

  // If component was previously paused and now playing, re-add event listeners.
  // Handle the event listeners here since this helper method is control of calling
  // `.addEventListeners` and `.removeEventListeners`.
  if (component.controllerPresent && !component.controllerEventsActive) {
    component.addEventListeners();
  }

  // Nothing changed, no need to do anything.
  if (controller === component.controllerPresent) { return controller; }

  component.controller = controller;

  // Update controller presence.
  if (controller) {
    component.injectTrackedControls(controller);
    component.addEventListeners();
    el.emit('controllerconnected', {name: component.name, component: component});
  } else {
    component.removeEventListeners();
    el.emit('controllerdisconnected', {name: component.name, component: component});
  }
};

/**
 * Enumerate controllers (as built by system tick, e.g. that have pose) and check if they match parameters.
 *
 * @param {object} component - the tracked controls component.
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 * @param {object} queryObject - map of values to match (hand; index among controllers with idPrefix)
 */
function isControllerPresent (component, idPrefix, queryObject) {
  var controller;
  var index = 0;
  var gamepad;
  var isPrefixMatch;
  var gamepads;
  var sceneEl = component.el.sceneEl;

  var trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return controller; }
  gamepads = trackedControlsSystem.controllers;
  if (!gamepads || gamepads.length === 0) {
    trackedControlsSystem.updateControllerList();
    gamepads = trackedControlsSystem.controllers;
  }

  if (!gamepads) { return controller; }

  for (var i = 0; i < gamepads.length; ++i) {
    gamepad = gamepads[i];
    isPrefixMatch = (!idPrefix || idPrefix === '' || gamepad.id.indexOf(idPrefix) === 0);
    controller = isPrefixMatch && gamepad;
    if (controller && queryObject.hand) {
      controller = (gamepad.hand === queryObject.hand) && gamepad;
    }
    if (controller && queryObject.index) {
      controller = (index === queryObject.index) && gamepad; // need to use count of gamepads with idPrefix
    }
    if (controller) { break; }
    if (isPrefixMatch) { index++; } // update count of gamepads with idPrefix
  }

  if (controller) { controller.index = index; }
  return controller;
}

module.exports.isControllerPresent = isControllerPresent;

/**
 * Emit specific moved event(s) if axes changed, based on original axismoved event.
 *
 * @param {object} self - the component in use (e.g. oculus-touch-controls, vive-controls...)
 * @param {array} axesMapping - the axes mapping to process
 * @param {object} evt - the event to process
 */
module.exports.emitIfAxesChanged = function (self, axesMapping, evt) {
  Object.keys(axesMapping).forEach(function (key) {
    var axes = axesMapping[key];
    var changed = evt.detail.changed;
    // If no changed axes given at all, or at least one changed value is true in the array,
    if (axes.reduce(function (b, axis) { return b || changed[axis]; }, !changed)) {
      // An axis has changed, so emit the specific moved event, detailing axis values.
      var detail = {};
      axes.forEach(function (axis) { detail[AXIS_LABELS[axis]] = evt.detail.axis[axis]; });
      self.el.emit(key + 'moved', detail);
      // If we updated the model based on axis values, that call would go here.
    }
  });
};
