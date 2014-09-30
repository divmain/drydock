var sandbox, selectOneFixture, selectManyFixture, noOptionsFixture,
  _ = require("lodash"),
  RouteConfig = require("frontend/views/route-config/v-route-config");

noOptionsFixture = {
  "name": "set-info",
  "method": "POST",
  "path": "/api/person",
  "selectedHandler": "set-person-success",
  "handlers": [{
    "description": "Save the person's info.",
    "options": [],
    "name": "set-person-success"
  }]
};

selectOneFixture = {
  "name": "get-info",
  "method": "GET",
  "path": "/api/person",
  "selectedHandler": "get-person-success",
  "handlers": [{
    "description": "Return info about the person.",
    "optionsHelperText": "What should birthday info be wrapped in?",
    "optionsType": "selectOne",
    "options": ["wrap in body", "wrap in html"],
    "selectedOption": "wrap in body",
    "name": "get-person-success"
  }, {
    "description": "Return an error instead of the person's info.",
    "options": [],
    "name": "get-person-error"
  }]
};

selectManyFixture = {
  "name": "get-things",
  "method": "GET",
  "path": "/api/things",
  "selectedHandler": "get-things-success",
  "handlers": [{
    "description": "Return things.",
    "optionsHelperText": "What thigns should be returned?",
    "optionsType": "selectMany",
    "options": ["thing 1", "thing 2"],
    "selectedOptions": ["thing 1", "thing 2"],
    "name": "get-things-success"
  }, {
    "description": "Return an error instead of the things.",
    "options": [],
    "name": "get-things-error"
  }]
};

describe("views/", function () {
  describe("route-config", function () {
    beforeEach(function () {
      sandbox = sinon.sandbox.create();

      this.view = new RouteConfig({
        data: {

        }
      });
    });

    afterEach(function () {
      sandbox.restore();
      if (this.view) {
        this.view.$destroy();
        delete this.view;
      }
    });

    describe("for all configurations", function () {
      beforeEach(function () {
        this.view = new RouteConfig({
          data: _.cloneDeep(noOptionsFixture)
        });
        this.view.$mount("#fixtures");
      });

      it("should display all available handlers");

      it("should update selectedHandler when handler is selected");

      it("should display helper text");
    });

    describe("with selectOne options", function () {
      it("should display all available options");

      it("should update the surrogate server when clicked");
    });

    describe("with selectMany options", function () {
      it("should display all available options");

      it("should update the surrogate server when clicked");
    });
  });
});
