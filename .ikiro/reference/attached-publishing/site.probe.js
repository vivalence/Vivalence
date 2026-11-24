// site.probe.js — a REAL runtime process seating @commons/publisher/blog; a whole blog laid into its mountpoint by hand
// (<blog>/src/content/on/*.md → source/on/, <blog>/public/** → source/, <site>/linktree.md · site.json), pressed, asked.
//
//     deno run -A --no-check --config <clone>/deno.jsonc site.probe.js <clone> <blog> <site> [hold seconds]
//
// <clone> a COPY of the tree, never the tree. <blog> an astro blog's root, read only. hold keeps the process answering.
import { join, relative } from "@std/path";

const [root, blog, site, hold] = Deno.args;
const { boot, RECIPE } = await import(join(root, "systems/runtime/tests/scenarios/hello.js"));

const recipe = {
  ...RECIPE,
  daemons: [{ ...RECIPE.daemons[0], modes: [...RECIPE.daemons[0].modes, { module: "@commons/publisher/blog", traits: [] }] }],
};
const BLOG = "/attached/daemon/hello/mode/publisher/blog";
const MODE = "/daemon/hello/mode/publisher/blog";
const world = await boot({ recipe, prefix: "viva-site-" });

const laid = async (from, to) => {
  for await (const entry of Deno.readDir(from)) {
    if (entry.isDirectory) await laid(join(from, entry.name), join(to, entry.name));
    else if (!entry.name.startsWith(".") && !entry.name.endsWith(".docx")) {
      await Deno.mkdir(to, { recursive: true });
      await Deno.copyFile(join(from, entry.name), join(to, entry.name));
    }
  }
};

try {
  const seat = join(world.root, "instance/mountpoint/daemon_hello/mode_publisher_blog");
  await laid(join(blog, "src/content/on"), join(seat, "source/on"));
  await laid(join(blog, "public"), join(seat, "source"));
  await Deno.copyFile(join(site, "linktree.md"), join(seat, "source/linktree.md"));
  await Deno.copyFile(join(site, "site.json"), join(seat, "site.json"));

  await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" });
  const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
  const token = login.authority.access;

  for (const label of ["cold", "warm, nothing changed"]) {
    const started = performance.now();
    const built = await world.post(`${MODE}/build`, {}, token);
    console.log(`build ${label}: ${built.status} in ${Math.round(performance.now() - started)} ms`, JSON.stringify(await built.json()));
  }
  const shelf = await (await world.post(`${MODE}/source/list`, {}, token)).json();
  console.log("site  ", shelf.site);
  for (const source of shelf.sources) console.log("source", source.path, source.fault ?? `${source.article.status} · ${source.article.date ?? "page"} · ${source.article.title}`);

  for (const path of ["/", "/on/eva", "/on/feminism", "/on/machines", "/linktree", "/essays", "/theme.css", "/robots.txt", "/images/EVA-1024.jpg", "/on/eva.md"]) {
    const response = await fetch(`${world.origin}${BLOG}${path}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    console.log("GET   ", path, response.status, response.headers.get("content-type"), bytes.length, "bytes");
  }
  const index = await (await fetch(`${world.origin}${BLOG}/`)).text();
  console.log("\nindex lists", [...index.matchAll(/<a href="\.\/(on\/[^"]+)">\s*<h2>([^<]+)/g)].map(([, href, title]) => `${href} · ${title}`));
  const eva = await (await fetch(`${world.origin}${BLOG}/on/eva`)).text();
  console.log("eva head\n" + eva.slice(0, eva.indexOf("</head>")));
  console.log("eva rooted paths left in the body:", [...eva.slice(eva.indexOf("<main>")).matchAll(/(?:src|href)="\/[^"/][^"]*"/g)].map(([found]) => found));
  console.log("files ", world.query("select path, mime, bytes from file order by path").map((file) => `${file.path} ${file.mime} ${file.bytes}`));
  console.log("faults", world.log.filter((row) => /fault|Error/.test(row)));
  if (hold) {
    console.log(`HOLD ${world.origin}${BLOG}/ for ${hold} s`);
    await new Promise((resolve) => setTimeout(resolve, Number(hold) * 1000));
  }
} finally {
  await world.stop();
}
