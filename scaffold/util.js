import text from "../lib/text";

export function printRow (a, b, c) {
  console.log("" + text(a).rightJustify(5) + text(b).rightJustify(7) + " " + c);
}
