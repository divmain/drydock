var ajax = require("frontend/util/ajax"),
  _ = require("lodash"),
  testHelper = require("frontend/test-helper"),
  Vue = require("vue"),
  RouteConfig = require("frontend/views/route-config/v-route-config");

var sandbox;

var noOptionsFixture = {
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

// var selectOneFixture = {
//   "name": "get-info",
//   "method": "GET",
//   "path": "/api/person",
//   "selectedHandler": "get-person-success",
//   "handlers": [{
//     "description": "Return info about the person.",
//     "optionsHelperText": "What should birthday info be wrapped in?",
//     "optionsType": "selectOne",
//     "options": ["wrap in body", "wrap in html"],
//     "selectedOption": "wrap in body",
//     "name": "get-person-success"
//   }, {
//     "description": "Return an error instead of the person's info.",
//     "options": [],
//     "name": "get-person-error"
//   }]
// };

var selectManyFixture = {
  "name": "get-things",
  "method": "GET",
  "path": "/api/things",
  "selectedHandler": "get-things-success",
  "handlers": [{
    "name": "get-things-success",
    "description": "Return things.",
    "optionsHelperText": "What thigns should be returned?",
    "optionsType": "selectMany",
    "options": ["thing 1", "thing 2"],
    "selectedOptions": ["thing 1"]
  }, {
    "name": "get-things-error",
    "description": "Return an error instead of the things.",
    "options": []
  }]
};

describe("views/", function () {
  describe("route-config", function () {
    var view;

    beforeEach(function () {
      sandbox = sinon.sandbox.create({ useFakeTimers: false });
    });

    afterEach(function () {
      sandbox.restore();
      if (view) {
        view.$destroy();
        view = null;
      }
    });

    describe("for all configurations", function () {
      beforeEach(function () {
        view = new RouteConfig({
          data: _.cloneDeep(noOptionsFixture)
        });
        view.$mount("#fixtures");
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
      beforeEach(function () {
        view = new RouteConfig({
          data: _.cloneDeep(selectManyFixture)
        });
        view.$mount("#fixtures");
      });

      it("should display all available options");

      it("removes an element from selectedOptions if it is unchecked by user", function (done) {
        var
          handler = _.find(view.handlers, { name: "get-things-success" }),
          el = view.$el.querySelector("input[name='config-get-things-success-selmany-0']");

        sandbox.stub(ajax, "put");
        expect(handler.selectedOptions).to.have.length(1);
        testHelper.click(el);

        Vue.nextTick(testHelper.captureExceptions(done, function () {
          expect(handler.selectedOptions).to.have.length(0);
        }));
      });

      it("adds an element to selectedOptions if it is checked by user", function (done) {
        var
          handler = _.find(view.handlers, { name: "get-things-success" }),
          el = view.$el.querySelector("input[name='config-get-things-success-selmany-1']");

        sandbox.stub(ajax, "put");
        expect(handler.selectedOptions).to.have.length(1);
        testHelper.click(el);

        Vue.nextTick(testHelper.captureExceptions(done, function () {
          expect(handler.selectedOptions).to.have.length(2);
        }));
      });
    });
  });
});
