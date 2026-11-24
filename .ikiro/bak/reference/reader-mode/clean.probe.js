// limit: 3000 chars
// reader-mode Q14 — cleaning the picked article: a hand allowlist vs DOMPurify, on one fixture.
// deno run -A --no-check .ikiro/reference/reader-mode/clean.probe.js
import { parseHTML } from "npm:linkedom@0.18.5";
import createDOMPurify from "npm:dompurify@3.2.4";
const url = "https://docs.deno.com/runtime/fundamentals/security/";
const html = await Deno.readTextFile("commons/services/reader/tests/fixtures/deno-docs.html");
const pick = (d) => d.querySelector("article") ?? d.querySelector("main") ?? d.body;

const KEPT = { A: ["href"], IMG: ["src", "alt"] };
const cleanA = (node) => {
  for (const furniture of node.querySelectorAll("script, style, noscript, iframe, form, button")) furniture.remove();
  for (const element of node.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (!(KEPT[element.tagName] ?? []).includes(attribute.name)) element.removeAttribute(attribute.name);
    }
    if (element.tagName === "A") element.setAttribute("href", new URL(element.getAttribute("href"), url).href);
    if (element.tagName === "IMG") element.setAttribute("src", new URL(element.getAttribute("src"), url).href);
  }
  return node;
};
const a = cleanA(pick(parseHTML(html).document));
console.log("=== A", JSON.stringify({ html: a.innerHTML.replace(/\s+/g, " ").trim() }, null, 2));

const { window } = parseHTML("<!doctype html><html><body></body></html>");
let b;
try {
  const purify = createDOMPurify(window);
  b = purify.sanitize(pick(parseHTML(html).document).innerHTML, { ALLOWED_ATTR: ["href", "src", "alt"] });
} catch (error) { b = "THROWS: " + error.message; }
console.log("=== B", JSON.stringify({ html: String(b).replace(/\s+/g, " ").trim() }, null, 2));
