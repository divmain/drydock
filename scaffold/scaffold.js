import fs from "fs";
import path from "path";

import minimist from "minimist";
import Promise from "bluebird";

import setupServer from "./setup-server";
import text from "../lib/text";


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
    fs.writeFileSync(path.join(__dirname, transactionNo.toString()), body);
  }

  const [ start, stop ] = setupServer({ ip, port}, onRequest, onResponse);
  start()
    .then(() => console.log("it is started!"))
    .delay(10000)
    .then(stop)
    .then(() => console.log("it is finished!"));
}

main(minimist(process.argv.slice(2)));
