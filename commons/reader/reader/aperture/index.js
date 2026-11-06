import { join } from "@std/path";
import { parseHTML } from "linkedom";
import paladin from "@vivalence/paladin";
import { Vector, crypto, v } from "@vivalence/typology";
import { Reading } from "../schematics.js";

const Step = v.object({
  step: v.enum(["fetch", "snapshot", "parse"]).desc("Example: parse"),
  value: v.string().desc('Example: "10 blocks"'),
});

const Add = v.object({
  buffer: v.string().desc('The reader buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
  url: v.string().desc('The page. Example: "https://docs.deno.com/runtime/fundamentals/security/"'),
});

const based = (body, url) => body.replace(/<head[^>]*>/i, (head) => `${head}<base href="${url}">`);

const fetched = async (ctx) => {
  const response = await fetch(ctx.input.url, { redirect: "follow" });
  const body = await response.text();
  const bytes = new TextEncoder().encode(based(body, response.url));
  return {
    page: {
      url: response.url,
      status: response.status,
      type: response.headers.get("content-type"),
      document: parseHTML(body).document,
    },
    bytes,
    sha: await crypto.digestBytes(bytes),
  };
};

const snapshot = async (ctx, buffer, bytes, sha) => {
  const path = `snapshots/${sha}.html`;
  const mount = join(ctx.mode.mountpoint.absolute, path);
  await paladin.state.store(mount, bytes);
  const file = await ctx.entities.file.record({ mode: ctx.mode.id, path, mount, mime: "text/html", bytes });
  buffer.files.add(file);
  return file.id;
};

const picked = (document) =>
  document.querySelector("article") ?? document.querySelector("main") ?? document.body;

const WRAPPERS = ["ARTICLE", "MAIN", "SECTION", "DIV"];

const dense = (node) => {
  const heavy = [...node.children].find(
    (child) => WRAPPERS.includes(child.tagName) && child.textContent.length > node.textContent.length * 0.8,
  );
  return heavy === undefined ? node : dense(heavy);
};

const KEPT = { A: ["href"], IMG: ["src", "alt"] };
const LINKED = { A: "href", IMG: "src" };

const clean = (node, url) => {
  for (const furniture of node.querySelectorAll("script, style, noscript, iframe, form, button, svg")) {
    furniture.remove();
  }
  for (const element of node.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (!(KEPT[element.tagName] ?? []).includes(attribute.name)) element.removeAttribute(attribute.name);
    }
    const linked = LINKED[element.tagName];
    if (linked === undefined || !element.hasAttribute(linked)) continue;
    const target = URL.parse(element.getAttribute(linked), url);
    if (target !== null && ["http:", "https:"].includes(target.protocol)) element.setAttribute(linked, target.href);
    else element.removeAttribute(linked);
  }
  return node;
};

const mint = (body) => {
  [...body.children].forEach((node, index) => node.setAttribute("data-block", `b${index + 1}`));
  return body;
};

export const aperture = new Vector().open(
  { nature: "/add", input: Add, yields: Step },
  async function* (ctx) {
    const { page, bytes, sha } = await fetched(ctx);
    yield { step: "fetch", value: `${page.status} · ${page.type} · ${Math.round(bytes.length / 1024)} kB` };
    const buffer = await ctx.entities.buffer.findOneOrFail({ id: ctx.input.buffer }, { populate: ["files"] });
    const original = await snapshot(ctx, buffer, bytes, sha);
    yield { step: "snapshot", value: "original · sandboxed" };
    const body = mint(clean(dense(picked(page.document)), page.url));
    buffer.data = Reading.cast({
      ...buffer.data,
      article: {
        url: page.url,
        fetched: new Date().toISOString(),
        sha,
        title: page.document.title,
        original,
        parse: "deterministic",
        html: body.innerHTML,
      },
    });
    buffer.trait = {
      ...buffer.trait,
      LABELED: { name: page.document.title },
    };
    await ctx.entities.em.flush();
    yield { step: "parse", value: `${body.children.length} blocks` };
  },
);
