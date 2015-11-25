import fs from "fs";
import path from "path";

import generate from "babel-generator";
import * as t from "babel-types";

import renderHandler from "./render/handler";
import renderHandlers from "./render/handlers";
import renderRoute from "./render/route";
import renderMock from "./render/mock";


function renderCode (ast) {
  const { code } = generate(ast, {
    format: {
      indent: {
        style: "  ",
        adjustMultilineComment: true
      }
    },
    sourceMap: false
  });

  return code;
}

function getRoutes (transactions) {
  const routes = {};

  for (const transaction of transactions) {
    if (transaction === null) {
      continue;
    }
    const {
      method,
      hostname,
      pathname,
      href,
      statusCode,
      responseBody,
      responseHeaders,
      hadError
    } = transaction;

    const key = `${hostname}${pathname} ${method}`;
    if (!(key in routes)) {
      routes[key] = {
        method,
        hostname,
        pathname,
        isJson: responseHeaders["content-type"] && 
          (responseHeaders["content-type"].indexOf("application/json") > -1),
        responses: []
      };
    }

    const preexistingResponses = routes[key].responses.length;
    routes[key].responses.push({
      statusCode,
      responseBody,
      responseHeaders,
      name: `${key}-${preexistingResponses}`
    });
  }

  return routes;
}

function createFixturesDir (destination) {
  try {
    fs.mkdirSync(path.join(destination, "fixtures"));
  } catch (err) {
    if (err.message.indexOf("EEXIST") === -1) {
      throw err;
    }
  }

}

function writeFixture (route, response, destination) {
  const extension = route.isJson ?
    ".json" :
    ".html";
  const escapedName = encodeURIComponent(response.name);
  const pathToFixture = `./fixtures/${escapedName}${extension}`;

  const body = route.isJson ?
    JSON.stringify(JSON.parse(response.responseBody), null, 2) :
    response.responseBody;

  fs.writeFileSync(path.join(destination, pathToFixture), body);
  return pathToFixture;
}

export default function writeMocks (ip, port, destination, transactions) {
  const routes = getRoutes(transactions);

  createFixturesDir(destination);

  const routesNodes = Object.keys(routes).map(routeKey => {
    const route = routes[routeKey];

    const handlersNode = renderHandlers(route.responses.map(response => {
      const pathToFixture = writeFixture(route, response, destination);
      const name = response.name;
      return {
        ast: renderHandler(pathToFixture, route.isJson, response.statusCode),
        name
      };
    }));

    return renderRoute({
      name: routeKey,
      method: route.method,
      path: route.pathname,
      hostname: route.hostname,
      handlers: handlersNode,
      contentType: route.responses[0].responseHeaders["content-type"] || "text/text"
    });
  })

  const mockAst = renderMock(ip, port, routesNodes);
  const mockJs = renderCode(t.program([].concat(mockAst)));

  fs.writeFileSync(path.join(destination, "mock.js"), mockJs);
}
