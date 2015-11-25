import template from "babel-template";
import * as t from "babel-types";


const jsonRouteTmpl = template(`
  mock.jsonRoute({
    name: NAME,
    method: METHOD,
    path: PATH,
    hostname: HOSTNAME,
    handlers: HANDLERS
  });
`);

const htmlRouteTmpl = template(`
  mock.htmlRoute({
    name: NAME,
    method: METHOD,
    path: PATH,
    hostname: HOSTNAME,
    handlers: HANDLERS
  });
`);

export default function renderRoute (opts) {
  const { name, method, path, hostname, handlers, contentType } = opts;

  const routeTmpl = contentType.indexOf("application/json") > -1 ?
    jsonRouteTmpl :
    htmlRouteTmpl;

  return routeTmpl({
    NAME: t.stringLiteral(name),
    METHOD: t.stringLiteral(method.toUpperCase()),
    PATH: t.stringLiteral(path),
    HOSTNAME: t.stringLiteral(hostname),
    HANDLERS: handlers
  });
}
