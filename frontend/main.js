var
  ajax = require("frontend/util/ajax"),
  _ = require("lodash"),
  ControlPanel = require("frontend/views/control-panel-v-control-panel");

ajax.get("/surrogate/api/routes").then(function (response) {
  var controlPanel,
    routes = JSON.parse(response.data);

  _.each(routes, function (route) { route.expanded = false; });

  controlPanel = new ControlPanel({
    data: {
      routes: routes,
      delay: 0
    }
  });

  controlPanel.$mount("#control-panel");
});
