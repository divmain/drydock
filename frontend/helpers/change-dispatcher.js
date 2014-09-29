define([
  "lodash"
], function (_) {
  return {
    compiled: function () {
      _.each(this.$options.dispatchers, function (targets, keypath) {
        this.$watch(keypath, function () {
          var payload = _.chain(targets)
            .map(function (dataProperty, payloadProperty) {
              return [payloadProperty, this.$data[dataProperty]];
            }, this)
            .object()
            .value();
          console.log("change:" + keypath, payload);
          this.$dispatch("change:" + keypath, payload);
        });
      }, this);
    }
  };
});
