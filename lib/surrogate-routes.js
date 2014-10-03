var frontendDir,
  fs = require("fs"),
  _ = require("lodash"),
  path = require("path"),
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
    path: API + "route/handler",
    handler: function (request, reply) {
      var
        payload = request.payload,
        route = _.find(self.routes, { method: payload.method, path: payload.path });

      schemas.validateSetHandler(payload, route);
      route.selectedHandler = payload.selectedHandler;
      reply("OK");
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "route/selected-option",
    handler: function (request, reply) {
      var
        payload = request.payload,
        route = _.find(self.routes, { method: payload.method, path: payload.path });

      schemas.validateSetOption(payload, route);

      route.handlers[payload.handler].selectedOption = payload.selectedOption;
      reply("OK");
    }
  });

  this.server.route({
    method: "PUT",
    path: API + "route/selected-options",
    handler: function (request, reply) {
      var
        payload = request.payload,
        route = _.find(self.routes, { method: payload.method, path: payload.path });

      schemas.validateSetOptions(payload, route);

      route.handlers[payload.handler].selectedOptions = payload.selectedOptions;
      reply("OK");
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
