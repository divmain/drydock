var _ = require("lodash"),
  Vue = require("vue");

var
  ajax = require("frontend/util/ajax"),
  watchHash = require("frontend/helpers/watch-hash");

var tmpl = require("./v-route-config.tmpl");

require("./v-route-config.styl");

module.exports = Vue.extend({
  template: tmpl,

  mixins: [
    watchHash
  ],

  computed: {
    selectedHandlerObj: function () {
      return _.find(this.handlers, { name: this.selectedHandler });
    }
  },

  watchFor: {
    "selectedHandler": function (newValue) {
      ajax.put("/surrogate/api/route", {
        data: {
          name: this.$data.name,
          selectedHandler: newValue
        }
      });
    },
    "selectedHandlerObj.selectedOption": function (newSelection) {
      if (newSelection) {
        ajax.put("/surrogate/api/route/selected-option", {
          data: {
            name: this.$data.name,
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
            name: this.$data.name,
            handler: this.$data.selectedHandler,
            selectedOptions: newSelections
          }
        });
      }
    }
  },

  methods: {
    updateSelectedOptions: function (handler, clickedOption) {
      handler.selectedOptions = _.filter(handler.options, function (option) {
        var isClickedOption = option === clickedOption;

        return isClickedOption ?
          // if option is the one clicked, include it if it wasn't already, or disclude it if it was
          // If the clicked option is already in selectedOptions, it's being deselected
          !_.contains(handler.selectedOptions, option) :
          // if options is not the one that was clicked, include only if it is already included
          _.contains(handler.selectedOptions, option);
      });
    },
    isSelected: function (handler, option) {
      return _.contains(handler.selectedOptions, option);
    }
  }
});
