var sandbox, routesFixture,
  ajax = require("frontend/util/ajax"),
  Promise = require("bluebird"),
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
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe("reset button", function () {
      beforeEach(function () {
        this.view = new ControlPanel({
          data: {
            routes: routesFixture,
            delay: 0
          }
        });

        this.reloadStub = sinon.stub();
        sandbox.stub(ajax, "post").returns(Promise.resolve());
        sinon.stub(this.view, "_getDocument").returns({ location: {
          reload: this.reloadStub
        }});

        this.view.$mount("#fixtures");
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
          expect(self.reloadStub).to.have.been.calledOnce;
          done();
        });
      });
    });
  });
});
