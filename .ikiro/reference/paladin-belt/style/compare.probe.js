import { mime, Path } from "@vivalence/typology";
import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import { FULL as NEXT } from "./belt/index.js";

const root = await Deno.realPath(await Deno.makeTempDir({ prefix: "belt-compare-" }));
const put = async (path, text) => {
  await Deno.mkdir(`${root}/${path}`.replace(/\/[^/]+$/, ""), { recursive: true });
  await Deno.writeTextFile(`${root}/${path}`, text);
};
await put("tree/a.json", '{ "a": 1 } // jsonc');
await put("tree/b.jsonl", '{"b":1}\n{"b":2}\n');
await put("tree/deep/c.js", "export default [{ c: 3 }];");
await put("tree/deep/index.js", "export default [];");
await put("tree/bak/skipped.json", "{}");
await put("tree/one.viva.json", '{ "manifest": { "type": "package", "slug": "one" } }');
await put("tree/deep/two.viva.json", '{ "manifest": { "type": "mode", "slug": "two" } }');
await put("primer/a.md", "---\ndescription: the a\n---\nbody a");
await put("primer/sub/b.md", "---\nvalence: the b\n---\nbody b");
await put("primer/c.md", "plain c");
await put("recipe.json", '{ "inline": "{ \\"x\\": 1 }", "file": "./tree/a.json" }');

const make = (installs) => {
  const paladin = lifecycle.paladin.belt(new Paladin(), installs);
  paladin.scopes([
    ["repository", () => true, () => new Path(root)],
    ["credentials", () => true, () => new Path(`${root}/${installs === FULL ? "old" : "new"}.vault`)],
  ]);
  paladin.assign({ VIVA_PROBE_A: "a", SECRET_VIVA_PROBE_S: "s", PUBLIC_VIVA_PROBE_P: "p" }, "os");
  return paladin;
};
const old = make(FULL);
const next = make(NEXT);

const plain = (value) =>
  JSON.parse(JSON.stringify(value, (_, held) => (held instanceof Path ? held.absolute : held)));
const settle = async (run) => {
  try {
    return plain(await run());
  } catch (error) {
    return { threw: error.message };
  }
};
const node = { a: "${VIVA_PROBE_A}", mix: "x-${VIVA_PROBE_A}-${VIVA_PROBE_GONE}", list: ["${SECRET_VIVA_PROBE_S}", 3] };
const natures = async (primer) => {
  const told = [];
  for (const [pattern, trajectory] of primer.trie) {
    told.push([pattern.nature ?? String(pattern), Object.keys(trajectory.effect ?? {}).length]);
  }
  return [told.length, JSON.stringify([...primer.trie.keys()].map(String))];
};
const instance = {
  environment: {
    properties: {
      VIVA_PROBE_A: { type: "string", description: "a", group: "g" },
      VIVA_PROBE_GONE: { type: "string" },
    },
  },
  paladin: {
    requirements: [{ at: "runtime", read: ["VIVA_PROBE_A", "VIVA_PROBE_X"], unset: ["VIVA_PROBE_X"] }],
    faults: ["runtime broke", "other broke"],
  },
};
const recorded = (run) => {
  const record = [];
  return [run(record), record];
};

