calendar.js
===========

A tiny component for creating calendars in modern web browsers with
performance, flexibility, and stability in mind.

![](http://tbranyen.com/u/20155a00.png)

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

Include in your application.

``` html
<script src="/js/calendar.js"></script>
```

## Usage ##

This will show how to create a new `Calendar` instance, configure, and render
it into the page `Document`.

### Creating a new Calendar instance ###

To create a new Calendar instance to configure:

``` javascript
// Must pass in either a DOMNode or a string selector.
var cal = new Calendar(".calendar");

// Call init once you have finished binding event handlers and changed options.
cal.init();
```

### Change default tag and class names ###

If you wish to change default tag and class names simply override them on the
`options` object.

Changing the element types that are created is this simple (useful if you want
to avoid having `<table/>`'s built):

``` javascript
// Overriding only a specific tagName property.
cal.options.tagName.month = "div";

// Overriding all tagName properties.
cal.options.tagName = {
  month: "table",
  week: "tr",
  day: "td"
};
```

Changing the class name's used is done in the manner:

``` javascript
// Overriding only a specific className property.
cal.options.className.month = "month";

// Overriding all className properties.
cal.options.className = {
  month: "month",
  week: "week",
  day: "day"
};
```

### Utilizing custom Calendar events ###

There are several events you can listen to, which can be used to update your UI
accordingly.

* `initialize` is triggered once the calendar is created
* `update` is triggered after the `update` function is called
* `beforeRender` is triggered before rendering starts
* `afterRender` is triggered after rendering ends

An example of when binding to an event can be useful:

``` javascript
// Update a month label with the current calendar month.
cal.on("update", function(cal) {
  $(".month").html(cal.date.getFullMonth());
});
```

You can create and trigger custom events, using `on` and `trigger` functions
respectively.

## Building ##

``` bash
npm install
npm run build
```

## Contributing ##

Before contributing ensure you understand how to build this project and all
fixes should include matching unit tests, pass linting, and provide an updated
minified source file for distribution.

Please follow the style found within the source and exercise solid judgement.
