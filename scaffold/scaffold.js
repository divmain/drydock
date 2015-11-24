import fs from "fs";
import path from "path";
import zlib from "zlib";

import Hapi from "hapi";
import minimist from "minimist";
import request from "request";
import Promise from "bluebird";

import text from "../lib/text";

const gunzip = Promise.promisify(zlib.gunzip, { context: zlib });
const requestP = Promise.promisify(request);


let lastTransaction = 0;
const transactions = [];

function printRow (a, b, c) {
  console.log("" + text(a).rightJustify(5) + text(b).rightJustify(7) + " " + c);
}

function main (options) {
  const {
    ip = "0.0.0.0",
    port = 1337
  } = options;

  function onRequest({ method, href, transactionNo }) {
    printRow(transactionNo, text(method.toUpperCase()).yellow(), href);
  }

  function onResponse({ statusCode, method, href, transactionNo, body, headers }) {
    const color = statusCode >= 200 && statusCode < 300 ? "green" : "red";
    printRow(transactionNo, text(method.toUpperCase())[color](), href);

    return decompress(body, headers).then(decompressed => {
      fs.writeFileSync(path.join(__dirname, transactionNo.toString()), decompressed);
    });
  }

  const [ start, stop ] = setupServer({ ip, port}, onRequest, onResponse);
  start();
}

function decompress (body, headers) {
  const encoding = headers["content-encoding"];
  return encoding && encoding.indexOf("gzip") === -1 ?
    Promise.resolve(body) :
    Promise.resolve()
      .then(() => gunzip(body))
      .catch(() => body);
}

function setupServer ({ ip, port }, onRequest, onResponse) {
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

          return onResponse({ statusCode, method, href, transactionNo, body, headers: response.headers });
        })
        .catch(err => {
          printRow(transactionNo, text("ERROR").cyan(), err);
          reply("").code(500);
          return;
        });
    }
  });

  return [
    cb => server.start(cb),
    cb => server.stop(cb)
  ];
  // return [
  //   Promise.promisify(server.start, { context: server }),
  //   Promise.promisify(server.stop, { context: server })
  // ];
}

main(minimist(process.argv.slice(2)));
