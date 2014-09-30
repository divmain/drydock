var _frontendTest,
  path = require("path"),
  _ = require("lodash"),
  map = require("map-stream"),

  // Gulp
  gulp = require("gulp"),
  gulpHelp = require("gulp-help"),
  gutil = require("gulp-util"),
  clean = require("gulp-clean"),
  stylus = require("gulp-stylus"),
  prefix = require("gulp-autoprefixer"),
  eslint = require("gulp-eslint"),
  openUrl = require("open"),

  // Tests
  karma = require("karma").server,
  mocha = require("gulp-mocha"),

  // Webpack
  webpack = require("webpack"),
  WebpackDevServer = require("webpack-dev-server"),

  // Application config
  config = require("./project.config"),
  webpackConfig = require("./webpack.config");


// Change `gulp.task` signature to require task descriptions.
gulpHelp(gulp);


/**
 * Composite Tasks
 */

gulp.task("default", false, ["help"], function () {});

gulp.task(
  "frontend:build",
  "Copy assets, build CSS and JS.",
  ["frontend:lint", "frontend:test-phantom"],
  function () {
    gulp.run("frontend:clean");
    gulp.run("frontend:copy");
    gulp.run("frontend:build:css");
    gulp.run("frontend:build:js");
  }
);

gulp.task(
  "frontend:build-dev",
  "Build, but with unminified JS + sourcemaps.",
  ["frontend:clean"],
  function () {
    gulp.run("frontend:copy");
    gulp.run("frontend:build:css");
    gulp.run("frontend:build:js-dev");
  }
);

gulp.task(
  "frontend:watch",
  "Perform frontend:build-dev when sources change.",
  ["frontend:build-dev"],
  function () {
    gulp.watch(path.join(config.frontendSrcFullPath, "**/*"), ["frontend:build-dev"]);
  }
);


/**
 * Component Tasks
 */

gulp.task("frontend:clean", false, function () {
  return gulp.src(path.join(config.frontendDest, "*"))
    .pipe(clean());
});

gulp.task("frontend:copy", false, function () {
  return gulp.src(
    path.join(config.frontendSrcFullPath, config.frontendAssets, "**/*"),
    { base: path.join(config.frontendSrcFullPath, config.frontendAssets) }
  ).pipe(gulp.dest(config.frontendDestFullPath));
});

gulp.task("frontend:lint", "Lint frontend application- and test-code.", function () {
  var success = true;

  return gulp.src([
    path.join(config.frontendSrcFullPath, "**/*.js"),
    path.join(config.testFullPath, "**/*.js"),
    path.join(config.root, "*.js")
  ])
    .pipe(eslint())
    .pipe(map(function (file, output) {
      success = success && _.every(file.eslint && file.eslint.messages, function (message) {
        return message.severity !== 2;
      });
      return output(null, file);
    }))
    .pipe(eslint.format())
    .on("end", function () {
      if (!success) {
        throw new Error("*** FAILED ESLINT ***");
      }
    });
});


/**
 * Stylus / CSS
 */

gulp.task("frontend:build:css", "Build CSS.", function () {
  return gulp.src(path.join(config.frontendSrcFullPath, config.frontendStyles, "*"))
    .pipe(stylus({
      set: ["compress"],
      define: { "ie8": true }
    }))
    .pipe(prefix("last 1 version", "> 1%", "ie 8"))
    .pipe(gulp.dest(path.join(config.frontendDestFullPath, "styles")));
});


/**
 * JS
 */

gulp.task("frontend:build:js", "Build minified JS.", function (callback) {
  var webpackConf = _.cloneDeep(webpackConfig);

  webpackConf.plugins = webpackConf.plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]);

  webpack(webpackConf, function (err, stats) {
    if (err) {
      throw new gutil.PluginError("build:js", err);
    }
    gutil.log("[build:js]", stats.toString({
      colors: true
    }));
    callback();
  });
});

gulp.task("frontend:build:js-dev", "Build unminified JS with sourcemaps.", function (callback) {
  var webpackConf = _.cloneDeep(webpackConfig);
  webpackConf.devtool = "sourcemap";
  webpackConf.debug = true;

  webpack(webpackConf, function (err, stats) {
    if (err) {
      throw new gutil.PluginError("build:js-dev", err);
    }
    gutil.log("[build:js-dev]", stats.toString({
      colors: true
    }));
    callback();
  });
});


/**
 * Frontend Tests
 */

_frontendTest = function (includeCoverage) {
  var server,
    wpConfig = Object.create(webpackConfig);

  wpConfig.entry = { test: "mocha!" + path.join(config.root, config.testRunner) };
  wpConfig.debug = true;
  wpConfig.devtool = "source-map";

  if (includeCoverage) {
    wpConfig.module.postLoaders = [{
      test: /^((?!(\/spec\/|\/node_modules\/)).)*$/,
      loader: "coverjs-loader"
    }];
  }

  server = new WebpackDevServer(webpack(wpConfig), {
    hot: true,
    quiet: false,
    noInfo: false,
    watchDelay: 300,
    publicPath: "/",
    stats: {
      colors: true
    }
  });

  server.listen(9890, "localhost", function (err) {
    if (err) { throw new gutil.PluginError("[webpack-dev-server]", err); }
    openUrl("http://localhost:9890/test.bundle");
  });

  return server;
};

gulp.task("frontend:test", "Run unit tests in the browser.", _.partial(_frontendTest, false));
gulp.task("frontend:test-coverage", "Run unit tests in browser, include coverage.",
  _.partial(_frontendTest, true));

gulp.task("frontend:test-karma", "Auto-run unit tests in multiple browsers.", function (done) {
  karma.start({
    configFile:  path.join(config.root, config.karmaConfig),
    browsers: ["Chrome", "Firefox", "Safari"],
    singleRun: true
  }, function (err) {
    if (err) {
      done(err);
      process.exit(1);
    }
    done();
    process.exit(0);
  });
});

gulp.task("frontend:test-phantom", "Run browser unit tests in the console.", function (done) {
  karma.start({
    configFile: path.join(config.root, config.karmaConfig),
    browsers: ["PhantomJS"],
    singleRun: true
  }, function (err) {
    if (err) {
      done(err);
      process.exit(1);
    }
    done();
    process.exit(0);
  });
});

gulp.task("frontend:test-watch", "Run tests in console; run again on change.", function (done) {
  karma.start({
    configFile: path.join(config.root, config.karmaConfig),
    browsers: ["PhantomJS"],
    singleRun: false
  }, function (err) {
    if (err) {
      done(err);
      process.exit(1);
    }
    done();
    process.exit(0);
  });
});

/**
 * Lib Tests
 */

gulp.task("lib:test", "Run surrogate backend tests.", function () {
  gulp.src([path.join(config.testFullPath, "lib/**/*.js")], { read: false })
    .pipe(mocha({
      reporter: "spec",
      globals: {
        sinon: require("sinon"),
        expect: require("chai").expect
      }
    }));
});
