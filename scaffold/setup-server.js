import zlib from "zlib";

import Hapi from "hapi";
import request from "request";
import Promise from "bluebird";

import text from "../lib/text";

const requestP = Promise.promisify(request);
const gunzip = Promise.promisify(zlib.gunzip, { context: zlib });


let lastTransaction = 0;

function decompress (body, headers) {
  const encoding = headers["content-encoding"];
  return encoding && encoding.indexOf("gzip") === -1 ?
    Promise.resolve(body) :
    Promise.resolve()
      .then(() => gunzip(body))
      .catch(() => body);
}

export default function setupServer ({ ip, port }, onRequest, onResponse) {
  const server = new Hapi.Server(ip, port, {
    cors: true
  });

  server.route({
    method: "*",
    path: "/{path*}",
    handler: function (req, reply) {
      const transactionNo = lastTransaction++;
      const { method, headers, payload, url: {
        protocol,
        hostname,
        pathname,
        href
      } } = req;

      onRequest({ method, protocol, hostname, pathname, href, headers, payload, transactionNo });

      requestP({
        url: href,
        method,
        headers,
        body: payload,
        encoding: null
      })
        .then(([response, body]) => {
          const { type: responseType, statusCode, headers: responseHeaders } = response;

          let r = reply(body)
            .code(statusCode);
          Object.keys(response.headers).forEach(header => {
            r = r.header(header, response.headers[header]);
          });

          return decompress(body, headers).then(decompressedBody => {
            return onResponse({
              statusCode,
              method,
              href,
              transactionNo,
              body: decompressedBody,
              headers: response.headers
            });
          });
        })
        .catch(err => {
          printRow(transactionNo, text("ERROR").cyan(), err);
          reply("").code(500);
          return;
        });
    }
  });

  return [
    Promise.promisify(server.start.bind(server)),
    Promise.promisify(server.stop.bind(server))
  ];
}
