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

surrogate.jsonRoute({
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

surrogate.htmlRoute({
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
        throw new Surrogate.HttpErr({
          code: 401,
          payload: "<html>can't do that right now...</html>"
        });
      }
    }
  }
});

surrogate.start();