const cases = [
  ["read.json", (p) => p.read.json(`${root}/tree/a.json`), null],
  ["read.json fallback", (p) => p.read.json(`${root}/none.json`, { none: true }), null],
  ["read.jsonl", (p) => p.read.jsonl(new Path(`${root}/tree/b.jsonl`)), null],
  ["read.frontmatter", (p) => p.read.frontmatter(`${root}/primer/a.md`), null],
  ["read.data", (p) => p.read.data(`${root}/tree/deep/c.js`), null],
  ["read.viva", (p) => p.read.viva(`${root}/tree/one.viva.json`), null],
  ["read.part inline", (p) => p.read.part(new Path(`${root}/recipe.json`), '{ "x": 1 }', "inline"), null],
  ["read.part file", (p) => p.read.part(new Path(`${root}/recipe.json`), "./tree/a.json", "file"), null],
  ["read.part module", (p) => p.read.part(new Path(`${root}/recipe.json`), "@chess/x", "m"), null],
  ["read.part missing", (p) => p.read.part(new Path(`${root}/recipe.json`), "./gone.json", "g"), null],
  ["link.path absolute", (p) => p.link.path("/abs/x"), (p) => p.source("/abs/x")],
  ["link.path bare", (p) => p.link.path("systems/x"), (p) => p.source("systems/x")],
  ["link.path cwd", (p) => p.link.path("./x"), (p) => p.source("./x")],
  [
    "link.path file",
    (p) => p.link.path({ file: `file://${root}/tree/a.json`, source: "../x" }),
    (p) => p.source({ file: `file://${root}/tree/a.json`, source: "../x" }),
  ],
  [
    "link.env",
    (p) => recorded((record) => p.link.env(node, record, "runtime")),
    (p) => recorded((record) => p.expand(node, record, "runtime")),
  ],
  [
    "link.part",
    (p) => p.link.part(new Path(`${root}/recipe.json`), "./tree/${VIVA_PROBE_A}.json", "file"),
    (p) => p.read.locate(new Path(`${root}/recipe.json`), "./tree/${VIVA_PROBE_A}.json", "file"),
  ],
  [
    "link.part unset",
    (p) => p.link.part(new Path(`${root}/recipe.json`), "${VIVA_PROBE_GONE}", "file"),
    (p) => p.read.locate(new Path(`${root}/recipe.json`), "${VIVA_PROBE_GONE}", "file"),
  ],
  ["find.walk", (p) => p.find.walk(/\.json$/)(new Path(`${root}/tree`)), null],
  ["find.walk depth 0", (p) => p.find.walk(/./)(`${root}/tree`, 0), null],
  ["find.index", (p) => p.find.index(`${root}/tree`), null],
  ["find.viva", (p) => p.find.viva(new Path(`${root}/tree`)), null],
  ["find.json", (p) => p.find.json(new Path(`${root}/tree`)), null],
  ["find.recipe", (p) => p.find.recipe(new Path(root)), null],
  ["find.data", (p) => p.find.data(new Path(`${root}/tree`)), null],
  [
    "find.modules",
    (p) => p.find.modules(new Path(`${root}/tree`), "package"),
    (p) => p.find.type(new Path(`${root}/tree`), "package"),
  ],
  [
    "find.primer",
    async (p) => natures(await p.find.primer(new Path(`${root}/primer`))),
    async (p) => natures(await p.prime.directory(new Path(`${root}/primer`))),
  ],
  [
    "hash",
    async (p) => p.hash.fold(await p.hash.tree(`${root}/tree`)),
    async (p) => p.stamp.fold(await p.stamp.tree(`${root}/tree`)),
  ],
  [
    "vault",
    (p) => {
      p.vault.store("http://a", { user: 1 });
      p.vault.store("http://b", { user: 2 });
      p.vault.store("http://a", null);
      return [p.vault.held("http://a"), p.vault.held("http://b")];
    },
    null,
  ],
  ["check.env", (p) => [...p.check.env(["VIVA_PROBE_A", "VIVA_PROBE_GONE"])], null],
  ["check.environment", (p) => [...p.check.environment(instance)], null],
  ["check.instance", (p) => [...p.check.instance(instance)], null],
  ["is", (p) => Object.fromEntries(Object.keys(p.is).map((key) => [key, p.is[key]])), null],
  [
    "vcs.remote",
    (p) => ["https://x/y", "git@x:y", "./y"].map(p.vcs.remote),
    (p) => ["https://x/y", "git@x:y", "./y"].map((source) => p.clone.remote(source)),
  ],
  [
    "envfile.scaffold",
    (p) => p.envfile.scaffold(instance.environment),
    null,
  ],
  [
    "bundle",
    async (p) => {
      const held = p.bundle.directory(`${root}/bundles-new`, root);
      const hashed = await held.bundle({ mime: mime.dom.html, source: "<h1>x</h1>" });
      return [hashed.entries[0].mount, (await p.bundle.under(`${root}/bundles-new`)).length];
    },
    async (p) => {
      const held = p.bundler(`${root}/bundles-old`, root);
      const hashed = await held.bundle({ mime: mime.dom.html, source: "<h1>x</h1>" });
      return [hashed.entries[0].mount, (await p.bundler.under(`${root}/bundles-old`)).length];
    },
  ],
];

let same = 0;
for (const [label, run, before] of cases) {
  const now = await settle(() => run(next));
  const then = await settle(() => (before ?? run)(old));
  const equal = JSON.stringify(now) === JSON.stringify(then);
  if (now?.threw) console.log("both threw", label, "·", now.threw.slice(0, 90));
  if (equal) same += 1;
  else console.log("DIFFERS", label, "\n  old", JSON.stringify(then), "\n  new", JSON.stringify(now));
}
console.log(`same ${same} of ${cases.length}`);
console.log("new members", Object.keys(next).filter((key) => !(key in new Paladin())).sort().join(" "));
await Deno.remove(root, { recursive: true });
