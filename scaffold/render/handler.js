import template from "babel-template";
import * as t from "babel-types";


const requireJsonTmpl = template(
  `require(PATH_TO_FILE)`);
const requireHtmlTmpl = template(
  `fs.readFileSync(path.join(__dirname, PATH_TO_FILE), "utf8")`)

const successTmpl = template(`({
  description: NAME,
  handler: function (request) {
    return FIXTURE_EXPRESSION;
  }
})`);

const errorTmpl = template(`({
  description: NAME,
  handler: function (request) {
    throw new HttpErr({
      payload: FIXTURE_EXPRESSION,
      type: RESPONSE_TYPE,
      code: STATUS_CODE
    });
  }
})`);

export default function renderHandler (pathToFixture, isJson, statusCode) {
  const PATH_TO_FILE = t.stringLiteral(pathToFixture);
  const FIXTURE_EXPRESSION = isJson ?
    requireJsonTmpl({ PATH_TO_FILE }) :
    requireHtmlTmpl({ PATH_TO_FILE });

  return (statusCode === 200 ?
    successTmpl({ FIXTURE_EXPRESSION }) :
    errorTmpl({
      FIXTURE_EXPRESSION,
      RESPONSE_TYPE: t.stringLiteral(isJson ? "application/json" : "text/html"),
      STATUS_CODE: t.numericLiteral(statusCode)
    })).expression;
}
