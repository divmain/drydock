var sinonChai, fixturesEl;

window.chai = require("chai");
window.expect = window.chai.expect;
window.sinon = require("sinon");
sinonChai = require("sinon-chai");
window.chai.use(sinonChai);

fixturesEl = document.createElement("div");
fixturesEl.setAttribute("id", "fixtures");
document.querySelector("body").appendChild(fixturesEl);
fixturesEl.style.position = "absolute";
fixturesEl.style.left = "5000px";

require("spec/test-entry");

after(function() {
  var coverJsEl, mochaEl;
  require("coverjs-loader").reportHtml();
  coverJsEl = document.querySelector(".coverjs-report");
  mochaEl = document.querySelector("#mocha");
  if (coverJsEl) { mochaEl.appendChild(coverJsEl); }
});
