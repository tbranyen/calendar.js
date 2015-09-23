var slice = Array.prototype.slice;

// Custom extend method.
var extend = function(target) {
  var i, prop, source;
  var sources = slice.call(arguments, 1);

  // Iterate over all object sources.
  for (i = 0; i < sources.length; i++) {
    // Shorthand the source.
    source = sources[i];

    // Ensure the source is defined and an object.
    if (typeof source === "object") {
      // Iterate over all properties in the source.
      for (prop in source) {
        // Assign the property to the source.
        target[prop] = source[prop];
      }
    }
  }

  return target;
};

module.exports = extend;
