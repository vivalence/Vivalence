// limit: 2000 chars
// reader-mode Q13 — which element is the article: a tag pick vs Readability, on one fixture.
// deno run -A --no-check .ikiro/reference/reader-mode/add.probe.js
import { parseHTML } from "npm:linkedom@0.18.5";
import { Readability } from "npm:@mozilla/readability@0.6.0";
const html = await Deno.readTextFile("commons/services/reader/tests/fixtures/deno-docs.html");
const a = parseHTML(html).document;
const picked = a.querySelector("article") ?? a.querySelector("main") ?? a.body;
console.log("=== A", JSON.stringify({ tag: picked.tagName, children: [...picked.children].map((n) => n.tagName) }));
const b = new Readability(parseHTML(html).document).parse();
console.log("=== B raw", JSON.stringify({ title: b.title, content: b.content.slice(0, 200) }));
const body = parseHTML(`<!doctype html><html><body>${b.content}</body></html>`).document.body;
const root = body.firstElementChild;
console.log("=== B", JSON.stringify({ top: [...body.children].map((n) => n.tagName + "#" + n.id), inner: [...root.children].map((n) => n.tagName), deeper: [...(root.firstElementChild?.children ?? [])].map((n) => n.tagName) }));
