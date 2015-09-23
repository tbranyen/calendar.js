// Portable & reusable Events object, not too different from what is found
// in Backbone.
//
// (Credits @visionmedia) & Modified from:
// https://raw.github.com/component/emitter/master/index.js
var Events = {
  // Cache all callbacks.
  callbacks: {},

  // Listen on the given `event` with `fn`.
  on: function(event, fn, context){
    var callback = this.callbacks[event] = this.callbacks[event] || [];

    fn._context = context;
    callback.push(fn);

    return this;
  },

  // Adds an `event` listener that will be invoked a single time then
  // automatically removed.
  once: function(event, fn, context){
    var self = this;

    function on() {
      self.off(event, on);
      fn.apply(this, arguments);
    }

    fn._off = on;
    this.on(event, on, context);
    return this;
  },

  // Remove the given callback for `event` or all registered callbacks.
  off: function(event, fn){
    var i;
    var callbacks = this.callbacks[event];

    if (!callbacks) {
      return this;
    }

    // remove all handlers
    if (arguments.length === 1) {
      delete this.callbacks[event];
      return this;
    }

    // remove specific handler
    i = callbacks.indexOf(fn._off || fn);

    if (~i) {
      callbacks.splice(i, 1);
    }

    return this;
  },

  // Emit `event` with the given args.
  emit: function(event){
    var i, len;
    var args = [].slice.call(arguments, 1);
    var callbacks = this.callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);

      for (i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(callbacks[i]._context || this, args);
      }
    }

    return this;
  },

  // Return array of callbacks for `event`.
  listeners: function(event){
    return this.callbacks[event] || [];
  },

  // Check if this emitter has `event` handlers.
  hasListeners: function(event){
    return Boolean(this.listeners(event).length);
  }
};

module.exports = Events;
