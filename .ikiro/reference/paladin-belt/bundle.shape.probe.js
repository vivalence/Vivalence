import { mime, Path } from "@vivalence/typology";
import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";

const directory = await Deno.makeTempDir({ prefix: "bundle-shape-probe-" });
const origin = await Deno.makeTempDir({ prefix: "bundle-shape-probe-origin-" });
await Deno.writeTextFile(`${origin}/page.html`, "<h1>named</h1>");

const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([["repository", () => true, () => new Path(origin)]]);
const bundler = paladin.bundler(directory, origin);

const keys = (held) => Object.keys(held).sort();
const hashed = await bundler.bundle({ mime: mime.dom.html, source: "<h1>hashed</h1>" });
console.log("source →", hashed.constructor.name, keys(hashed), hashed.entries[0].mount);

const named = await bundler.bundle({ mime: mime.dom.html, mount: "page.html", name: "page.mjs" });
console.log("mount  →", named.constructor.name, keys(named), named.bundle.entries[0].mount);
console.log("sources", named.sources.map((source) => source.path.replace(origin, "<origin>")
  .replace(directory, "<directory>")));
console.log("fresh", await bundler.fresh(named.sources));

const again = await bundler.bundle({ mime: mime.dom.html, source: "<h1>hashed</h1>" });
console.log("source again, artifact held →", keys(again), "inputs known:", "sources" in again);

const entry = `${origin}/page.html`;
const entered = await bundler.bundle({ mime: mime.dom.html, entry });
console.log("entry  →", entered.constructor.name, entered.entries[0].mount);
console.log("on disk", (await paladin.find.index(directory)).map((file) => file.path));
for (const held of [directory, origin]) await Deno.remove(held, { recursive: true });
