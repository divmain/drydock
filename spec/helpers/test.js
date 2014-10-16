module.exports = {
  click: function (el) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      "click", true, true, window, 0, 0, 0 ,0 ,0, false, false, false, false, 0, null);
    return !el.dispatchEvent(evt);
  },
  captureExceptions: function (done, fn) {
    return function () {
      try {
        fn();
        done();
      } catch (error) {
        done(error);
      }
    };
  }
};
