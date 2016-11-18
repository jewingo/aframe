var AEntity = require('../../core/a-entity');
var registerElement = require('../../core/a-register-element').registerElement;
var utils = require('../../utils/');

var debug = utils.debug;
var setComponentProperty = utils.entity.setComponentProperty;
var log = debug('extras:primitives:debug');

var primitives = module.exports.primitives = {};

module.exports.registerPrimitive = function registerPrimitive (name, definition) {
  name = name.toLowerCase();
  log('Registering <%s>', name);

  // Deprecation warning for defaultAttributes usage.
  if (definition.defaultAttributes) {
    console.warn("The 'defaultAttributes' object is deprecated. Use 'defaultComponents' instead.");
  }

  var primitive = registerElement(name, {
    prototype: Object.create(AEntity.prototype, {
      defaultComponentsFromPrimitive: {
        value: definition.defaultComponents || definition.defaultAttributes || {}
      },
      deprecated: {value: definition.deprecated || null},
      deprecatedMappings: {value: definition.deprecatedMappings || {}},
      mappings: {value: definition.mappings || {}},
      transforms: {value: definition.transforms || {}},

      createdCallback: {
        value: function () {
          var self = this;
          if (definition.deprecated) {
            console.warn(definition.deprecated);
          }
          this.initXXX();
          this.defaultComponents = utils.extend({}, this.defaultComponents);
          Object.keys(this.defaultComponentsFromPrimitive).forEach(function (name) {
            self.defaultComponents[name] = self.defaultComponentsFromPrimitive[name];
          });
        }
      },

      initXXX: {
        value: function () {
          var attr;
          var initialComponents;
          var i;
          var mapping;
          var mixins;
          var path;
          var self = this;

          // Gather component data from default components.
          initialComponents = this.defaultComponentsFromPrimitive = utils.extend({}, this.defaultComponentsFromPrimitive);

          // Gather component data from mixins.
          mixins = this.getAttribute('mixin');
          if (mixins) {
            mixins = mixins.trim().split(' ');
            mixins.forEach(function (mixinId) {
              var mixinComponents = self.sceneEl.querySelector('#' + mixinId).componentCache;
              Object.keys(mixinComponents).forEach(function setComponent (name) {
                initialComponents[name] = utils.extendDeep(
                  initialComponents[name] || {}, mixinComponents[name]);
              });
            });
          }

          for (i = 0; i < this.attributes.length; i++) {
            attr = this.attributes[i];

            // Gather component data from mappings.
            mapping = this.mappings[attr.name];
            if (mapping) {
              path = utils.entity.getComponentPropertyPath(mapping);
              if (path.constructor === Array) {
                initialComponents[path[0]][path[1]] = attr.value;
              } else {
                initialComponents[path] = attr.value;
              }
              continue;
            }
          }
        }
      },

      /**
       * Sync to attribute to component property whenever mapped attribute changes.
       * If attribute is mapped to a component property, set the component property using
       * the attribute value.
       */
      attributeChangedCallback: {
        value: function (attr, oldVal, value) {
          var componentName = this.mappings[attr];

          if (attr in this.deprecatedMappings) {
            console.warn(this.deprecatedMappings[attr]);
          }

          if (!attr || !componentName) { return; }

          // Set value.
          setComponentProperty(this, componentName, value);
        }
      }
    })
  });

  // Store.
  primitives[name] = primitive;
  return primitive;
};
