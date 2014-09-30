var
  _ = require("lodash"),
  Promise = require("bluebird");

  var assertSuccess, parseHeaders, buildResolved, buildRejected, request,
    justWhitespace = /^\s*$/;

assertSuccess = function (resolvedXhr) {
  if (resolvedXhr.status > 299 || resolvedXhr.status < 200) {
    throw resolvedXhr;
  }
  return resolvedXhr;
};

parseHeaders = function (headerText) {
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
};

buildResolved = function (resolve) {
  return function (xhr) {
    resolve({
      data: xhr.target.response,
      headers: parseHeaders(xhr.target.getAllResponseHeaders()),
      status: xhr.target.status,
      statusText: xhr.target.statusText
    });
  };
};

buildRejected = function (reject) {
  return function (xhr) {
    reject(xhr);
  };
};

request = function (method, url, options) {
  var data, xhr, username, password;

  method = (method || "GET").toUpperCase();
  options = options || {};
  options.contentType = options.contentType || "application/json; charset=utf-8";
  username = _.isString(options.username) && options.username || "";
  password = _.isString(options.password) && options.password || "";

  xhr = new XMLHttpRequest();

  return new Promise(function (resolve, reject) {
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

};

module.exports = {
  get: _.partial(request, "GET"),
  post: _.partial(request, "POST"),
  put: _.partial(request, "PUT"),
  request: request,
  assertSuccess: assertSuccess
};
