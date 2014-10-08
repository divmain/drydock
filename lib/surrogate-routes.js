var frontendDir,
  fs = require("fs"),
  _ = require("lodash"),
  path = require("path"),
  Errors = require("./errors"),
  schemas = require("./schemas"),
  ROOT = "/surrogate/",
  API = ROOT + "api/";

frontendDir = fs.existsSync(path.join(__dirname, "../frontend-release")) ?
  path.join(__dirname, "../frontend-release") :
  path.join(__dirname, "../frontend-dist");

module.exports = function () {
  var self = this;

  this.server.route({
    method: "GET",
    path: ROOT + "{param*}",
    handler: {
      directory: {
        path: frontendDir
      }
    }
  });

  this.server.route({
    method: "GET",
    path: API + "routes",
    handler: function (request, reply) {
      var routes = _.chain(self.routes)
        .cloneDeep()
        .map(function (route) {
          var handlers = _.map(route.handlers, function (handler, name) {
            return _.extend({}, handler, {
              options: _.keys(handler.options),
              name: name
            });
          });

          return {
            name: route.name,
            method: route.method,
            path: route.path,
            selectedHandler: route.selectedHandler,
            handlers: handlers
          };
        })
        .value();

      reply(routes)
        .type("application/json");
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "route",
    handler: function (request, reply) {
      var payload = request.payload;

      try {
        self.route(payload.name).setHandler(payload.selectedHandler);
        reply("OK");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "route/selected-option",
    handler: function (request, reply) {
      var payload = request.payload;

      try {
        self.route(payload.name).setOption(payload.handler, payload.selectedOption);
        reply("OK");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "route/selected-options",
    handler: function (request, reply) {
      var payload = request.payload;

      try {
        self.route(payload.name).setOptions(payload.handler, payload.selectedOptions);
        reply("OK");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "delay",
    handler: function (request, reply) {
      schemas.validateApiUpdate(request.payload, schemas.delay);
      this.delay = request.payload.delay;
      reply("OK");
    }
  });

  this.server.route({
    method: "POST",
    path: API + "reset",
    handler: function (request, reply) {
      self.reset(true, function () {
        reply("OK");
      });
    }
  });
};
