(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Calendar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*!
 * Copyright 2015, Tim Branyen (@tbranyen)
 * calendar.js may be freely distributed under the MIT license.
 */
var Events = _dereq_('./util/events');
var extend = _dereq_('./util/extend');

var getFullMonth = function(month) {
  return [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ][month || this.getMonth()];
};

var getFullWeek = function(day) {
  return [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "Saturday"
  ][day || this.getDay()];
};

// Calendur constructor.
function Calendar(el, options) {
  // Use the passed element or find it via selector lookup.
  this.el = typeof el === "string" ? document.querySelector(el) : el;
  // Useful date object to represent today.
  this.today = new Date();

  // Set default options.
  this.options = {
    // The element tagNames to create by default (a table).
    tagName: { month: "table", week: "tr", day: "td" },

    // The classNames to use on respective elements.
    className: { month: "month", week: "week", day: "day" }
  };

  // Mix the options passed into the constructor into the options object.
  extend(this.options, options);
  // Give this instance events!
  extend(this, Events);

  // Store callbacks for `renderDay` this should not be directly modified.
  this._callbacks = {};
}

// Attach the version to the instance.
Calendar.version = _dereq_('../package.json').version;

Calendar.prototype = {
  // Initial setup and rendering of the calendar control.
  init: function() {
    // Create a new date object starting today.
    this.setDate(new Date());

    // Allow events to run before initial update and render.
    this.emit("initialize", this);

    // Reset to today for initial render.
    this.update();

    // Render initial table state.
    this.render();

    return this;
  },

  // Attach a date object to the calendar for rendering window purposes.
  setDate: function(date) {
    this.date = date;

    // Extend the Date object with some additional convenience methods.
    extend(this.date, {
      getFullMonth: getFullMonth,
      getFullWeek: getFullWeek
    });
  },

  // Create the internal month matrix.
  update: function() {
    var weekDay, day, weekOffset, firstDay, offset, previousMonth, nextMonth;
    // Internal month matrix array.
    var month = [
      [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]
    ];
    // Create a shadow date to work off, as to not alter the interior date.
    var shadow = new Date(this.date);
    // Start the day counter off at 1 (first day in the month).
    var dayCounter = 1;
    // Save the current month for future comparisons to find the bounding
    // dates of the month.
    var currentMonth = shadow.getMonth();

    // Start the month.
    shadow.setDate(dayCounter);

    // Fill the month up with the correct dates.  Craft the entire month
    // object here... figure out the current week and then offset everything
    // correctly and then just pad the first and last week accordingly.
    while (true) {
      // Once we've exceeded into the next month, bail out for now.
      if (shadow.getMonth() !== currentMonth) {
        break;
      }

      // Find the current day (1-31).
      day = shadow.getDate();
      // Find the weekDay (0-6).
      weekDay = shadow.getDay();
      // Find the week.
      weekOffset = Math.floor((day+(6-weekDay))/7);

      // First day offset cache.
      if (dayCounter === 1) {
        firstDay = [weekOffset, weekDay];
      }

      // Add this day to the month array.
      month[weekOffset][weekDay] = {
        value: new Date(shadow),
        type: "day"
      };

      // Progress to tomorrow.
      shadow.setDate(++dayCounter);
    }

    // Craft it based off the current month.
    previousMonth = new Date(shadow);

    // Start at the beginning of the month.
    previousMonth.setDate(1);
    // Set to the previous month.
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    // Fill in previous month.
    month.forEach(function(week, weekOffset) {
      // Ensure we're operating only on weeks that exist on or prior to the
      // first day.
      if (weekOffset <= firstDay[0]) {
        // Iterate over all the days.
        week.forEach(function(day, weekDay) {
          // Calculate the offset.
          var dayOffset = (weekOffset * 7) + weekDay;
          var firstDayOffset = (firstDay[0] * 7) + firstDay[1];
          // If the first day of the month does not land on the same week,
          // then use the end of the week to offset.
          var dayNormalized = weekOffset === firstDay[0] ? firstDay[1] : 7;

          // If we are operating within the dead zone (previous month).
          if (weekDay < dayNormalized) {
            // Only calculate the offset once for the first.
            offset = !offset ? -(firstDayOffset - dayOffset) : 1;
            previousMonth.setDate(previousMonth.getDate() + offset);
            week[weekDay] = {
              value: new Date(previousMonth),
              type: "prev"
            };
          }
        }, this);
      }
    }, this);

    // Craft it based off the current month.
    nextMonth = new Date(shadow);

    // Start at the end of the month.
    nextMonth.setDate(shadow.getDate()-1);

    // Fill in next month.
    month.forEach(function(week, currentWeekOffset) {
      // Ensure we're operating only on weeks that exist on or after the
      // last day.
      if (currentWeekOffset >= weekOffset) {
        // Iterate over all the days.
        week.forEach(function(day, currentWeekDay) {
          // If we are operating within the dead zone (previous month).
          if (!day) {
            // Only calculate the offset once for the first.
            nextMonth.setDate(nextMonth.getDate() + 1);
            week[currentWeekDay] = {
              value: new Date(nextMonth),
              type: "next"
            };
          }
        }, this);
      }
    }, this);

    // Assign the internal month matrix.
    this._month = month;

    // Emit an update event.
    this.emit("update", this);

    return this;
  },

  // Allow an intermediary
  renderDay: function(type, callback) {
    // If no type is specified, then run the callback for all types.
    if (typeof type === "function") {
      type = "all";
      callback = type;
    }

    // Assign type string and render function.
    this._callbacks[type] = callback;
    this._callbacks["all"] = callback;
  },

  // Create the calendar DOM structure.
  render: function() {
    // Ensure the date matrix is updated.
    this.update();

    // Create a month element to hold the calendar weeks.
    var monthEl = document.createElement(this.options.tagName.month);
    // Set the className.
    monthEl.className = this.options.className.month;

    // Allow a developer to modify the element before rendering.
    this.emit("beforeRender", this);

    // Iterate over all the weeks and add each one.
    this._month.forEach(function(week) {
      // Create a week element to hold the week days.
      var weekEl = document.createElement(this.options.tagName.week);
      // Set the className.
      weekEl.className = this.options.className.week;

      // Iterate over all the days and add each one.
      week.forEach(function(day) {
        var dayEl = document.createElement(this.options.tagName.day);
        // Set the className.
        dayEl.className = this.options.className.day;

        // Set today object, ensure year/month/day are all equal.
        if (day.value.getFullYear() === this.today.getFullYear() &&
            day.value.getMonth() === this.today.getMonth() &&
            day.value.getDate() === this.today.getDate()
        ) {
          day.type = "today";
        }

        // Apply class type styles, but only if the type isn't already added.
        if (dayEl.className.split(' ').indexOf(day.type) === -1) {
          dayEl.className += " " + day.type;
        }

        // Set active object, ensure year/month/day are all equal.
        if (day.value.getFullYear() === this.date.getFullYear() &&
            day.value.getMonth() === this.date.getMonth() &&
            day.value.getDate() === this.date.getDate()
        ) {
          dayEl.className += " active";
        }

        // By default set the innerHTML to the day value.  If a custom
        // `renderDay` function is specified, then allow that function to
        // process a different value to the element.
        if (this._callbacks[day.type]) {
          this._callbacks[day.type](dayEl, day);

          if (this._callbacks["all"]) {
            this._callbacks["all"](dayEl, day);
          }
        } else {
          dayEl.innerHTML = day.value.getDate() || "&nbsp;";
        }

        // Add the day element to the week element.
        weekEl.appendChild(dayEl);
      }, this);

      // Add the week element to the month element.
      monthEl.appendChild(weekEl);
    }, this);

    // Clear out existing markup.
    this.el.innerHTML = '';

    // Attach the month element.
    this.el.appendChild(monthEl);

    // Allow a developer to modify the element after rendering is complete.
    this.emit("afterRender", this);

    return this;
  }
};

// Expose this for public consumption.
Calendar.Events = Events;

module.exports = Calendar;

},{"../package.json":4,"./util/events":2,"./util/extend":3}],2:[function(_dereq_,module,exports){
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

},{}],3:[function(_dereq_,module,exports){
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

},{}],4:[function(_dereq_,module,exports){
module.exports={
  "name": "calendar.js",
  "version": "1.0.6",
  "description": "A basic Calendar control",
  "main": "dist/calendar.js",
  "directories": {
    "example": "example"
  },
  "scripts": {
    "build": "npm run browserify",
    "browserify": "browserify -s Calendar lib/index.js | derequire > dist/calendar.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": "https://github.com/tbranyen/calendar.js",
  "author": "Tim Branyen (@tbranyen)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/tbranyen/calendar.js/issues"
  },
  "homepage": "https://github.com/tbranyen/calendar.js#readme",
  "devDependencies": {
    "browserify": "^11.1.0",
    "derequire": "^2.0.2"
  }
}

},{}]},{},[1])(1)
});