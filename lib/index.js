var Surrogate, routeSchema, handlerSchema, validate,
  _ = require("lodash"),
  schemas = require("./schemas"),
  defineSurrogateRoutes = require("./define-surrogate-routes"),
  Errors = require("./errors"),
  Joi = require("joi");

/**
 * Surrogate
 */

Surrogate = function (options) {
  options = options || {};
  this.port = options.port || 1337;
  this.ip = options.ip || "0.0.0.0";
  this.verbose = options.verbose || false;
  this.initialState = options.initialState || {};
  this.routes = [];
  this.hapiRoutes = [];
  this.delay = 0;
  this._server = null;
};

Surrogate.prototype._assertNewRoute = function (routeCfg) {
  _.each(this.routes, function (route) {
    if (route.name === routeCfg.name) {
      throw new Errors.ConfigurationError(
        "Route with name '" + routeCfg.name + "' is already defined."
      );
    }
  });
};

Surrogate.prototype.jsonRoute = function (routeCfg) {
  schemas.validate(routeCfg, schemas.route)
  this._assertNewRoute(routeCfg);
  _.each(routeCfg.handlers, function (handler) {
    schemas.validate(handler, schemas.handler);
  });
  this.routes.push(_.extend({}, routeCfg, { type: "application/json" }));
};

Surrogate.prototype.htmlRoute = function (routeCfg) {
  schemas.validate(routeCfg, schemas.route);
  this._assertNewRoute(routeCfg);
  _.each(routeCfg.handlers, function (handler) {
    schemas.validate(handler, schemas.handler);
  });
  this.routes.push(_.extend({}, routeCfg, { type: "text/html" }));
};

Surrogate.prototype.hapiRoute = function (routeCfg) {
  this.hapiRoutes.push(routeCfg);
};

Surrogate.prototype.start = function (cb) {
  this.server = new Hapi.Server(this.ip, this.port, {
    router: { stripTrailingSlash: true }
  });
  defineSurrogateRoutes.apply(this);
  this.server.start(cb);
};

Surrogate.prototype.stop = function (cb) {

};

Surrogate.prototype.restart = function (cb) {

};


module.exports = Surrogate;
