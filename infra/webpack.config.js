var path = require("path");
var webpack = require("webpack");


module.exports = {
  context: path.resolve(__dirname, "../src/ui/"),

  entry: {
    main: "main.js"
  },

  output: {
    path: path.join(__dirname, "../lib/ui/"),
    filename: "[name].js"
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.styl$/, loader: "style-loader!css-loader!autoprefixer-loader!stylus-loader" },
      { test: /\.tmpl$/, loader: "raw" }
    ]
  },

  /**
   * This defines the "root" of your project.  If you `require("some-package")`
   * from within your application JS, Webpack will first check the directory
   * specified in config.root for `some-package.js` before checking node_modules.
   */

  resolve: {
    root: path.join(__dirname, "../src/ui")
  },

  /**
   * For production deployments, we want minified and optimized JS.  These
   * settings are overridden in webpack.dev.config.js.
   */

  plugins: [
    new webpack.DefinePlugin({
      "ENVIRONMENT": JSON.stringify("PROD")
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
