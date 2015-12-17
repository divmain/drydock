import _ from "lodash";

import * as Errors from "./errors";


export function route (name) {
  const _route = _.find(this.routes, { name });

  if (!_route) {
    throw new Errors.ApiError("Invalid route.");
  }

  return {
    setHandler (handlerName) {
      const handler = _route.handlers[handlerName];
      if (!handler) {
        throw new Errors.ApiError(`Invalid handler for route '${_route.name}'.`);
      }
      _route.selectedHandler = handlerName;

      return this;
    },

    setOption (optionName, handlerName) {
      const handler = _route.handlers[handlerName || _route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError(`Invalid handler for route '${_route.name}'.`);
      }
      if (!handler.options[optionName]) {
        throw new Errors.ApiError(
          `Invalid option '${optionName}' for handler '${_route.selectedHandler}'.`);
      }

      handler.selectedOption = optionName;

      return this;
    },

    setOptions (optionNamesArray, handlerName) {
      const handler = _route.handlers[handlerName || _route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError(`Invalid handler for route '${_route.name}'.`);
      }
      if (!_.isArray(optionNamesArray)) {
        throw new Errors.ApiError("You must provide an array of option names to setOptions.");
      }
      for (const optionName of optionNamesArray) {
        if (!handler.options[optionName]) {
          throw new Errors.ApiError(
            `Invalid option '${optionName}' for handler '${_route.selectedHandler}'.`);
        }
      }

      handler.selectedOptions = optionNamesArray;

      return this;
    }
  };
}
