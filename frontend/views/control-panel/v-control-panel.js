var
  ajax = require("frontend/util/ajax"),
  RouteConfig = require("frontend/views/route-config/v-route-config"),
  watchHash = require("frontend/helpers/watch-hash"),
  tmpl = require("./v-control-panel.tmpl"),
  _ = require("lodash"),
  Vue = require("vue");

require("./v-control-panel.styl");

module.exports = Vue.extend({
  template: tmpl,

  components: {
    "route-config": RouteConfig
  },

  mixins: [
    watchHash
  ],

  watchFor: {
    "delay": _.debounce(function (newValue) {
      ajax.put("/surrogate/api/delay", {
        data: { delay: newValue }
      });
    }, 300)
  },

  computed: {
    // range 0 - 10
    delayWidgetPosition: {
      get: function () {
        var number;
        if (this.delay === 0) {
          return 0;
        } else if (this.delay === null  ) {
          return 10;
        }
        number = Math.log(this.delay / 10) / Math.log(2);
        return parseFloat(number.toPrecision(2));
      },
      set: function (newValue) {
        newValue = parseFloat(newValue);
        if (newValue === 0) {
          this.delay = 0;
        } else if (newValue === 10) {
          this.delay = null;
        } else {
          this.delay = Math.pow(2, newValue) * 10;
        }
      }
    },

    delayDisplay: function () {
      return this.delay === null ?
        "HANG" :
        this.delay.toString() + " ms";
    }
  },

  methods: {
    resetSurrogate: function () {
      var self = this;
      return ajax.post("/surrogate/api/reset").then(function () {
        self._getDocument().location.reload();
      });
    },

    toggleRouteConfig: function (route) {
      var alreadyExpanded = route.expanded;
      _.each(this.routes, function (route) {
        route.expanded = false;
      });
      route.expanded = !alreadyExpanded;
    },

    _getDocument: function () {
      return document;
    }
  }
});
