var sandbox, routesFixture,
  ajax = require("frontend/util/ajax"),
  _ = require("lodash"),
  Promise = require("bluebird"),
  testHelper = require("spec/helpers/test"),
  ControlPanel = require("frontend/views/control-panel/v-control-panel");

routesFixture = [{
  "name": "set-info",
  "method": "POST",
  "path": "/api/person",
  "selectedHandler": "set-person-success",
  "handlers": [{
    "description": "Save the person's info.",
    "options": [],
    "name": "set-person-success"
  }]
}, {
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
}];

describe("views/", function () {
  describe("control-panel", function () {
    beforeEach(function () {
      sandbox = sinon.sandbox.create();

      this.view = new ControlPanel({
        data: {
          routes: _.cloneDeep(routesFixture),
          delay: 0
        }
      });
      this.view.$mount("#fixtures");
    });

    afterEach(function () {
      sandbox.restore();
      this.view.$destroy();
    });

    describe("route table", function () {
      it("displays the correct number of routes");

      describe("row", function () {
        it("displays the name");

        it("displays the method");

        it("displays the path");

        describe("configure button, when clicked", function () {
          it("expands the route config view if collapsed");

          it("collapses the route config view if expanded");

          it("collapses other route config views if collapsed");
        });
      });
    });

    describe("delay slider", function () {
      it("updates the delay value logarithmically");

      it("updates its position when the delay value changes");

      it("shows FOREVER if the slider goes all the way to the right");

      it("updates the surrogate backend with the delay value");
    });

    describe("reset button", function () {
      beforeEach(function () {
        this.reloadStub = sinon.stub();
        sandbox.stub(ajax, "post").returns(Promise.resolve());
        sinon.stub(this.view, "_getDocument").returns({ location: {
          reload: this.reloadStub
        }});
      });

      it("should restart surrogate server when clicked", function () {
        var
          resetButton = this.view.$el.querySelector(".reset-everything button");
        resetButton.click();

        expect(ajax.post).to.have.been.calledOnce;
      });

      it("should reload the page after the server is reset", function (done) {
        var self = this;
        this.view.resetSurrogate().then(function () {
          testHelper.captureExceptions(done, function () {
            expect(self.reloadStub).to.have.been.calledOnce;
          });
        });
      });
    });
  });
});
