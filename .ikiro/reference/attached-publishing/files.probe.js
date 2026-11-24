// files.probe.js — a REAL runtime process seating a blog whose attachment answers from the File table, never a path join:
// FILESET records what the package ships (mount in the package), /build receives its pages (mount in the mountpoint) and
// records hand-saved assets where they lie (mount in source/); a source/theme.css saved by hand shadows the package's.
//
//     deno run -A --no-check --config <clone>/deno.jsonc .ikiro/reference/attached-publishing/files.probe.js <clone>
//
// <clone> a COPY of the tree whose commons/publishers/blog carries the sketch, never the tree.
import { join } from "@std/path";

const root = Deno.args[0];
const { boot, RECIPE } = await import(join(root, "systems/runtime/tests/scenarios/hello.js"));

const recipe = {
  ...RECIPE,
  daemons: [{ ...RECIPE.daemons[0], modes: [...RECIPE.daemons[0].modes, { module: "@commons/publisher/blog" }] }],
};

const BLOG = "/attached/daemon/hello/mode/publisher/blog";
const MODE = "/daemon/hello/mode/publisher/blog";
const world = await boot({ recipe, prefix: "viva-files-" });
const show = async (label, response) => {
  console.log(`\n${label}`);
  console.log(response.status, response.headers.get("content-type"));
  console.log((await response.text()).slice(0, 300));
};
const files = (label) => {
  console.log(`\n=== File, ${label}`);
  console.log(JSON.stringify(world.query("select * from file order by path"), null, 2));
};

try {
  console.log("ready  ", world.ready);
  const seat = join(world.root, "instance/mountpoint/daemon_hello/mode_publisher_blog");
  files("after boot, before any build");

  await Deno.mkdir(join(seat, "source/pictures"), { recursive: true });
  await Deno.writeTextFile(join(seat, "source/hello.md"), "# Hello\n\nThe first page, *by hand*.\n");
  await Deno.writeFile(join(seat, "source/pictures/logo.png"), new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));

  await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" });
  const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
  const token = login.authority.access;

  await show("POST /build, signed in", await world.post(`${MODE}/build`, {}, token));
  files("after /build");

  const asked = [
    "/hello.html",
    "/index.html",
    "/theme.css",
    "/engine.js",
    "/pictures/logo.png",
    "/nope.html",
    "/source/hello.md",
    "/%2e%2e/source/hello.md",
    "/..%2fsource%2fhello.md",
  ];
  for (const path of asked) await show(`GET ${BLOG}${path}`, await world.get(`${BLOG}${path}`));

  await Deno.writeTextFile(join(seat, "source/theme.css"), "body { background: hotpink; }\n");
  await show("POST /build, after his own source/theme.css saved by hand", await world.post(`${MODE}/build`, {}, token));
  await show(`GET ${BLOG}/theme.css, after his sheet`, await world.get(`${BLOG}/theme.css`));
  files("after his theme.css");

  const tree = [];
  const walk = async (directory) => {
    for await (const entry of Deno.readDir(directory)) {
      if (entry.isDirectory) await walk(join(directory, entry.name));
      else tree.push(join(directory, entry.name).slice(seat.length + 1));
    }
  };
  await walk(seat);
  console.log("\n=== the mountpoint on disk");
  console.log(tree.sort().join("\n"));

  console.log("\n--- the runtime's own output, every row naming the blog or a fault");
  for (const row of world.log.filter((row) => /publisher|blog|fault|Error/.test(row))) console.log(row);
} finally {
  await world.stop();
}
