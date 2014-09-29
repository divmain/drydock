define([
  "lodash"
], function (_) {
  return {
    compiled: function () {
      _.each(this.$options.watch, function (handler, keypath) {
        this.$watch(keypath, handler);
      }, this);
    }
  };
});
