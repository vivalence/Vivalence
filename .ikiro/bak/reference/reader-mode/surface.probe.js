// limit: 3000 chars
// reader-mode Q2A — one fixture, two parsed surfaces: block JSON and marked HTML.
// deno run -A --no-check .ikiro/reference/reader-mode/surface.probe.js
import { parseHTML } from "npm:linkedom@0.18.5";

const html = await Deno.readTextFile("commons/services/reader/tests/fixtures/deno-docs.html");
const { document } = parseHTML(html);
const article = document.querySelector("article");
const children = [...article.children];

const KIND = { H1: "heading", H2: "heading", P: "paragraph", PRE: "code", UL: "list", BLOCKQUOTE: "quote" };
const split = (text) => text.replace(/\s+/g, " ").trim().split(/(?<=[.!?:])\s+(?=[A-Z])/);

const blocks = children.map((node, index) => ({
  id: `b${index + 1}`,
  kind: KIND[node.tagName],
  level: node.tagName.startsWith("H") ? Number(node.tagName[1]) : null,
  sentences: split(node.textContent),
  caption: null,
  asset: null,
  span: `article > :nth-child(${index + 1})`,
  done: index < 2 ? "2026-11-10T16:2" + index + ":00Z" : null,
}));

children.forEach((node, index) => {
  node.setAttribute("data-block", `b${index + 1}`);
  if (index < 2) node.setAttribute("data-done", "2026-11-10T16:2" + index + ":00Z");
  for (const attribute of [...node.attributes]) if (!attribute.name.startsWith("data-")) node.removeAttribute(attribute.name);
});

console.log("=== A · block JSON");
console.log(JSON.stringify({ blocks }, null, 2));
console.log("=== B · marked HTML");
console.log(JSON.stringify({ html: article.innerHTML.trim() }, null, 2));
console.log("=== bytes", JSON.stringify({ blocks }).length, JSON.stringify({ html: article.innerHTML.trim() }).length);
