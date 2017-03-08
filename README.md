# Drydock

Sometimes, external dependencies can be as unreliable and unpredictable as the weather.  That's why we built Drydock.

Drydock makes it simple to build stateful, configurable mocks.  When finished, your mocks will be able to reproduce any and all expected interactions between your client application and its backend.  This drastically simplifies end-to-end testing and offline UI development.

Stop waiting for the seas to calm - use Drydock!


## Table of Contents

- [Quick start](#quick-start)
    - [For established projects](#for-established-projects)
        - [Import mode](#import-mode)
        - [Proxy mode](#proxy-mode)
    - [For new projects](#for-new-projects)
- [Introduction: Get the most out of your mocks](#introduction-get-the-most-out-of-your-mocks)
- [Creating a mock service](#creating-a-mock-service)
    - [High Level](#high-level)
    - [Boilerplate](#boilerplate)
    - [Options](#options)
    - [Authoring endpoints](#authoring-endpoints)
        - [JSON routes](#json-routes)
        - [HTML routes](#html-routes)
        - [State](#state)
        - [Configurability via Handler Options](#configurability-via-handler-options)
            - [Select one](#select-one)
            - [Select many](#select-many)
        - [Cookies](#cookies)
        - [Headers](#headers)
    - [Serving files](#serving-files)
        - [Single file](#single-file)
        - [Directory](#directory)
- [Controlling your mock service](#controlling-your-mock-service)
    - [Via the control panel](#via-the-control-panel)
    - [Via the JavaScript API](#via-the-javascript-api)
- [Consuming your mock service](#consuming-your-mock-service)
    - [Single-page application](#single-page-application)
    - [Node](#node)
    - [Java](#java)
- [Contributing](#contributing)



## Quick start

### For established projects

If you already have a working application (both server and client), we provide `drydock-scaffold` to get you up and running quickly.  This tool will take network traffic and transform it into mocks that are ready to use.  It doesn't make any assumptions about state, so you can sprinkle that in as needed.

To get started, make a new directory and install the package:

```
mkdir mock && cd mock
npm init
npm install drydock-scaffold
```

While it is possible to install the tool globally, we recommend a non-saved `npm install` whenever you start a new mock.  This will ensure that the mock that is generated is compatible with the latest version of Drydock.

Once it is installed, it can operate in one of two modes (see below).  Once your mocks have been written to disk, you can run them like `node ./mock.js`.  It is likely that you will want to make modifications, often to add statefulness.

**NOTE:** Proxies are unable to intercept and decode SSL-encrypted traffic, due to the fundamental constraints of the technology.  Because of this, `drydock-scaffold` will not be able to record and generate mock data for existing HTTPS endpoints.  If possible, it is recommended to temporarily set HTTP endpoints for the initial data capture, if they are available.  Otherwise, you will have to resort to other methods to capture the data.


#### Import mode

Import mode is the appropriate choice if your client _is_ a single-page application.

First, run the Chrome web browser and open up the dev tools, selecting the Network tab.  Then, enter the URL of your single-page application and proceed to use the application as your normally would.

After you have completed the full set of typical actions in your application, right-click any of the transactions in the Network tab, and select `Save as HAR with Content`.

Now, run `drydock-scaffold` like so:

```
./node_modules/.bin/drydock-scaffold import ./path/to/saved-file.har
```

`drydock-scaffold` will take the captured network data and save several files to the current working directory, including a `mock.js` and captured fixture data.


#### Proxy mode

Proxy mode is the appropriate choice if your client is _not_ a single-page application.  To use, run `drydock-scaffold` from your new mock directory:

```
./node_modules/.bin/drydock-scaffold --ip 0.0.0.0 --port 1337 --destination ./
```

Now, configure your application to use an HTTP proxy at IP `0.0.0.0` and port `1337`.  Proceed to use your application as you normally would.  You will see the tool indicate in the terminal the HTTP transactions that it has recorded.

When you have completed the full set of typical actions in your application, press `CTRL-C` once (or twice to quit immediately), and several files will be saved to the current working directory.  This will include a `mock.js` and captured fixture data.


### For new projects

If you are just starting development of a new project, there won't be any existing services that `drydock-scaffold` will be able to mimic.  To get a quick start, you can either author the mock using API documentation, or take a look at the example project in the `example/` directory of this repo.


## Introduction: Get the most out of your mocks

There are a lot of solutions out there for standing up mock APIs, and each one takes a slightly different tack.

The simplest mocks return static responses for a given endpoint, with no variation.  These mocks are easy to create but too rigid for dynamic applications.  The most complex mocks duplicate the logic of an actual server application.  These are as flexible as you need them to be, but they typically require a lot of work for a moderate gain.

Drydock is optimized for a middle approach.  In practice, this approach has resulted in mocks that are flexible enough to back some very complex frontend applications.  But they've been reasonably quick to create and maintain.

More specifically, Drydock mocks generally don't really care what the client sends to them.  This may seem counterintuitive.  However, in most cases, the goal for our mock service is to deterministically influence the behavior of the client.  If that is the case, all we should care about is what data is sent _back_ to the client in a response.  Variations in those responses are enumerated as simple handlers, and can be selected and manipulated through Drydock's control panel or the JavaScript API.

For illustration purposes, lets look at a simple sign-in service.  In the simplest case, the frontend application sends a username and password that the user has entered, and the server responds with a session ID.  This is very straightforward, and could be handled by a static mock.

However, in our hypothetical, there are a number of ways that a sign-in attempt could fail.  The user could have entered a wrong password.  Or perhaps the username doesn't exist.  Or, maybe the database is having an unexpected problem.  Or the account may be temporarily locked.

To simulate these conditions, we _could_ select a response based on the content of the request - `garfield@a.cat` would result in a `200`, `odie@a.cat` would result in a `400`, and so on.  Drydock does support this strategy.

_However,_ these special values can be hard to remember and hard to keep in-sync.  Furthermore, the user who is interacting with the client (this could be a real user, or an automated test) does not always have direct control over the content of a request.  And often, the schema for a given request type may not have enough variations to accommodate the number of possible responses (the request payload could only include a single boolean value, for example).

Instead, Drydock allows you to enumerate all the possible responses that a request to a particular endpoint could result in.  Then, using the control panel or the JavaScript API, the response can be precisely controlled.  For cases where it is desired that the result of one request impacts a later request, Drydock exposes a shared-state object to all of the handlers that are invoked.  This should not be overused, but can result in a more natural experience for your user.


## Creating a mock service

### High-level

The process for writing and consuming drydock mocks will, of course, vary in each situation.  But the general pattern described will usually look something like this:

1. **You determine the scope of your mocks** by enumerating all of your endpoints.  For example, if the user of your application is able to sign-in somehow, there will likely be something akin to a `POST /api/sign-in` endpoint.  You can always add more endpoints later, so just aim for the minimum required for your application's "happy path".
2. Next, **determine some or all of the variations** for each of those endpoints.  In the case of our login example, a `POST` might result in: `200 successful login`, `400 wrong password`, `400 user not found`, etc.
3. **Create a new `.js` file containing the Drydock boilerplate** (provided below).
4. Then, using the documentation provided, **author endpoints** with their variations.
5. **Configure your application to point to the mock server.**  There are some tips for how to go about this at the end of the README.


### Boilerplate

The following is the bare minimum you will need to stand up a new Drydock mock.  Of course, it won't be of much use to you until you add endpoints!

```javascript
var Drydock = require("drydock");
var drydock = new Drydock({
  initialState: {
    // Anything you put here will be accessible as
    // `this.state` within your handlers.
  }
});

// Define your routes here.

drydock.start();
```


### Options

When creating a `new Drydock` instance, the following options can be provided.  There are no manditory options, as each has a default value.

- `port` _integer_ - the port that your mock server should listen on.  Defaults to `1337` if not provided.
- `ip` _string_ - the IP that you mock server should bind to.  Defaults to `0.0.0.0` (all interfaces) if not provided.
- `verbose` _boolean_ - indicates whether the mock server should output HTTP transaction data and additional logging to the console.  Defaults to `false` if not provided.
- `cors` _boolean_ - indicates whether the mock server should respond to CORS requests.  Defaults to `false` if not provided.
- `cookieEncoding` _string_ - indicates the transformation between raw cookie data and how it is transferred to the client.  See the `encoding` in [Hapi's state management documentation](http://hapijs.com/api#serverstatename-options) to learn about the available options.  Defaults to `none` if not provided.
- `proxyUndefined` _boolean_ - indicates whether requests for unknown routes should be forwarded to the host specified in the HTTP request.  This requires that the client is configured to use the Drydocks server as a proxy.
- `caseInsensitive` _boolean_ - indicates whether or not routes will be case sensitive or not. Defaults to false.


### Authoring endpoints

Once you have your `Drydock` instance, you'll need to define some routes.


#### JSON routes

If your endpoint accepts and/or replys with JSON payloads, you'll want to define a JSON route.  It will look something like this:

```javascript
drydock.jsonRoute({
  // The name by which this route will be referenced.
  name: "my-name"
  method: "POST",
  // Path values support params (see docs below).
  path: "/api/name",
  handlers: {
    // If your route can respond to requests in more than one way, you should
    // define a handler for each of those ways here.
    "set-name-success": {
      // This description will be displayed in the control panel.
      description: "Save the user's name."
      handler: function (request) {
        this.state.name = request.payload.name;
        this.cookies.nameIsSet = "true";
        return { status: "OK" };
      }
    }
  }
});
```

Each handler function takes a request object.  This object will have the following properties:

- `payload` - the body of the HTTP request.
- `params` - the parameters in the requested URL (see below).
- `query` - the dictionary object equivalent of the query string.

Path values support parameters.  In our example above, if the user whose name was to be set had a unique user ID, the path might have been `/api/user/{userId}/name`.  When processing a request for a URL that matches this pattern, the `params` property of the `request` object would look something like this:

```json
{
  "userId": "5682"
}
```

Drydock routes return status code 200 by default, but it does support specifying what status code the response should have. See an example in the HTML route below. Currently, the `headers` option only support status codes.  

#### HTML routes

Routes that return HTML will function similarly to JSON routes, and can be defined using the `Drydock.prototype.htmlRoute` method.  Here's an example:

```javascript
drydock.htmlRoute({
  name: "get-name",
  method: "GET",
  path: "/api/name",
  headers: { code: 201 }
  handlers: {
    "get-name-success": {
      description: "Return the name that was previously set.",
      handler: function (request) {
        var name = this.cookies.nameIsSet ?
          this.state.name :
          "unknown";
        return "<html><body>The user's name is " + name + "</body></html>";
      },
    },
    "get-name-error": {
      description: "Return an error instead of the user's name.",
      handler: function () {
        throw new Drydock.Errors.HttpError(401, "<html>The evil shredder attacks. Oh no!!!</html>");
      }
    }
  }
});
```


#### Proxy routes

If you'd like to define routes that should be forwarded to a specific URL on an existing server, you can define a `proxyRoute`.  This is useful if the API you are mocking relies on another service, or if you'd like to enumerate all routes that you _plan_ to mock, but implement those mocks incrementally.

Here's an example:

```javascript
drydock.proxyRoute({
  method: "GET",
  path: "/google",
  forwardTo: "http://www.google.com/"
});
```

If your mock server is running on `localhost` port `1337`, opening `http://localhost:1337/google` in your browser will result in the HTML from `www.google.com`.

`forwardTo` can alternatively take a function to dynamically determine the url.

For example:

```javascript
drydock.proxyRoute({
  method: "GET",
  path: "/images/{path*}",
  forwardTo: (request) => `https:/localhost:8080/images/${request.params.path}`
});
```


#### State

The above example shows us now to make our mocks stateful.  When invoked, each handler will have access to `this.state`, a simple object that is share across your mock instance.  In this way, you can persist data from across endpoints and requests.

To define an initial state, you can pass an `initialState` object as an option to the `Drydock` constructor.


#### Configurability via Handler Options

The above example also demonstrates how to define multiple handlers for a single endpoint.  In the original use-case that brought about Drydock, there were close to hundred possible responses (many of them errors) for some of our endpoints.  In this way, multiple handlers can mimic the full breadth of an endpoints behavior.

However, sometimes even with unlimited handlers, they can still be too static.  What is needed is not breadth, but depth of configurability for particular _handlers_.

This need is met through the use of handler options.  Here's the same example route as the one above, except more configurability is added to its handler through options.

```javascript
drydock.htmlRoute({
  name: "get-name",
  method: "GET",
  path: "/api/name",
  handlers: {
    "get-name-success": {
      description: "Return the name that was previously set.",
      handler: function (request, selectedTitle) {
        var name = this.cookies.nameIsSet ?
          this.state.name :
          "unknown";
        return "<html><body>The user's name is " + selectedTitle + name + "</body></html>";
      },
      // This text will be displayed in the control panel.
      optionsHelperText: "What title should precede the name?",
      optionsType: "selectOne",
      options: {
        // The keys will be displayed in the control panel, and the values
        // will be passed to the handler above.
        "Mr.": "Mr. ",
        "Mrs.": "Mrs. ",
        "Ms.": "Ms. ",
        "None": ""
      }
    },
    "get-name-error": {
      description: "Return an error instead of the user's name.",
      handler: function () {
        throw new Drydock.Errors.HttpError(401, "<html>The evil shredder attacks. Oh no!!!</html>");
      }
    }
  }
});
```

Although a bit pedantic, this example illustrates how adding configurability to a handler can provide your mock increased configurability without bloating your endpoint with hundreds of handlers.


##### Select one

A handler's options comes in two varieties.  The first is `selectOne`.  In this mode, whatever option has been selected will be passed as a second parameter to the invoked handler.

To use, the following properties should be set on your handler:

- `optionsHelperText` - This text will be displayed in the control panel, and will help users understand what they're configuring.
- `optionsType` - This should be set to `selectOne`.
- `options` - This is object where the keys are the options displayed in the control panel, and the values are the objects that will be passed to the handler when the option is selected.

In the example above, if the user selects `Mr.` in the control panel when prompted with _What title should precede the name?_, then the string `"Mr. "` will be passed to the handler when the route is hit.  Similarly, if they select `None`, the string `""` will be passed to the handler when the route is hit.

The values in the `options` object need not be strings - they can be an object, even functions (which provides a significant avenue for handler flexibility).


##### Select many

The second variety is `selectMany`.  This functions identically to `selectOne`, with a couple of exceptions.  The first may be obvious; `optionsType` must be set to `selectMany`.

The other exception is that, when the handler is invoked, it will receive as its second argument not a single selected value, but an array of selected values.

For example, we might want to select suffixes for a person's name.  It is possible for a person to be both a `Jr.` and an `M.D.`.  This is a time we would use `selectMany` instead of `selectOne`.  When invoked, the handler would receive as its second argument something like `[" Jr.", " M.D"]`.


#### Cookies

You can write or read to the cookie state via `this.cookies` in your handler.

Earlier, we saw this when `this.cookies.nameIsSet` was set to `"true"`.  You'll notice that it was not set to a boolean, but to a string.  This is because cookies take the form of strings.  If you need to read or write more complex data to a cookie, you'll need to (de)serialize your data using `JSON.stringify` and `JSON.parse`.


#### Headers

It is also possible to directly set a response header.  To do so, set a property of `this.headers`, like so:

```javascript
this.headers.MY_HEADER = "SOME STRING VALUE";
```


### Serving files

Drydock is capable of serving up assets to a frontend application.


#### Single file

To serve a single file, use the `Drydock.prototype.staticFile` method.  You'll need to provide both a `filePath` and a `urlPath`.  The `filePath` _must_ be an absolute path to an existing file on the file system.  The `urlPath` should look something like `/path/to/my/file.jpg`.


#### Directory

Serving a directory works similarly.  `filePath` _must_ be an absolute path to an existing directory on the file system.  `urlPath` should look something like `/path/to/my/dir/`.


## Controlling your mock service

### Via the control panel

After you've created some endpoints, you'll need some way to configure them.  Once running, a Drydock mock has two primary interfaces: the browser control panel and the JavaScript API.

The control panel can be accessed via the `/drydock/` route.  For example, if your mock is running on `127.0.0.1` and port `1337`, the control panel can be accessed via [http://127.0.0.1:1337/drydock/](http://127.0.0.1:1337/drydock/).

In the control panel, you will see each route that was defined.  If you click on a route, you will see all the possible ways that route can behave - these are the handlers that defined earlier.  Some handlers will be configurable, if you have defined options for that handler.


### Via the JavaScript API

**TODO**


## Consuming your mock service

It isn't enough to create a mock API, you application has to consume it instead of the real service.


### Single-page application

If your client is a SPA, here are a few ways you might get it to point to your new mock.

- Have Drydock render the HTML that bootstraps your SPA.  The template for this HTML can take a value for the desired API endpoint.
- Configure your SPA to point to the mock API URL when a particular URL query string is present for your SPA.
- Set your browser's proxy to point to the mock server.  This will cause problems with browsing if you don't revert the change.
- Use a browser plugin to switch your proxy, like [Proxy SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=en), and only enable the proxy when you are testing your application.


### Node

Generally, the easiest way to go about this is to check environment variables for the run environment.  Configure your application to use the mock URL when it is provided as an environment variable.  For example, you might execute your node application like so:

```
API_BASE=http://127.0.0.1:1337 node ./path/to/my/app.js
```


### Java

Java is a little trickier, but you can define proxy settings in the `JAVA_OPTS` environment variable.  It might look something like this:

```
export JAVA_OPTS="-XX:MaxPermSize=1024m -Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=1337 -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=1337"
```


## Contributing

If you'd like to see something changed or added to Drydock, please open an issue or PR.  Make sure `npm run test` passes before you submit your PR.

**Note:**  If you're making changes and testing Drydock on your local machine, you'll need to run `npm run build` so that the ES6 source is compiled to ES5 in `lib/`.
