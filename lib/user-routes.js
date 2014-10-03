var
  jsonDiff = require("./json-diff"),
  path = require("path"),
  Errors = require("./errors"),
  Promise = require("bluebird"),
  _ = require("lodash");

function getSelectedHandler (routeName) {
  var route = _.find(this.routes, { name: routeName });
  return route.handlers[route.selectedHandler];
}

function getSurrogateRequest (request) {
  return _.chain(request)
    .pick("payload", "params", "query")
    .cloneDeep()
    .value();
}

function getHandlerContext (request) {
  return {
    state: this.state,
    cookies: _.cloneDeep(request.state) || {}
  };
}

function updateCookieState (replyObj, originalCookies, modifiedCookies, cookieEncoding) {
  var
    cookiesDiff = jsonDiff(originalCookies, modifiedCookies);
  _.each(cookiesDiff.add, function (val, key) {
    // jsonDiff does deep-diff; we just want shallow modifiedCookies[key]
    replyObj.state(key, modifiedCookies[key], { encoding: cookieEncoding });
  });
  _.each(cookiesDiff.del, function (val, key) {
    replyObj.state(key, "", { encoding: cookieEncoding });
  });
}

function getHandlerArgs (request, handler) {
  var handlerArgs, selectedOptions;

  handlerArgs = [ getSurrogateRequest(request) ];

  if (handler.optionsType === "selectOne") {
    handlerArgs = handlerArgs.concat(
      handler.options[handler.selectedOption]
    );
  } else if (handler.optionsType === "selectMany") {
    selectedOptions = _.map(handler.selectedOptions, function (optionName) {
      return handler.options[optionName];
    });
    handlerArgs.push(selectedOptions);
  }

  return handlerArgs;
}

function defineDynamicRoutes () {
  var self = this;

  // use `this._routes` because `this.routes` will not be available when
  // defining user routes
  _.each(this._routes, function (routeCfg) {
    this.server.route({
      method: routeCfg.method,
      path: routeCfg.path,
      handler: _.bind(function (request, reply) {
        var
          surrogateHandler = getSelectedHandler.call(this, routeCfg.name),
          handlerContext = getHandlerContext.call(this, request),
          handlerArgs = getHandlerArgs.call(this, request, surrogateHandler);

        Promise.resolve().then(function () {
          return surrogateHandler.handler.apply(handlerContext, handlerArgs);
        })
          .then(function (response) {
            return {
              payload: response,
              type: routeCfg.type,
              code: 200,
              originalCookies: request.state,
              cookies: handlerContext.cookies
            };
          })
          .catch(function (err) {
            if (!(err instanceof Errors.HttpError)) {
              throw err
            }
            return {
              payload: err.payload,
              type: err.type,
              code: err.code,
              originalCookies: request.state,
              cookies: handlerContext.cookies
            };
          })
          .then(function (responseOptions) {
            if (!_.isNull(self.delay)) {
              setTimeout(function () {
                var r = reply(responseOptions.payload)
                  .type(responseOptions.type)
                  .code(responseOptions.code);
                updateCookieState(r, request.state, handlerContext.cookies, self.cookieEncoding);
              }, self.delay);
            }
          });
      }, this)
    });
  }, this);

}

function defineHapiRoutes () {
  _.each(this._hapiRoutes, function (routeCfg) {
    this.server.route(routeCfg);
  }, this);
}

function defineStaticRoutes () {
  _.each(this._staticRoutes, function (staticRoute) {
    if (staticRoute.type === "directory") {
      this.server.route({
        method: "GET",
        path: path.join(staticRoute.urlPath, "{param*}"),
        handler: {
          directory: {
            path: staticRoute.filePath
          }
        }
      });
    } else if (staticRoute.type === "file") {
      this.server.route({
        method: "GET",
        path: staticRoute.urlPath,
        handler: function (request, reply) {
          reply.file(staticRoute.filePath);
        }
      });
    }
  }, this);
}

module.exports = function () {
  defineDynamicRoutes.call(this);
  defineHapiRoutes.call(this);
  defineStaticRoutes.call(this);
};
