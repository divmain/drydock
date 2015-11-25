import * as t from "babel-types";

export default function renderHandlers (handlers) {
  return t.objectExpression(handlers.map(({ name, ast }) =>
    t.objectProperty(t.stringLiteral(name), ast)));
}
