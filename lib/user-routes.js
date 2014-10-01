var
  jsonDiff = require("./json-diff"),
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

function updateCookieState (replyObj, originalCookies, modifiedCookies) {
  var
    cookiesDiff = jsonDiff(originalCookies, modifiedCookies);
  _.each(cookiesDiff.add, function (val, key) {
    // jsonDiff does deep-diff; we just want shallow modifiedCookies[key]
    replyObj.state(key, modifiedCookies[key]);
  });
  _.each(cookiesDiff.del, function (val, key) {
    replyObj.state(key, "");
  });
}

function getHandlerArgs (request, routeCfg, handler) {
  var handlerArgs, selectedOptions;

  handlerArgs = [ getSurrogateRequest(request) ];

  if (routeCfg.optionsType === "selectOne") {
    handlerArgs = handlerArgs.concat(
      handler.options[handler.selectedOption]
    );
  } else if (routeCfg.optionsType === "selectMany") {
    selectedOptions = _.map(handler.selectedOptions, function (optionName) {
      return routeCfg.options[optionName];
    });
    handlerArgs = Array.prototype.concat.apply(handlerArgs, selectedOptions);
  }

  return handlerArgs;
}

module.exports = function () {
  var self = this;

  // use `this._routes` because `this.routes` will not be available when
  // defining user routes
  _.each(this._routes, function (routeCfg) {
    this.server.route({
      method: routeCfg.method,
      path: routeCfg.path,
      handler: function (request, reply) {
        var
          surrogateHandler = getSelectedHandler.apply(this, routeCfg.name),
          handlerContext = getHandlerContext.apply(this, request),
          handlerArgs = getHandlerArgs.apply(this, request, routeCfg, surrogateHandler);

        Promise.resolve(surrogateHandler.handler.apply(handlerContext, handlerArgs))
          .then(function (response) {
            if (!_.isNull(self.delay)) {
              setTimeout(function () {
                var replyObj = reply(response)
                  .type(routeCfg.type)
                  .code(200);
                updateCookieState(replyObj, request.state || {}, handlerContext.cookies);
              }, self.delay);
            }
          });
      }
    });
  });

};
