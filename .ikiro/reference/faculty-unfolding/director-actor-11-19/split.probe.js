import { Path, shape, steer } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const here = import.meta.dirname;
const print = (label, system) => console.log(label, JSON.stringify(system, null, 2));

console.log("A · by branch");
const natures = shape.primer.nodes(await paladin.prime.directory(new Path(`${here}/primerA`))).map((node) => `${node.nature} (${node.load})`);
console.log(natures.join(" · "));
const actorA = (await paladin.prime.directory(new Path(`${here}/primerA`))).trim("/director");
const directorA = (await paladin.prime.directory(new Path(`${here}/primerA`))).trim("/actor");
print("actor", await shape.primer.load(actorA, {}));
print("director", await shape.primer.load(directorA, {}));

console.log("B · by a header key");
const flat = await paladin.prime.directory(new Path(`${here}/primerB`));
console.log(shape.primer.nodes(flat).map((node) => `${node.nature} role=${node.pattern.role}`).join(" · "));
const worn = (role) => steer.trie.sieve(flat, (pattern) => pattern.role === undefined || pattern.role === role);
print("actor", await shape.primer.load(worn("actor"), {}));
print("director", await shape.primer.load(worn("director"), {}));
