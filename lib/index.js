var Surrogate,
  invalidRoute = /^\/surrogate\//,
  _ = require("lodash"),
  text = require("./text"),
  schemas = require("./schemas"),
  jsApi = require("./js-api"),
  defineSurrogateRoutes = require("./surrogate-routes"),
  defineUserRoutes = require("./user-routes"),
  log = require("./log"),
  Errors = require("./errors"),
  Hapi = require("hapi"),
  drydockPackage = require("../package.json")

/**
 * Surrogate
 */

Surrogate = function (options) {
  options = options || {};
  this.port = options.port || 1337;
  this.ip = options.ip || "0.0.0.0";
  this.verbose = options.verbose || false;
  this.cors = !!options.cors;
  this.cookieEncoding = options.cookieEncoding || "none";
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
  schemas.validateConfig(schemas.staticRoute, staticCfg);
  this._staticRoutes.push(_.extend(staticCfg, { type: "directory" }));
};

Surrogate.prototype.staticFile = function (staticCfg) {
  schemas.validateConfig(schemas.staticRoute, staticCfg);
  this._staticRoutes.push(_.extend(staticCfg, { type: "file" }));
};

Surrogate.prototype.start = function (cb) {
  var self = this;
  log("starting drydock " + drydockPackage.version + " server on " + this.ip + ":" + this.port + "...");

  this.server = new Hapi.Server(this.ip, this.port, {
    router: { stripTrailingSlash: true },
    cors: this.cors,
    state: { cookies: { failAction: "ignore" } }
  });

  defineSurrogateRoutes.apply(this);
  defineUserRoutes(this);

  if (this.verbose) {
    this.server.on("response", function (request) {
      var action = text("RTE").green().pad(1);
      if (request.route.path.indexOf("/surrogate") === 0) { action = text("SUR").bright().pad(1); }
      log(text(request.method.toUpperCase()).rightJustify(5) + action + request.path);
    });
  }

  this.reset(false, function () {
    self.server.start(cb);
  });
};

Surrogate.prototype.stop = function (cb) {
  log("stopping server...");
  this.server.stop(cb);
};

Surrogate.prototype.reset = function (logReset, cb) {
  if (logReset) { log("resetting to initial state..."); }
  this.routes = _.cloneDeep(this._routes);
  this.staticRoutes = _.cloneDeep(this._staticRoutes);
  this.hapiRoutes = _.cloneDeep(this._hapiRoutes);
  this.state = _.cloneDeep(this._state);

  _.each(this.routes, function (route) {
    route.selectedHandler = route.selectedHandler || _.keys(route.handlers)[0];
    _.each(route.handlers, function (handler) {
      if (handler.optionsType === "selectOne") {
        handler.selectedOption = handler.selectedOption || _.keys(handler.options)[0];
      }
      if (handler.optionsType === "selectMany") {
        handler.selectedOptions = handler.selectedOptions || [];
      }
    });
  });

  this.delay = 0;
  this.state = _.cloneDeep(this._state);

  if (_.isFunction(cb)) { cb(); }
};

Surrogate.Errors = Errors;

_.extend(Surrogate.prototype, jsApi);

module.exports = Surrogate;
