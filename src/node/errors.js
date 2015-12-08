var _ = require("lodash");


/**
 * Error helper functions
 */

function inherit (Child, Parent) {
  var hasOwn, Intermediate, prop;
  hasOwn = Object.prototype.hasOwnProperty;

  Intermediate = function () {
    this.constructor = Child;
    this.constructor$ = Parent;
    for (prop in Parent.prototype) {
      if (hasOwn.call(Parent.prototype, prop) && prop.slice(-1) !== "$") {
        this[prop + "$"] = Parent.prototype[prop];
      }
    }
  };

  Intermediate.prototype = Parent.prototype;
  Child.prototype = new Intermediate();
  return Child.prototype;
}

function errorFactory (Parent, name) {
  var ErrorType = function (message) {
    this.name = name;
    this.message = message;
    this.cause = message;

    if (message instanceof Parent) {
      this.message = message.message;
      this.stack = message.stack;
    } else if (Parent.captureStackTrace) {
      Parent.captureStackTrace(this, this.constructor);
    }
  };
  inherit(ErrorType, Parent);
  return ErrorType;
}


/**
 * Base error prototype
 */

var BaseError = errorFactory(Error, "BaseError");


/**
 * Error prototypes with custom behavior
 */

var HttpError = function (code, payload) {
  this.name = "HttpError";
  this.code = code;
  this.payload = payload;
  this.type = _.isString(payload) ? "text/html" : "application/json";

  this.message = code;
  this.cause = code;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
};
inherit(HttpError, BaseError);


/**
 * Exported error definitions
 */

module.exports = {
  BaseError: BaseError,
  HttpError: HttpError,
  ConfigurationError: errorFactory(BaseError, "ConfigurationError"),
  ParsingErr: errorFactory(BaseError, "ParsingErr"),
  ApiError: errorFactory(BaseError, "ApiError")
};
