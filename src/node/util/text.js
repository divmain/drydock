import { partial } from "lodash";


const color = Object.assign((text, _color) => `${_color}${text}\x1b[0m`, {
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


export class Text {
  constructor (text) {
    if (typeof text === "undefined") {
      throw new Error("you must supply a parameter with `toString` method");
    }
    if (text instanceof Text) { return text; }
    this.text = text.toString();
    return this;
  }

  toString () {
    return this._color ? color(this.text, this._color) : this.text;
  }

  rightJustify (width) {
    if (typeof width !== "number" || width < 0) {
      throw new Error("you must supply a width");
    }
    this.text = (new Array(width).join(" ") + this.text).slice(-width);
    return this;
  }

  leftJustify (width) {
    if (!width || width < 0) {
      throw new Error("you must supply a width");
    }
    this.text = (this.text + Array(width).join(" ")).slice(0, width);
    return this;
  }

  center (width) {
    if (!width || width < 0) {
      throw new Error("you must supply a width");
    }

    const extra = width - this.text.length;
    if (extra < 1) { return this; }

    const left = Math.floor(extra / 2);
    const right = Math.ceil(extra / 2);

    this.text = Array(left + 1).join(" ") + this.text + Array(right + 1).join(" ");
    return this;
  }

  pad (num, chr) {
    if (!num || num < 0) {
      throw new Error("you must supply the number of characters to pad by");
    }

    chr = chr || " ";
    const padding = Array(num + 1).join(chr);
    this.text = padding + this.text + padding;

    return this;
  }

  color (_color) {
    this._color = _color;
    return this;
  }
}

Text.prototype.inspect = Text.prototype.toString;
Text.prototype.black = partial(Text.prototype.color, color.black);
Text.prototype.bright = partial(Text.prototype.color, color.bright);
Text.prototype.red = partial(Text.prototype.color, color.red);
Text.prototype.green = partial(Text.prototype.color, color.green);
Text.prototype.yellow = partial(Text.prototype.color, color.yellow);
Text.prototype.blue = partial(Text.prototype.color, color.blue);
Text.prototype.magenta = partial(Text.prototype.color, color.magenta);
Text.prototype.cyan = partial(Text.prototype.color, color.cyan);

export default function (text) {
  return new Text(text);
}
