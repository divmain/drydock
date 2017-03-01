import path from "path";

import _ from "lodash";
import Promise from "bluebird";
import request from "request";

import jsonDiff from "../util/json-diff";
import * as Errors from "../errors";


function getSelectedHandler (drydock, routeName) {
  const route = _.find(drydock.routes, { name: routeName });
  return route.handlers[route.selectedHandler];
}

function filterRequest (req) {
  return _.chain(req)
    .pick("payload", "params", "query")
    .cloneDeep()
    .value();
}

function getHandlerContext (drydock, req) {
  return {
    state: drydock.state,
    cookies: _.cloneDeep(req.state) || {},
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

function getHandlerArgs (req, handler) {
  const handlerArgs = [ filterRequest(req) ];

  if (handler.optionsType === "selectOne") {
    handlerArgs.push(handler.options[handler.selectedOption]);
  } else if (handler.optionsType === "selectMany") {
    handlerArgs.push(_.map(handler.selectedOptions, optionName => handler.options[optionName]));
  }

  return handlerArgs;
}

function defineDynamicRoutes (drydock) {
  drydock._initial.routes.forEach(routeCfg => {
    drydock.server.route({
      method: routeCfg.method,
      path: routeCfg.path,
      vhost: routeCfg.hostname,
      handler: (req, reply) => {
        const drydockHandler = getSelectedHandler(drydock, routeCfg.name);
        const handlerCxt = getHandlerContext(drydock, req);
        const handlerArgs = getHandlerArgs(req, drydockHandler);
        Promise.resolve()
          .then(() => drydockHandler.handler.apply(handlerCxt, handlerArgs))
          .then(response => ({
            payload: response,
            type: routeCfg.type,
            code: routeCfg.headers && routeCfg.headers.code ? routeCfg.headers.code : 200
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

            updateCookieState(r, req.state, handlerCxt.cookies, {
              encoding: drydock.cookieEncoding,
              domain: handlerCxt.cookieDomain
            });

            _.each(handlerCxt.headers, (val, key) => r.header(key, val));

          }, drydock.delay || 0));
      }
    });
  });
}

function defineHapiRoutes (drydock) {
  drydock._initial.hapiRoutes.forEach(drydock.server.route.bind(drydock.server));
}

function defineStaticRoutes (drydock) {
  drydock._initial.staticRoutes.forEach(routeCfg => {
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
    } else if (routeCfg.type === "file") {
      drydock.server.route({
        method: "GET",
        path: routeCfg.urlPath,
        handler: (req, reply) => reply.file(routeCfg.filePath)
      });
    }
  });
}

function defineProxyRoutes (drydock) {
  drydock._initial.proxyRoutes.forEach(proxyRoute => {
    drydock.server.route({
      method: proxyRoute.method,
      path: proxyRoute.path,
      handler: (req, reply) => {
        const { method, headers, payload } = req;

        delete headers.host;

        const url = _.isFunction(proxyRoute.forwardTo) ?
          proxyRoute.forwardTo(req) :
          proxyRoute.forwardTo;

        request({
          url,
          method,
          headers,
          body: payload,
          encoding: null
        }, (err, { statusCode, body, headers: responseHeaders }) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log(`Unable to proxy HTTP request: ${err.stack}`);
            reply("Unknown failure.").code(500);
            return;
          }

          let r = reply(body).code(statusCode);
          Object.keys(responseHeaders).forEach(header => {
            r = r.header(header, responseHeaders[header]);
          });
        });

      }
    });

  });
}

export default function (drydock) {
  defineDynamicRoutes(drydock);
  defineHapiRoutes(drydock);
  defineStaticRoutes(drydock);
  defineProxyRoutes(drydock);
}
