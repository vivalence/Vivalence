import { mime, Path } from "@vivalence/typology";
import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";

const directory = await Deno.makeTempDir({ prefix: "belt-bundle-" });
const origin = await Deno.makeTempDir({ prefix: "belt-bundle-origin-" });
const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([["repository", () => true, () => new Path(origin)]]);

const callable = Object.assign((...given) => paladin.bundler(...given), {
  members: paladin.bundler.members,
  under: paladin.bundler.under,
});
const object = {
  directory: (...given) => paladin.bundler(...given),
  members: paladin.bundler.members,
  under: paladin.bundler.under,
};
const source = "<h1>hashed</h1>";
const a = await object.directory(directory, origin).bundle({ mime: mime.dom.html, source });
const b = await callable(directory, origin).bundle({ mime: mime.dom.html, source });
console.log("object  ", Object.keys(object), a.entries[0].mount);
console.log("callable", typeof callable, Object.keys(callable), b.entries[0].mount);
console.log("under", (await object.under(directory)).length, (await callable.under(directory)).length);
for (const held of [directory, origin]) await Deno.remove(held, { recursive: true });
