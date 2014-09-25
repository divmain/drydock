var sandbox,
  ControlPanel = require("frontend/views/control-panel/v-control-panel");

describe("views/", function () {
  describe("control-panel", function () {
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it("should restart surrogate server when button is clicked");
  });
});
