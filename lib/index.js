var Surrogate,
  _ = require("lodash"),
  schemas = require("./schemas"),
  defineSurrogateRoutes = require("./define-surrogate-routes"),
  Errors = require("./errors"),
  Hapi = require("hapi");

/**
 * Surrogate
 */

Surrogate = function (options) {
  options = options || {};
  this.port = options.port || 1337;
  this.ip = options.ip || "0.0.0.0";
  this.verbose = options.verbose || false;
  this.initialState = options.initialState || {};
  this._routes = [];
  this.hapiRoutes = [];
  this.delay = 0;
  this._server = null;
};

Surrogate.prototype._assertNewRoute = function (routeCfg) {
  _.each(this._routes, function (route) {
    if (route.name === routeCfg.name) {
      throw new Errors.ConfigurationError(
        "Route with name '" + routeCfg.name + "' is already defined."
      );
    }
  });
};

Surrogate.prototype.jsonRoute = function (routeCfg) {
  schemas.validateConfig(routeCfg, schemas.route);
  this._assertNewRoute(routeCfg);
  _.each(routeCfg.handlers, function (handler) {
    schemas.validateConfig(handler, schemas.handler);
  });
  this._routes.push(_.extend({}, routeCfg, { type: "application/json" }));
};

Surrogate.prototype.htmlRoute = function (routeCfg) {
  schemas.validateConfig(routeCfg, schemas.route);
  this._assertNewRoute(routeCfg);
  _.each(routeCfg.handlers, function (handler) {
    schemas.validateConfig(handler, schemas.handler);
  });
  this._routes.push(_.extend({}, routeCfg, { type: "text/html" }));
};

Surrogate.prototype.hapiRoute = function (routeCfg) {
  this.hapiRoutes.push(routeCfg);
};

Surrogate.prototype.start = function (cb) {
  var self = this;
  console.log("starting server on " + this.ip + ":" + this.port + "...");
  this.server = new Hapi.Server(this.ip, this.port, {
    router: { stripTrailingSlash: true }
  });

  defineSurrogateRoutes.apply(this);

  this.reset(false, function () {
    self.server.start(cb);
  });
};

Surrogate.prototype.stop = function (cb) {
  console.log("stopping server...");
  this.server.stop(cb);
};

Surrogate.prototype.reset = function (logReset, cb) {
  if (logReset) { console.log("resetting to initial state..."); }
  this.routes = _.cloneDeep(this._routes);
  if (_.isFunction(cb)) { cb(); }
};


module.exports = Surrogate;
