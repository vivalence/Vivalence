// blog.probe.js — a REAL runtime process seating @commons/publisher/blog on the daemon, the recipe's entry adding <traits>;
// a source is written BY HAND into the mode's mountpoint, then every path a stranger and a signed-in client would ask.
//
//     deno run -A --no-check --config <clone>/deno.jsonc .ikiro/reference/attached-publishing/blog.probe.js <clone> <traits>
//
// <traits> comma-joined, added by the recipe's mode entry: none · BOOTED · TWITCHY,FILESINK (SURFACED is the manifest's own word
// since 11-23: the surface's bundle is fetched whenever a blog Surface entity exists). <clone> a COPY, never the tree.
import { join } from "@std/path";

const root = Deno.args[0];
const { boot, RECIPE } = await import(join(root, "systems/runtime/tests/scenarios/hello.js"));
const traits = Deno.args[1] === "none" ? [] : Deno.args[1].split(",");

const recipe = {
  ...RECIPE,
  daemons: [{ ...RECIPE.daemons[0], modes: [...RECIPE.daemons[0].modes, { module: "@commons/publisher/blog", traits }] }],
};

const BLOG = "/attached/daemon/hello/mode/publisher/blog";
const world = await boot({ recipe, prefix: "viva-blog-" });
const show = async (label, response) => {
  console.log(`\n${label}`);
  console.log(response.status, response.headers.get("content-type"));
  console.log((await response.text()).slice(0, 600));
};

try {
  console.log("ready  ", world.ready);
  const found = [];
  const seek = async (directory) => {
    for await (const entry of Deno.readDir(directory)) {
      if (!entry.isDirectory) continue;
      if (entry.name === "mode_publisher_blog") found.push(join(directory, entry.name));
      else await seek(join(directory, entry.name));
    }
  };
  await seek(join(world.root, "instance/mountpoint"));
  console.log("seats  ", found.map((seat) => seat.slice(world.root.length)));
  const seat = found[0] ?? join(world.root, "instance/mountpoint/daemon_hello/mode_publisher_blog");

  await Deno.mkdir(join(seat, "source/articles"), { recursive: true });
  await Deno.writeTextFile(join(seat, "source/hello.md"), "# Hello\n\nThe first page, *by hand*.\n");
  await Deno.writeTextFile(join(seat, "source/articles/second.org"), "#+title: Second\n\n* a heading\n\nOrg text.\n");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await show("GET hello.html, 1500 ms after the hand write, nobody asked for a build", await world.get(`${BLOG}/hello.html`));

  await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" });
  const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
  const token = login.authority.access;

  await show("POST /build, no token", await world.post("/daemon/hello/mode/publisher/blog/build", {}));
  await show("POST /build, signed in", await world.post("/daemon/hello/mode/publisher/blog/build", {}, token));
  await show("POST /build again", await world.post("/daemon/hello/mode/publisher/blog/build", {}, token));
  const asked = [
    "/hello.html",
    "/articles/second.html",
    "/index.html",
    "/",
    "",
    "/theme.css",
    "/nope.html",
    "/../source/hello.md",
    "/%2e%2e/source/hello.md",
    "/..%2fsource%2fhello.md",
    "/%2e%2e%2fsource%2fhello.md",
    "/articles/..%2f..%2fsource%2fhello.md",
  ];
  for (const path of asked) {
    await show(`GET ${BLOG}${path}`, await world.get(`${BLOG}${path}`));
  }
  if (traits.includes("FILESINK")) {
    const bytes = [...new TextEncoder().encode("# Wired\n\nA source sent over the wire.\n")];
    const receive = "/daemon/hello/mode/publisher/blog/files/receive";
    await show("POST /files/receive, bytes as a JSON array of numbers", await world.post(receive, { path: "source/wired.md", bytes }, token));
    await new Promise((resolve) => setTimeout(resolve, 800));
    await show(`GET ${BLOG}/wired.html, 800 ms after`, await world.get(`${BLOG}/wired.html`));
  }
  const [surface] = world.query("select id from surface where slug = 'blog'");
  if (surface) {
    const bundle = await world.get(`/attached/surface/${surface.id}?token=${token}`);
    await show(`GET /attached/surface/<the blog surface's id>, signed in`, bundle);
  }
  console.log("\nsurfaces", world.query("select slug, mount, entry from surface"));
  console.log("files  ", world.query("select path, mime from file"));
  console.log("\n--- the runtime's own output, every row naming the blog or a fault");
  for (const row of world.log.filter((row) => /publisher|blog|fault|Error/.test(row))) console.log(row);
} finally {
  await world.stop();
}
