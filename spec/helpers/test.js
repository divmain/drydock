module.exports = {
  captureExceptions: function (done, fn) {
    try {
      fn();
      done();
    } catch (error) {
      done(error);
    }
  }
};
