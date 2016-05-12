var _ = require("lodash");
var Vue = require("vue");

var ajax = require("../../util/ajax");
var RouteConfig = require("../route-config/v-route-config");
var watchHash = require("../../helpers/watch-hash");

var tmpl = require("./v-control-panel.tmpl");

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
      ajax.put("/drydock/api/delay", {
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
        } else if (this.delay === null) {
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
      return ajax.post("/drydock/api/reset").then(function () {
        self._getDocument().location.reload();
      });
    },

    toggleRouteConfig: function (route) {
      var alreadyExpanded = route.expanded;
      _.each(this.routes, function (rte) {
        rte.expanded = false;
      });
      route.expanded = !alreadyExpanded;
    },

    _getDocument: function () {
      return document;
    }
  }
});
