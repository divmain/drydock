const path = require("path");

const _ = require("lodash");
const Promise = require("bluebird");

const jsonDiff = require("./json-diff");
const Errors = require("./errors");


function getSelectedHandler (drydock, routeName) {
  var route = _.find(drydock.routes, { name: routeName });
  return route.handlers[route.selectedHandler];
}

function filterRequest (request) {
  return _.chain(request)
    .pick("payload", "params", "query")
    .cloneDeep()
    .value();
}

function getHandlerContext (drydock, request) {
  return {
    state: drydock.state,
    cookies: _.cloneDeep(request.state) || {},
    headers: {},
    cookieDomain: null
  };
}

function updateCookieState (reply, originalCookies, modifiedCookies, settings) {
  const cookiesDiff = jsonDiff(originalCookies, modifiedCookies);
  // jsonDiff does deep-diff; we just want shallow modifiedCookies[key]
  _.each(cookiesDiff.add, (val, key) => reply.state(key, modifiedCookies[key], settings));
  _.each(cookiesDiff.del, (val, key) => reply.state(key, "", settings));
}

function getHandlerArgs (request, handler) {
  const handlerArgs = [ filterRequest(request) ];
 
  if (handler.optionsType === "selectOne") {
    handlerArgs.push(handler.options[handler.selectedOption]);
  } else if (handler.optionsType === "selectMany") {
    handlerArgs.push(_.map(handler.selectedOptions, optionName => handler.options[optionName]));
  }

  return handlerArgs;
}

function defineDynamicRoutes (drydock) {
  const routesCache = {};

  drydock._routes.forEach(routeCfg => {
    drydock.server.route({
      method: routeCfg.method,
      path: routeCfg.path,
      vhost: routeCfg.hostname,
      handler: (request, reply) => {
        const drydockHandler = getSelectedHandler(drydock, routeCfg.name);
        const handlerCxt = getHandlerContext(drydock, request);
        const handlerArgs = getHandlerArgs(request, drydockHandler);

        Promise.resolve()
          .then(() => drydockHandler.handler.apply(handlerCxt, handlerArgs))
          .then(response => ({
            payload: response,
            type: routeCfg.type,
            code: routeCfg.defaultCode || 200
          }))
          .catch(Errors.HttpError, err => ({
            payload: err.payload,
            type: err.type,
            code: err.code
          }))
          .then(responseOptions => setTimeout(() => {
            const r = reply(responseOptions.payload)
              .type(responseOptions.type)
              .code(responseOptions.code);

              updateCookieState(r, request.state, handlerCxt.cookies, {
                encoding: drydock.cookieEncoding,
                domain: handlerCxt.cookieDomain
              });

              _.each(handlerCxt.headers, (val, key) => r.header(key, val));

          }, drydock.delay || 0))
      }
    });
  });
}

function defineHapiRoutes (drydock) {
  drydock._hapiRoutes.forEach(drydock.server.route.bind(drydock.server));
}

function defineStaticRoutes (drydock) {
  drydock._staticRoutes.forEach(routeCfg => {
    if (routeCfg.type === "directory") {
      drydock.server.route({
        method: "GET",
        path: path.join(routeCfg.urlPath, "{param*}"),
        handler: {
          directory: {
            path: routeCfg.filePath
          }
        }
      });
    } else if (staticRoute.type === "file") {
      drydock.server.route({
        method: "GET",
        path: routeCfg.urlPath,
        handler: (request, reply) => reply.file(routeCfg.filePath)
      });
    }
  });
}

module.exports = function (drydock) {
  defineDynamicRoutes(drydock);
  defineHapiRoutes(drydock);
  defineStaticRoutes(drydock);
};
