// desk.probe.js — the blog's desk surface, bundled as the runtime bundles it, mounted in a bare page
// against a REAL runtime process of a copy; a seat's source/ and site.json copied in, read only.
//
//     cd <clone> && deno run -A --no-check --config deno.jsonc desk.probe.js <clone> <seat> <port> [theme]
//
// <clone> a COPY of the tree, never the tree. <seat> a mountpoint of the blog mode, copied, never written.
// [theme] one of dapper's THEMES (northsea · parchment · porcelain · datasette), northsea when left out.
// The page answers on <port> until the process is killed: buffer.$data is a store in the page,
// call.* is POSTed through this process to the runtime with a signed-in token.
import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime } from "@vivalence/typology";

const [root, seat, port, worn = "northsea"] = Deno.args;
const { boot, RECIPE } = await import(join(root, "systems/runtime/tests/scenarios/hello.js"));
const recipe = {
  ...RECIPE,
  daemons: [
    {
      ...RECIPE.daemons[0],
      modes: [...RECIPE.daemons[0].modes, { module: "@commons/publisher/blog", traits: [] }],
    },
  ],
};
const MODE = "/daemon/hello/mode/publisher/blog";
const world = await boot({ recipe, prefix: "viva-desk-" });
const seated = join(world.root, "instance/mountpoint/daemon_hello/mode_publisher_blog");

const laid = async (from, to) => {
  for await (const entry of Deno.readDir(from)) {
    if (entry.isDirectory) await laid(join(from, entry.name), join(to, entry.name));
    else {
      await Deno.mkdir(to, { recursive: true });
      await Deno.copyFile(join(from, entry.name), join(to, entry.name));
    }
  }
};
await laid(join(seat, "source"), join(seated, "source"));
await Deno.copyFile(join(seat, "site.json"), join(seated, "site.json"));

await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" });
const login = await (
  await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })
).json();
const token = login.authority.access;
console.log("build", JSON.stringify(await (await world.post(`${MODE}/build`, {}, token)).json()));

const out = await Deno.makeTempDir({ prefix: "viva-desk-bundle-" });
await paladin.bundler(out, join(root, "commons/publishers/blog")).bundle({
  mime: mime.dom.solid,
  mount: "buffer/Blog.jsx",
  name: "blog.mjs",
});
const surface = await Deno.readTextFile(join(out, "blog.mjs"));
const members = await paladin.bundler.members();

const page = `<!DOCTYPE html>
<html data-theme="${worn}"><head><meta charset="utf-8"><title>desk probe</title>
<link rel="stylesheet" href="/theme.css">
<script type="importmap">${JSON.stringify({
  imports: Object.fromEntries(
    Object.entries(members.imports).map(([specifier, file]) => [specifier, `/members/${file}`]),
  ),
})}</script>
<style>html,body{margin:0;height:100%;background:var(--plane-lift);color:var(--text-ink)}
#desk{height:100vh;display:flex;flex-direction:column}</style></head>
<body><div id="desk"></div><script type="module">
const held = { value: ${JSON.stringify({ open: null })}, listeners: new Set() };
const $data = {
  get: () => held.value,
  subscribe(listener) { held.listeners.add(listener); listener(held.value);
    return () => held.listeners.delete(listener); },
};
const posted = (path) => async (input = {}, options = {}) => {
  const response = await fetch("/call" + path, options.raw
    ? { method: "POST", body: options.raw.body, headers: options.headers, duplex: "half" }
    : { method: "POST", body: JSON.stringify(input), headers: { "content-type": "application/json" } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? JSON.stringify(body));
  return body;
};
const called = (path) => new Proxy(() => {}, {
  get: (_, name) => called(path + "/" + String(name)),
  apply: (_, __, args) => posted(path)(...args),
});
const props = {
  buffer: { id: "probe", $data, mode: { call: called("") } },
  terminal: { client: { runtime: { entities: { buffer: { updateOne: async (where, update) => {
    held.value = update.data; held.listeners.forEach((listener) => listener(held.value));
    window.held = held.value;
  } } } } } },
};
const { default: mount } = await import("/surface.mjs");
window.desk = mount(document.getElementById("desk"), props);
</script></body></html>`;

const dapper = await import(join(root, "subsystems/dapper/mod.js"));
const sheet = dapper.emit(worn, dapper.THEMES[worn]);

Deno.serve({ port: Number(port), hostname: "127.0.0.1" }, async (request) => {
  const url = new URL(request.url);
  if (url.pathname === "/") return new Response(page, { headers: { "content-type": "text/html" } });
  if (url.pathname === "/theme.css")
    return new Response(sheet, { headers: { "content-type": "text/css" } });
  if (url.pathname === "/surface.mjs")
    return new Response(surface, { headers: { "content-type": "text/javascript" } });
  if (url.pathname.startsWith("/members/"))
    return new Response(members.files[url.pathname.slice("/members/".length)], {
      headers: { "content-type": "text/javascript" },
    });
  if (url.pathname.startsWith("/call/")) {
    const answered = await fetch(`${world.origin}${MODE}${url.pathname.slice("/call".length)}`, {
      method: "POST",
      body: request.body,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": request.headers.get("content-type") ?? "application/json",
      },
    });
    return new Response(answered.body, { status: answered.status, headers: answered.headers });
  }
  return new Response("no", { status: 404 });
});
console.log("desk", `http://127.0.0.1:${port}/`, "seat", seated, "runtime", world.origin);
