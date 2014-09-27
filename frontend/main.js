define([
  "lodash",
  "frontend/util/ajax",
  "frontend/views/control-panel/v-control-panel"
], function (_, ajax, ControlPanel) {
  var routes;

  ajax.get("/surrogate/api/routes").then(function (response) {
    routes = JSON.parse(response.data);
  }).then(function () {
    (new ControlPanel({
      data: {
        routes: routes,
        delay: 0
      }
    })).$appendTo("body");
  });
});
