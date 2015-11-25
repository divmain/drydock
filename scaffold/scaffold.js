import fs from "fs";
import path from "path";

import minimist from "minimist";
import Promise from "bluebird";

import setupServer from "./setup-server";
import writeMocks from "./write-mocks";
import text from "../lib/text";
import { printRow } from "./util";


function trapFirstCtrlC () {
  let firstCtrlC = true;
  return new Promise(resolve => {
    process.on("SIGINT", () => {
      if (!firstCtrlC) {
        console.log("\nexiting early...\n");
        process.exit();
      }
      firstCtrlC = false;
      resolve();
    });
  });
}

function main (options) {
  const {
    ip = "0.0.0.0",
    port = 1337,
    destination = process.cwd()
  } = options;

  const transactions = [];

  function onRequest({ method, hostname, pathname, href, transactionNo }) {
    printRow(transactionNo, text(method.toUpperCase()).yellow(), href);
    transactions[transactionNo] = { method, hostname, pathname, href };
  }

  function onResponse({ statusCode, method, href, transactionNo, body, headers }) {
    const color = statusCode >= 200 && statusCode < 300 ? "green" : "red";
    printRow(transactionNo, text(method.toUpperCase())[color](), href);

    Object.assign(transactions[transactionNo], {
      statusCode,
      responseBody: body,
      responseHeaders: headers
    });
  }

  function onError(transactionNo) {
    transactions[transactionNo] = null;
  }

  const [ start, stop ] = setupServer({ ip, port}, onRequest, onResponse, onError);

  Promise.resolve()
    .then(() => {
      console.log(`starting proxy server on http://${ip}:${port}...`);
      return start();
    })
    .then(trapFirstCtrlC)
    .then(() => {
      console.log("\nstopping server...");
      return stop();
    })
    .then(() => console.log("server stopped, press CTRL-C immediately to avoid writing to disk..."))
    .delay(1000)
    .then(() => {
      console.log("writing mocks to disk...")
      return writeMocks(ip, port, destination, transactions);
    })
    // TODO: offer to `npm install yargs lodash`
    .then(() => {
      console.log("finished!");
    });
}

main(minimist(process.argv.slice(2)));
