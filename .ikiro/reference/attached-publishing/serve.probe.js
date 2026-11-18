import { encodeHex } from "@std/encoding";
import { extname, join } from "@std/path";
import { Aperture, fromm, shape, shard, Vector } from "@vivalence/typology";
import { authenticate } from "../../../systems/runtime/subjects/lighthouse/signer.js";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
};

const ENGINE = new URL("../../../node_modules/solid-js/dist/solid.js", import.meta.url);

const page = (title, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>` +
  `<link rel="stylesheet" href="../style.css"><script type="module" src="../engine.js"></script></head>` +
  `<body><article><h1>${title}</h1>${body}</article></body></html>`;

const slugged = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const rendered = (text) =>
  text
    .split(/^# /m)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [title, ...rows] = chunk.split("\n");
      const body = rows.join("\n").trim().split(/\n\n+/).map((row) => `<p>${row}</p>`).join("");
      return { path: `article/${slugged(title)}.html`, title, content: page(title, body) };
    });

async function bundle(root, text) {
  const articles = rendered(text);
  const index = page("index", articles.map((article) => `<p><a href="${article.path}">${article.title}</a></p>`).join(""));
  const files = [
    { path: "index.html", content: index },
    { path: "style.css", content: "article { max-width: 68ch; margin: 4rem auto; font: 18px/1.6 serif; }" },
    { path: "engine.js", content: await Deno.readTextFile(ENGINE) },
    ...articles,
  ];
  const manifest = {};
  for (const file of files) {
    const bytes = new TextEncoder().encode(file.content);
    const mount = join(root, file.path);
    await Deno.mkdir(join(mount, ".."), { recursive: true });
    await Deno.writeFile(mount, bytes);
    manifest[`/${file.path}`] = {
      mount,
      mime: MIME[extname(file.path)],
      bytes: bytes.length,
      integrity: encodeHex(await crypto.subtle.digest("SHA-256", bytes)).slice(0, 32),
    };
  }
  return manifest;
}

const root = await Deno.makeTempDir({ prefix: "attached-publishing-" });
const mode = { buffer: { text: "" }, bundle: {} };

const published = new Vector().open("/(.*)", async (ctx) => {
  const file = ctx.mode.bundle[fromm.params(ctx.params).path.absolute];
  if (!file) {
    ctx.response.status = 404;
    ctx.response.type = "text/plain";
    return "not published";
  }
  ctx.response.headers.set("etag", `"${file.integrity}"`);
  ctx.response.headers.set("cache-control", file.mime.startsWith("text/html") ? "no-cache" : "public, max-age=3600");
  if (ctx.request.headers.get("if-none-match") === `"${file.integrity}"`)
    return new Response(null, { status: 304, headers: Object.fromEntries(ctx.response.headers) });
  ctx.response.type = file.mime;
  return await Deno.readFile(file.mount);
});

const routes = new Aperture()
  .use(shard.context.bind("mode", mode))
  .open("/buffer", (ctx) => {
    ctx.mode.buffer.text = ctx.request.body.text;
    return { chars: ctx.mode.buffer.text.length };
  })
  .open("/bundle", async (ctx) => {
    ctx.mode.bundle = await bundle(root, ctx.mode.buffer.text);
    return ctx.mode.bundle;
  });

const login = authenticate({ secret: "probe", users: { findOne: () => null } });

const aperture = new Aperture();
aperture.branch("/daemon/demo").use(login).branch("/mode/publish/blog", routes);
aperture.branch("/open/mode/publish/blog", routes);
aperture.branch("/attached/mode/publish/blog").use(shard.context.bind("mode", mode)).graft(published);

const served = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen: () => {} }, shard.cors.wrap(shape.http(aperture)));

const bare = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen: () => {} }, async (request) => {
  const file = mode.bundle[new URL(request.url).pathname];
  if (!file) return new Response("not published", { status: 404 });
  return new Response(await Deno.readFile(file.mount), {
    headers: { "content-type": file.mime, etag: `"${file.integrity}"`, "cache-control": "public, max-age=3600" },
  });
});

console.log(JSON.stringify({ pid: Deno.pid, aperture: served.addr.port, bare: bare.addr.port, root }));
