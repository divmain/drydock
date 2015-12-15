import path from "path";

import _ from "lodash";

import * as Errors from "./errors";
import schemas from "./schemas";


const ROOT = "/drydock";
const API = `${ROOT}/api`;
const frontendDir = path.join(__dirname, "../ui");


export default function (drydock) {
  drydock.server.route({
    method: "GET",
    path: `${ROOT}/{param*}`,
    handler: {
      directory: {
        path: frontendDir
      }
    }
  });

  drydock.server.route({
    method: "GET",
    path: `${API}/routes`,
    handler: (request, reply) => reply(_.chain(drydock.routes)
      .cloneDeep()
      .map(route => Object.assign({}, route, {
        handlers: Object.keys(route.handlers).map(name => {
          const handler = route.handlers[name];
          return Object.assign({}, handler, {
            options: Object.keys(handler.options),
            name
          });
        })
      }))
      .value()
    ).type("application/json")
  });

  drydock.server.route({
    method: "PUT",
    path: `${API}/route`,
    handler (request, reply) {
      try {
        drydock
          .route(request.payload.name)
          .setHandler(request.payload.selectedHandler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: `${API}/route/selected-option`,
    handler (request, reply) {
      const payload = request.payload;

      try {
        drydock.route(payload.name).setOption(payload.selectedOption, payload.handler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: `${API}/route/selected-options`,
    handler (request, reply) {
      const payload = request.payload;

      try {
        drydock.route(payload.name).setOptions(payload.selectedOptions, payload.handler);
        reply({ message: "OK" }).type("application/json");
      } catch (err) {
        if (!(err instanceof Errors.ApiError)) {
          throw err;
        }
        reply({ apiError: true, message: err.toString() })
          .type("application/json")
          .code(500);
      }
    }
  });

  drydock.server.route({
    method: "PUT",
    path: `${API}/delay`,
    handler (request, reply) {
      schemas.validateApiUpdate(request.payload, schemas.delay);
      drydock.delay = request.payload.delay;
      reply({ message: "OK" }).type("application/json");
    }
  });

  drydock.server.route({
    method: "POST",
    path: `${API}/reset`,
    handler (request, reply) {
      drydock.reset(true, () => reply({ message: "OK" }).type("application/json"));
    }
  });
}
