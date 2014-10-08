var
  Errors = require("./errors"),
  _ = require("lodash");

function route(name) {
  var _route = _.find(this.routes, { name: name });

  if (!_route) {
    throw new Errors.ApiError("Invalid route.");
  }

  return {
    setHandler: function (handlerName) {
      var handler = _route.handlers[handlerName];
      if (!handler) {
        console.log("handlerName", handlerName);
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      _route.selectedHandler = handlerName;
      return this;
    },

    setOption: function (optionName) {
      var handler = _route.handlers[_route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      if (!handler.options[optionName]) {
        throw new Errors.ApiError(
          "Invalid option '" + optionName + "' for handler '" + _route.selectedHandler + "'.");
      }

      handler.selectedOption = optionName;
      return this;
    },

    setOptions: function (optionNamesArray) {
      var handler = _route.handlers[_route.selectedHandler];

      if (!handler) {
        throw new Errors.ApiError("Invalid handler for route '" + _route.name + "'.");
      }
      if (!_.isArray(optionNamesArray)) {
        throw new Errors.ApiError("You must provide an array of option names to setOptions.");
      }
      _.each(optionNamesArray, function (optionName) {
        if (!handler.options[optionName]) {
          throw new Errors.ApiError(
            "Invalid option '" + optionName + "' for handler '" + _route.selectedHandler + "'.");
        }
      });

      handler.selectedOptions = optionNamesArray;
      return this;
    }
  };
}

module.exports = {
  route: route
};
