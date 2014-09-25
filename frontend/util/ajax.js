define([
  "lodash",
  "bluebird"
], function (
  _,
  Promise
) {

  var justWhitespace = /^\s*$/;

  var assertSuccess = function (resolvedXhr) {
    if (resolvedXhr.status > 299 || resolvedXhr.status < 200) {
      throw resolvedXhr;
    }
    return resolvedXhr;
  };

  var parseHeaders = function (headerText) {
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

  var buildResolved = function (resolve) {
    return function (xhr) {
      resolve({
        data: xhr.target.response,
        headers: parseHeaders(xhr.target.getAllResponseHeaders()),
        status: xhr.target.status,
        statusText: xhr.target.statusText
      });
    };
  };

  var buildRejected = function (reject) {
    return function (xhr) {
      reject(xhr);
    };
  };

  var request = function (method, url, options) {
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
        data = _.isObject(options.data) ?
          JSON.stringify(options.data) :
          _.isString(options.data) ?
            options.data :
            "{}";
        xhr.setRequestHeader("content-type", options.contentType);
      }

      xhr.send(data);
    });

  };

  return {
    get: _.partial(request, "GET"),
    post: _.partial(request, "POST"),
    put: _.partial(request, "PUT"),
    request: request,
    assertSuccess: assertSuccess
  };

});