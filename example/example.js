var
  Surrogate = require(".."),
  surrogate = new Surrogate({
    port: 1337,
    ip: "0.0.0.0",
    verbose: false,
    initialState: {
      birthday: null
    }
  });

surrogate.addHtmlRoute({
  name: "get-info",
  method: "GET",
  path: "/api/person",
  handlers: {
    "get-person-success": {
      description: "Return info about the person.",
      handler: function (request, selectedOption) {
        var
          name = request.query.name || "Tommy Joe",
          birthday = this.state.birthday ?
            "has a birthday on " + this.state.birthday + "." :
            "has no birthday.";

        return selectedOption(name + " " + birthday);
      },
      optionsSelectOne: {
        "wrap in body": function (str) {
          return "<html><body>" + str + "</body></html>";
        },
        "wrap in html": function (str) {
          return "<html>" + str + "</html>";
        }
      }
    },
    "get-person-error": {
      description: "Return an error instead of the person's info.",
      handler: function (request) {
        throw new Surrogate.HttpErr({
          code: 401,
          payload: "<html>can't do that right now...</html>"
        });
      }
    }
  }
});

surrogate.addJsonRoute({
  name: "set-info",
  method: "POST",
  path: "/api/person",
  handlers: {
    "set-person-success": {
      description: "Save the prson info",
      handler: function (request) {
        this.state.birthday = request.payload.birthday;
        this.cookies.hasBirthday = true;
        return { status: "OK" };
      }
    }
  }
});

surrogate.addHapiRoute({
  name: "restart"
  method: "POST",
  path: "/surrogate/api/restart",
  handler: function (request, reply) {
    surrogate.restart(function () {
      reply("OK")
        .type("text/plain")
        .code(200);
    });
  }
});

surrogate.start();
