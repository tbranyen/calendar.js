module.exports = function(grunt) {

  grunt.initConfig({
    meta: {
      banner: "/*!\n" + " * calendar.js v0.0.1\n" +
        " * Copyright 2012, Tim Branyen (@tbranyen)\n" +
        " * calendar.js may be freely distributed under" +
        " the MIT license.\n */"
    },

    lint: {
      files: ["grunt.js", "calendar.js"]
    },

    min: {
      "dist/calendar.js": ["<banner>", "calendar.js"]
    },

    watch: {
      files: "<config:lint.files>",
      tasks: "lint test"
    },

    jshint: {
      options: {
        boss: true,
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        node: true
      },
      globals: {}
    }
  });

  // Default task.
  grunt.registerTask("default", "lint min");

};
