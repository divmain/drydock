define([
  "lodash",
  "vue",
  "frontend/util/ajax",
  "frontend/helpers/watch-hash",
  "./v-route-config.tmpl",
  "./v-route-config.styl"
], function (_, Vue, ajax, watchHash, tmpl) {

  return Vue.extend({
    template: tmpl,

    mixins: [
      watchHash
    ],

    watch: {
      "selectedHandler": function (newValue) {
        ajax.put("/surrogate/api/route/handler", {
          data: {
            method: this.$data.method,
            path: this.$data.path,
            selectedHandler: newValue
          }
        });
      }
    },

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
