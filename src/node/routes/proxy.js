import path from "path";

import _ from "lodash";
import request from "request";

import * as Errors from "../errors";
import { validateApiUpdate, delay as delaySchema } from "../schemas";

const ROOT = "/drydock";
const API = `${ROOT}/api`;
const frontendDir = path.join(__dirname, "../../ui");


export default function (drydock) {
  drydock.server.route({
    method: "*",
    path: "/{path*}",
    handler: function (req, reply) {
      const { method, headers, payload, url: {
        protocol,
        hostname,
        pathname,
        href
      } } = req;

      request({
        url: href,
        method,
        headers,
        body: payload,
        encoding: null
      }, (err, { statusCode, body, headers: responseHeaders }) => {
        if (err) {
          console.log(`Unable to fulfill HTTP request: ${err.stack}`);
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
}
