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

    computed: {
      selectedHandlerObj: function () {
        return _.find(this.handlers, { name: this.selectedHandler });
      }
    },

    watch: {
      "selectedHandler": function (newValue) {
        ajax.put("/surrogate/api/route/handler", {
          data: {
            method: this.$data.method,
            path: this.$data.path,
            selectedHandler: newValue
          }
        });
      },
      "selectedHandlerObj.selectedOption": function (newSelection) {
        if (newSelection) {
          ajax.put("/surrogate/api/route/selected-option", {
            data: {
              method: this.$data.method,
              path: this.$data.path,
              handler: this.$data.selectedHandler,
              selectedOption: newSelection
            }
          });
        }
      },
      "selectedHandlerObj.selectedOptions": function (newSelections) {
        if (newSelections) {
          ajax.put("/surrogate/api/route/selected-options", {
            data: {
              method: this.$data.method,
              path: this.$data.path,
              handler: this.$data.selectedHandler,
              selectedOptions: newSelections
            }
          });
        }
      }
    },

    methods: {
      updateSelectedOptions: function (handler, newSelection) {
        handler.selectedOptions = _.filter(handler.options, function (option) {
          return _.contains(handler.selectedOptions, option) || option === newSelection;
        });
      },
      isSelected: function (handler, option) {
        return _.contains(handler.selectedOptions, option);
      }
    }
  });

});
