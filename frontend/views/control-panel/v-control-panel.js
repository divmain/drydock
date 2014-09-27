define([
  "lodash",
  "vue",
  "frontend/util/ajax",
  "frontend/views/route-config/v-route-config",
  "./v-control-panel.tmpl",
  "./v-control-panel.styl"
], function (_, Vue, ajax, RouteConfig, tmpl) {

  return Vue.extend({
    template: tmpl,

    created: function () {
      this.$watch("delay", _.debounce(function (newValue) {
        ajax.put("/surrogate/api/response-delay", {
          data: { delay: newValue }
        });
      }, 300));
    },

    methods: {
      resetSurrogate: function () {
        ajax.post("/surrogate/api/reset").then(function () {
          document.location.reload();
        });
      },
      toggleRouteConfig: function (route) {
        route.expanded = !route.expanded;
      }
    },

    computed: {
      // range 0 - 10
      delayWidgetPosition: {
        $get: function () {
          var number;
          if (this.delay === 0) {
            return 0;
          } else if (this.delay === "forever") {
            return 10;
          }
          number = Math.log(this.delay / 10) / Math.log(2);
          return parseFloat(number.toPrecision(2));
        },
        $set: function (newValue) {
          newValue = parseFloat(newValue);
          if (newValue === 0) {
            this.delay = 0;
          } else if (newValue === 10) {
            this.delay = "forever";
          } else {
            this.delay = Math.pow(2, newValue) * 10;
          }
        }
      },
      delayDisplay: function () {
        return this.delay === "forever" ?
          "HANG" :
          this.delay.toString() + " ms";
      }
    },

    components: {
      "route-config": RouteConfig
    }
  });

});
