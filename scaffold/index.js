#!/usr/bin/env node
/* eslint-disable global-require */

Error.stackTraceLimit = Infinity;
require("babel-core/register");
module.exports = require("./scaffold");
