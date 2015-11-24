var color, Text,
  _ = require("lodash");

// ********************

color = _.extend(function (text, color) {
  return color + text + "\x1b[0m";
}, {
  normal: "\x1b[0m",
  black: "\x1b[30m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
});

// ********************

Text = function (text) {
  if (typeof text === undefined) {
    throw new Error("you must supply a toString-able parameter");
  }
  if (text instanceof Text) {
    return text;
  }
  this.text = text.toString();
};

Text.prototype.toString = Text.prototype.inspect = function () {
  return this._color ? color(this.text, this._color) : this.text;
};

Text.prototype.rightJustify = function (width) {
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }
  this.text = (new Array(width).join(" ") + this.text).slice(-width);
  return this;
};

Text.prototype.leftJustify = function (width) {
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }
  this.text = (this.text + Array(width).join(" ")).slice(0, width);
  return this;
};

Text.prototype.center = function (width) {
  var extra, left, right;
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }

  extra = width - this.text.length;
  if (extra < 1) { return this; }

  left = right = extra / 2 | 0;
  if (extra % 2) { right++; }

  this.text = Array(left + 1).join(" ") + this.text + Array(right + 1).join(" ");
  return this;
};

Text.prototype.pad = function (num, chr) {
  var padding;

  if (!num || num < 0) {
    throw new Error("you must supply the number of characters to pad by");
  }

  chr = chr || " ";
  padding = Array(num + 1).join(chr);
  this.text = padding + this.text + padding;

  return this;
};

Text.prototype.color = function (color) {
  this._color = color;
  return this;
};

Text.prototype.black = _.partial(Text.prototype.color, color.black);
Text.prototype.bright = _.partial(Text.prototype.color, color.bright);
Text.prototype.red = _.partial(Text.prototype.color, color.red);
Text.prototype.green = _.partial(Text.prototype.color, color.green);
Text.prototype.yellow = _.partial(Text.prototype.color, color.yellow);
Text.prototype.blue = _.partial(Text.prototype.color, color.blue);
Text.prototype.magenta = _.partial(Text.prototype.color, color.magenta);
Text.prototype.cyan = _.partial(Text.prototype.color, color.cyan);

module.exports = function (text) {
  return new Text(text);
};
