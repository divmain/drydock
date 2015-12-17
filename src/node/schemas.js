import Joi from "joi";

import * as Errors from "./errors";


export function validateConfig (schema, obj) {
  const result = Joi.validate(obj, schema);
  if (result.error) {
    throw new Errors.ConfigurationError(result.error.toString());
  }
}

export function validateApiUpdate (obj, schema) {
  const result = Joi.validate(obj, schema);
  if (result.error) {
    throw new Errors.ApiError(result.error.toString());
  }
}

export const route = Joi.object().keys({
  name: Joi.string().regex(/^[A-Za-z0-9\-]+$/).required(),
  method: Joi.string().allow("*", "GET", "POST", "PUT", "DELETE", "PATCH").required(),
  path: Joi.string().required(),
  handlers: Joi.object().required(),
  hostname: Joi.string().optional()
});

export const handler = Joi.object().keys({
  description: Joi.string().required(),
  handler: Joi.func().required(),
  optionsHelperText: Joi.string(),
  optionsType: Joi.string().allow("selectOne", "selectMany"),
  options: Joi.object(),
  selectedOptions: Joi.array()
}).with("options", "optionsType", "optionsHelperText");


export const staticRoute = Joi.object().keys({
  filePath: Joi.string().required(),
  urlPath: Joi.string().required()
});

export const delay = Joi.object().keys({
  delay: Joi.alternatives().try(Joi.number().integer(), Joi.any().valid(null)).required()
});
