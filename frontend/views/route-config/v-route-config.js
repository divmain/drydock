define([
  "lodash",
  "vue",
  "../../util/ajax.js",
  "./v-route-config.tmpl",
  "./v-route-config.styl"
], function (_, Vue, ajax, tmpl) {

  return Vue.extend({
    template: tmpl,
    methods: {
      onMutatorSelectionChange: function (ev) {
        var
          selectedValue = ev.target.value,
          route = _.findWhere(this.routes, {
            path: ev.targetVM.route.path,
            method: ev.targetVM.route.method
          });
        route.selectedMutator = selectedValue;
      },
      isSelected: function (option, options) {
        return _.contains(options, option);
      },
      changeMultiSelection: function (route, option) {
        if (_.contains(route.selected, option)) {
          route.selected.splice(route.selected.indexOf(option), 1);
        } else {
          route.selected.push(option);
        }
      }
    }
  });

});
