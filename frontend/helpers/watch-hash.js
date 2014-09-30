var
  _ = require("lodash");

module.exports = {
  compiled: function () {
    _.each(this.$options.watch, function (handler, keypath) {
      this.$watch(keypath, handler);
    }, this);
  }
};
