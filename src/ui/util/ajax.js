var _ = require("lodash");
var Promise = require("bluebird");

var justWhitespace = /^\s*$/;

function assertSuccess (resolvedXhr) {
  if (resolvedXhr.status > 299 || resolvedXhr.status < 200) {
    throw resolvedXhr;
  }
  return resolvedXhr;
}

function parseHeaders (headerText) {
  return _.chain(headerText.split("\n"))
    .filter(function (headerLine) {
      return justWhitespace.test(headerLine);
    })
    .map(function (headerLine) {
      var splitIndex = headerLine.indexOf(":");
      return [
        headerLine.slice(0, splitIndex).trim(),
        headerLine.slice(splitIndex + 1).trim()
      ];
    })
    .object()
    .value();
}

function buildResolved (resolve) {
  return function (xhr) {
    resolve({
      data: xhr.target.response,
      headers: parseHeaders(xhr.target.getAllResponseHeaders()),
      status: xhr.target.status,
      statusText: xhr.target.statusText
    });
  };
}

function buildRejected (reject) {
  return function (xhr) {
    reject(xhr);
  };
}

function request (method, url, options) {
  method = (method || "GET").toUpperCase();
  options = options || {};
  options.contentType = options.contentType || "application/json; charset=utf-8";
  var username = _.isString(options.username) && options.username || "";
  var password = _.isString(options.password) && options.password || "";

  var xhr = new XMLHttpRequest();

  return new Promise(function (resolve, reject) {
    var data;

    xhr.addEventListener("load", buildResolved(resolve));
    xhr.addEventListener("error", buildRejected(reject));
    xhr.addEventListener("abort", buildRejected(reject));

    xhr.open(method, url, true, username, password);

    if (method !== "GET") {
      if (_.isObject(options.data)) {
        data = JSON.stringify(options.data);
      } else if (_.isString(options.data)) {
        data = options.data;
      } else {
        data = "{}";
      }

      xhr.setRequestHeader("content-type", options.contentType);
    }

    xhr.send(data);
  });
}

module.exports = {
  get: _.partial(request, "GET"),
  post: _.partial(request, "POST"),
  put: _.partial(request, "PUT"),
  patch: _.partial(request, "PATCH"),
  "delete": _.partial(request, "DELETE"),
  request: request,
  assertSuccess: assertSuccess
};
