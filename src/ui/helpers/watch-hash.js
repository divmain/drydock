var
  _ = require("lodash");

module.exports = {
  compiled: function () {
    _.each(this.$options.watchFor, function (handler, keypath) {
      this.$watch(keypath, handler);
    }, this);
  }
};
