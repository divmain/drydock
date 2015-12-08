var path = require("path");

var config = module.exports = {};

config.root = __dirname;
config.src = "frontend";
config.dest = "frontend-dist";
config.srcFullPath = path.join(config.root, config.src);
config.destFullPath = path.join(config.root, config.dest);

config.js = "js";
config.assets = "frontend/assets";
config.styles = "frontend/styles";
config.karmaConfig = "karma.conf.js";
config.testRunner = path.join(config.src, "test-runner.js");

config.libSrc = "lib";
