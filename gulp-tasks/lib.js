var path = require("path");

var gulp = require("gulp");
var mocha = require("gulp-mocha");

var config = require("../project.config");


/**
 * Lib Tests
 */

gulp.task("test-lib", "Run surrogate backend tests.", function () {
  gulp.src([path.join(config.libSrc, "**/*.spec.js")], { read: false })
    .pipe(mocha({
      reporter: "spec",
      globals: {
        sinon: require("sinon"),
        expect: require("chai").expect
      }
    }));
});
