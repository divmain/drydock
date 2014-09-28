define([
  "lodash",
  "frontend/util/ajax",
  "frontend/views/control-panel/v-control-panel"
], function (_, ajax, ControlPanel) {
  ajax.get("/surrogate/api/routes").then(function (response) {
    var routes = JSON.parse(response.data);
    (new ControlPanel({
      data: {
        routes: routes,
        delay: 0
      }
    })).$appendTo("body");
  });
});
