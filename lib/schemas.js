var
  Errors = require("./errors"),
  Joi = require("joi");

/*********
  Schemas
 *********/

module.exports = {
  validateConfig: function (schema, obj) {
    var result = Joi.validate(obj, schema);
    if (result.error) {
      throw new Errors.ConfigurationError(result.error.toString());
    }
  },

  validateApiUpdate: function (obj, schema) {
    var result = Joi.validate(obj, schema);
    if (result.error) {
      throw new Errors.ApiError(result.error.toString());
    }
  },

  route: Joi.object().keys({
    name: Joi.string().regex(/^[A-Za-z\-]+$/).required(),
    method: Joi.string().allow("*", "GET", "POST", "PUT", "DELETE", "PATCH").required(),
    path: Joi.string().regex(/^[A-Za-z\-\/\_\{\}]+$/).required(),
    handlers: Joi.object().required()
  }),

  handler: Joi.object().keys({
    description: Joi.string().required(),
    handler: Joi.func().required(),
    optionsHelperText: Joi.string(),
    optionsType: Joi.string().allow("selectOne", "selectMany"),
    options: Joi.object(),
    selectedOptions: Joi.array()
  }).with("options", "optionsType", "optionsHelperText"),

  staticRoute: Joi.object().keys({
    filePath: Joi.string().required(),
    urlPath: Joi.string().required()
  }),

  delay: Joi.object().keys({
    delay: Joi.alternatives().try(Joi.number().integer(), Joi.any().valid(null)).required()
  })
};
