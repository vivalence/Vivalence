import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import { hash } from "./a/hash.js";
import { Hash } from "./c/hash.js";

const root = await Deno.makeTempDir({ prefix: "belt-class-" });
await Deno.writeTextFile(`${root}/one.txt`, "one");

const closure = lifecycle.paladin.belt(new Paladin(), [...FULL, hash]);
const classed = lifecycle.paladin.belt(new Paladin(), FULL);
classed.hash = new Hash(classed);

const detached = async (label, paladin) => {
  const { tree } = paladin.hash;
  try {
    console.log(label, "detached", (await tree(root)).length);
  } catch (error) {
    console.log(label, "detached", error.message);
  }
};
for (const [label, paladin] of [["closure", closure], ["class", classed]]) {
  const marks = await paladin.hash.tree(root);
  console.log(label, "bound", marks.length, paladin.hash.fold(marks), Object.keys(paladin.hash));
  await detached(label, paladin);
}
await Deno.remove(root, { recursive: true });
