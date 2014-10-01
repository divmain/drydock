var Surrogate,
  invalidRoute = /^\/surrogate\//,
  _ = require("lodash"),
  schemas = require("./schemas"),
  defineSurrogateRoutes = require("./surrogate-routes"),
  defineUserRoutes = require("./user-routes"),
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
  this._state = options.initialState || {};
  this._routes = [];
  this._staticRoutes = [];
  this._hapiRoutes = [];
  this._server = null;
};

Surrogate.prototype._assertValidRoute = function (routeCfg) {
  _.each(this._routes, function (route) {
    if (route.name === routeCfg.name) {
      throw new Errors.ConfigurationError(
        "Route with name '" + routeCfg.name + "' is already defined."
      );
    }
    if (invalidRoute.test(routeCfg.path)) {
      throw new Errors.ConfigurationError(
        "Route with path '" + routeCfg.path + "' is invalid."
      );
    }
  });
};

Surrogate.prototype.jsonRoute = function (routeCfg) {
  schemas.validateConfig(schemas.route, routeCfg);
  this._assertValidRoute(routeCfg);
  _.each(routeCfg.handlers, _.partial(schemas.validateConfig, schemas.handler));
  this._routes.push(_.extend({}, routeCfg, { type: "application/json" }));
};

Surrogate.prototype.htmlRoute = function (routeCfg) {
  schemas.validateConfig(schemas.route, routeCfg);
  this._assertValidRoute(routeCfg);
  _.each(routeCfg.handlers, _.partial(schemas.validateConfig, schemas.handler));
  this._routes.push(_.extend({}, routeCfg, { type: "text/html" }));
};

Surrogate.prototype.hapiRoute = function (routeCfg) {
  this._hapiRoutes.push(routeCfg);
};

Surrogate.prototype.staticDir = function (staticCfg) {
  schemas.validateConfig(schemas.staticDir, staticCfg);
  this._staticRoutes.push(staticCfg);
};

Surrogate.prototype.start = function (cb) {
  var self = this;
  console.log("starting server on " + this.ip + ":" + this.port + "...");

  this.server = new Hapi.Server(this.ip, this.port, {
    router: { stripTrailingSlash: true }
  });

  defineSurrogateRoutes.apply(this);
  defineUserRoutes.apply(this);

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
  this.staticRoutes = _.cloneDeep(this._staticRoutes);
  this.hapiRoutes = _.cloneDeep(this._hapiRoutes);

  _.each(this.routes, function (route) {
    route.selectedHandler = route.selectedHandler || _.keys(route.handlers)[0];
    _.each(route.handlers, function (handler) {
      if (handler.optionsType === "selectOne") {
        handler.selectedOption = handler.selectedOption || _.keys(handler.options)[0];
      }
      if (handler.optionsType === "selectMany") {
        handler.selectedOptions = [];
      }
    });
  });

  this.delay = 0;
  this.state = _.cloneDeep(this._state);

  if (_.isFunction(cb)) { cb(); }
};


module.exports = Surrogate;
