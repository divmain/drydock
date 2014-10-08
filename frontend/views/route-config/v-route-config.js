var
  ajax = require("frontend/util/ajax"),
  watchHash = require("frontend/helpers/watch-hash"),
  tmpl = require("./v-route-config.tmpl"),
  _ = require("lodash"),
  Vue = require("vue");

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

  watch: {
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
