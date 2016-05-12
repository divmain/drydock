var ajax = require("./util/ajax");
var _ = require("lodash");
var ControlPanel = require("./views/control-panel/v-control-panel");

ajax.get("/drydock/api/routes").then(function (response) {
  var routes = JSON.parse(response.data);

  _.each(routes, function (route) { route.expanded = false; });

  var controlPanel = new ControlPanel({
    data: {
      routes: routes,
      delay: 0
    }
  });

  controlPanel.$mount("#control-panel");
});
