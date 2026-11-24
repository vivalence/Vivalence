import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import * as installers from "./a/index.js";
import * as modules from "./b/index.js";

const root = await Deno.makeTempDir({ prefix: "belt-style-" });
const run = async (label, paladin) => {
  const first = await paladin.write.text(`${root}/${label}/one.txt`, "one");
  const again = await paladin.write.text(`${root}/${label}/one.txt`, "one");
  const json = await paladin.write.json(`${root}/${label}/two.json`, { two: 2 });
  const marks = await paladin.hash.tree(`${root}/${label}`);
  console.log(label, { first, again, json, files: marks.length, fold: paladin.hash.fold(marks) });
};

const a = lifecycle.paladin.belt(new Paladin(), FULL);
lifecycle.paladin.belt(a, Object.values(installers));
await run("a", a);

const b = lifecycle.paladin.belt(new Paladin(), FULL);
b.write = modules.write;
b.hash = { fold: modules.hash.fold, tree: (root) => modules.hash.tree(b, root) };
await run("b", b);

await Deno.remove(root, { recursive: true });
