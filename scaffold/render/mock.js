import template from "babel-template";
import * as t from "babel-types";


const tmpl = template(`
  var fs = require("fs");
  var path = require("path");

  var Drydock = require("drydock");

  var createMock = function (options) {
    options = options ? options : {};

    var mock = new Drydock({
      port: options.port || PORT,
      ip: options.ip || IP,
      verbose: !!options.verbose,
      initialState: {},
      cors: true
    });

    ROUTES;

    return mock;
  };

  if (require.main === module) {
    createMock(require("yargs").argv).start();
  } else {
    module.exports = createMock;
  }
`);

export default function renderMock (ip, port, routesNodes) {
  return tmpl({
    IP: t.stringLiteral(ip),
    PORT: t.numericLiteral(port),
    ROUTES: routesNodes
  });
}

