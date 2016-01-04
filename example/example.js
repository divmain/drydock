var path = require("path");
var Drydock = require("..");
var drydock = new Drydock({
  port: 1337,
  ip: "0.0.0.0",
  verbose: false,
  proxyUndefined: true,
  initialState: {
    birthday: null
  },
  cors: true
});

drydock.jsonRoute({
  name: "set-info",
  method: "POST",
  path: "/api/person",
  handlers: {
    "set-person-success": {
      description: "Save the person's info.",
      handler: function (request) {
        this.state.birthday = request.payload.birthday;
        this.cookies.hasBirthday = true;
        return { status: "OK" };
      }
    }
  }
});

drydock.htmlRoute({
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

        this.cookies.msg = "1";

        return selectedOption(name + " " + birthday);
      },
      optionsHelperText: "What should birthday info be wrapped in?",
      optionsType: "selectOne",
      options: {
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
      handler: function () {
        throw new Drydock.HttpErr({
          code: 401,
          payload: "<html>can't do that right now...</html>"
        });
      }
    }
  }
});

drydock.htmlRoute({
  name: "get-things",
  method: "GET",
  path: "/api/things",
  handlers: {
    "get-things-success": {
      description: "Return things.",
      handler: function (request, selectedOptions) {
        return selectedOptions.join(" ");
      },
      optionsHelperText: "What things should be returned?",
      optionsType: "selectMany",
      options: {
        "thing 1": "thing 1",
        "thing 2": "thing 2"
      }
    },
    "get-things-error": {
      description: "Return an error instead of the things.",
      handler: function () {
        throw new Drydock.HttpErr({
          code: 401,
          payload: "<html>can't do that right now...</html>"
        });
      }
    }
  }
});

drydock.staticDir({
  filePath: path.join(__dirname, "example-dir"),
  urlPath: "/static/"
});

if (require.main === module) {
  drydock.start();
} else {
  module.exports = drydock;
}
