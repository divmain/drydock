import { isString } from "lodash";

/**
 * Error helper functions
 */

function inherit (Child, Parent) {
  const hasOwn = Object.prototype.hasOwnProperty;

  const Intermediate = function () {
    this.constructor = Child;
    this.constructor$ = Parent;
    for (const prop in Parent.prototype) {
      if (hasOwn.call(Parent.prototype, prop) && prop.slice(-1) !== "$") {
        this[`${prop}$`] = Parent.prototype[prop];
      }
    }
  };

  Intermediate.prototype = Parent.prototype;
  Child.prototype = new Intermediate();
  return Child.prototype;
}

function errorFactory (Parent, name) {
  const ErrorType = function (message) {
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

export const BaseError = errorFactory(Error, "BaseError");

/**
 * Error prototypes with custom behavior
 */

export const HttpError = function (code, payload) {
  this.name = "HttpError";
  this.code = code;
  this.payload = payload;
  this.type = isString(payload) ? "text/html" : "application/json";

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

export const ConfigurationError = errorFactory(BaseError, "ConfigurationError");
export const ParsingErr = errorFactory(BaseError, "ParsingErr");
export const ApiError = errorFactory(BaseError, "ApiError");
