/* global MutationObserver, HTMLElement */
var define = require('./a-register-element').define;
var isNode = require('./a-register-element').isNode;
var utils = require('../utils/');

var bind = utils.bind;
var warn = utils.debug('core:a-node:warn');

/**
 * Base class for A-Frame that manages loading of objects.
 *
 * Nodes can be modified using mixins.
 * Nodes emit a `loaded` event when they and their children have initialized.
 */
class ANode extends HTMLElement {
  constructor () {
    super();
    this.hasLoaded = false;
    this.isNode = true;
    this.mixinEls = [];
    this.mixinObservers = {};
  }

  attachedCallback () {
    var mixins;
    this.sceneEl = this.closestScene();

    if (!this.sceneEl) {
      warn('You are attempting to attach <' + this.tagName + '> outside of an A-Frame ' +
           'scene. Append this element to `<a-scene>` instead.');
    }

    this.hasLoaded = false;
    this.emit('nodeready', {}, false);

    mixins = this.getAttribute('mixin');
    if (mixins) { this.updateMixins(mixins); }
  }

  attributeChangedCallback (attr, oldVal, newVal) {
    if (attr === 'mixin') { this.updateMixins(newVal, oldVal); }
  }

  /**
   * Returns the first scene by traversing up the tree starting from and
   * including receiver element.
  */
  closestScene () {
    var element = this;
    while (element) {
      if (element.isScene) { break; }
      element = element.parentElement;
    }
    return element;
  }

  /**
   * Returns first element matching a selector by traversing up the tree starting
   * from and including receiver element.
   *
   * @param {string} selector - Selector of element to find.
   */
  closest (selector) {
    var matches = this.matches || this.mozMatchesSelector ||
      this.msMatchesSelector || this.oMatchesSelector || this.webkitMatchesSelector;
    var element = this;
    while (element) {
      if (matches.call(element, selector)) { break; }
      element = element.parentElement;
    }
    return element;
  }

  detachedCallback () {
    this.hasLoaded = false;
  }

  /**
   * Wait for children to load, if any.
   * Then emit `loaded` event and set `hasLoaded`.
   */
  load (cb, childFilter) {
    var children;
    var childrenLoaded;
    var self = this;

    if (this.hasLoaded) { return; }

    // Default to waiting for all nodes.
    childFilter = childFilter || isNode;
    // Wait for children to load (if any), then load.
    children = this.getChildren();
    childrenLoaded = children.filter(childFilter).map(function (child) {
      return new Promise(function waitForLoaded (resolve) {
        if (child.hasLoaded) { return resolve(); }
        child.addEventListener('loaded', resolve);
      });
    });

    Promise.all(childrenLoaded).then(function emitLoaded () {
      self.hasLoaded = true;
      if (cb) { cb(); }
      self.emit('loaded', undefined, false);
    });
  }

  getChildren () {
    return Array.prototype.slice.call(this.children, 0);
  }

  /**
   * Remove old mixins and mixin listeners.
   * Add new mixins and mixin listeners.
   */
  updateMixins (newMixins, oldMixins) {
    var newMixinIds = newMixins ? newMixins.trim().split(/\s+/) : [];
    var oldMixinIds = oldMixins ? oldMixins.trim().split(/\s+/) : [];

    // Unregister old mixins.
    oldMixinIds.filter(function (i) {
      return newMixinIds.indexOf(i) < 0;
    }).forEach(bind(this.unregisterMixin, this));

    // Register new mixins.
    this.mixinEls = [];
    newMixinIds.forEach(bind(this.registerMixin, this));
  }

  registerMixin (mixinId) {
    if (!this.sceneEl) { return; }
    var mixinEl = this.sceneEl.querySelector('a-mixin#' + mixinId);
    if (!mixinEl) { return; }
    this.attachMixinListener(mixinEl);
    this.mixinEls.push(mixinEl);
  }

  setAttribute (attr, newValue) {
    if (attr === 'mixin') { this.updateMixins(newValue); }
    window.HTMLElement.prototype.setAttribute.call(this, attr, newValue);
  }

  unregisterMixin (mixinId) {
    var mixinEls = this.mixinEls;
    var mixinEl;
    var i;
    for (i = 0; i < mixinEls.length; ++i) {
      mixinEl = mixinEls[i];
      if (mixinId === mixinEl.id) {
        mixinEls.splice(i, 1);
        break;
      }
    }
    this.removeMixinListener(mixinId);
  }

  removeMixinListener (mixinId) {
    var observer = this.mixinObservers[mixinId];
    if (!observer) { return; }
    observer.disconnect();
    this.mixinObservers[mixinId] = null;
  }

  attachMixinListener (mixinEl) {
    var self = this;
    var mixinId = mixinEl.id;
    var currentObserver = this.mixinObservers[mixinId];
    if (!mixinEl) { return; }
    if (currentObserver) { return; }
    var observer = new MutationObserver(function (mutations) {
      var attr = mutations[0].attributeName;
      self.handleMixinUpdate(attr);
    });
    var config = { attributes: true };
    observer.observe(mixinEl, config);
    this.mixinObservers[mixinId] = observer;
  }

  handleMixinUpdate () { /* no-op */ }

  /**
   * Emit a DOM event.
   *
   * @param {string} name - Name of event.
   * @param {object} [detail={}] - Custom data to pass as `detail` to the event.
   * @param {boolean} [bubbles=true] - Whether the event should bubble.
   * @param {object} [extraData] - Extra data to pass to the event, if any.
   */
  emit (name, detail, bubbles, extraData) {
    var data;
    var self = this;
    if (bubbles === undefined) { bubbles = true; }
    data = {bubbles: !!bubbles, detail: detail};
    if (extraData) { utils.extend(data, extraData); }
    return utils.fireEvent(self, name, data);
  }

  /**
   * Return a closure that emits a DOM event.
   *
   * @param {String} name
   *   Name of event (use a space-delimited string for multiple events).
   * @param {Object} detail
   *   Custom data (optional) to pass as `detail` if the event is to
   *   be a `CustomEvent`.
   * @param {Boolean} bubbles
   *   Whether the event should be bubble.
   */
  emitter (name, detail, bubbles) {
    var self = this;
    return function () {
      self.emit(name, detail, bubbles);
    };
  }
}

define('a-node', ANode);
module.exports = ANode;
