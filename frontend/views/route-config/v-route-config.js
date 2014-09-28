define([
  "lodash",
  "vue",
  "frontend/util/ajax",
  "./v-route-config.tmpl",
  "./v-route-config.styl"
], function (_, Vue, ajax, tmpl) {

  return Vue.extend({
    template: tmpl,
    computed: {
      selectedHandlerObj: function () {
        return _.find(this.handlers, { name: this.selectedHandler });
      }
    },
    methods: {
      selectHandler: function (handler) {
        this.$data.selectedHandler = handler.name;
      },
      updateSelectedOptions: function (handler, option) {
        if (!_.contains(handler.selectedOptions, option)) {
          handler.selectedOptions.push(option);
        }
      },
      updateSelectedOption: function (handler, option) {
        handler.selectedOption = option;
      },
      isSelected: function (option, options) {
        return _.contains(options, option);
      }
    }
  });

});
