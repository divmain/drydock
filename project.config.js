var path = require("path");

module.exports = {
  root: __dirname,

  frontendSrc: "frontend",
  frontendDest: "frontend-dist",
  frontendSrcFullPath: path.join(__dirname, "frontend"),
  frontendDestFullPath: path.join(__dirname, "frontend-dist"),
  frontendJs: "js",
  frontendAssets: "assets",
  frontendStyles: "styles",
  testFullPath: path.join(__dirname, "spec"),
  testRunner: "spec/test-runner.js",
  karmaConfig: "karma.conf.js",
  port: 3000,
  testPort: 3001
};
