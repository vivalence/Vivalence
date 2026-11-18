import { Path, shape, steer } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const here = import.meta.dirname;
const print = (label, system) => console.log(label, JSON.stringify(system, null, 2));

const CONVERSATIONAL = { actor: { primed: ["/identity", "/voice"] } };
console.log("C · the trait names the actor's sections", JSON.stringify(CONVERSATIONAL));

const flat = await paladin.prime.directory(new Path(`${here}/primerC`));
console.log(shape.primer.nodes(flat).map((node) => `${node.nature} keys=${Object.keys(node.pattern).join(",")}`).join(" · "));
const named = steer.trie.sieve(flat, (pattern) => CONVERSATIONAL.actor.primed.includes(`/${pattern.nature}`));
print("actor", await shape.primer.load(named, {}));
print("director", await shape.primer.load(flat, {}));

const stale = { actor: { primed: ["/identity", "/voic"] } };
const missed = steer.trie.sieve(flat, (pattern) => stale.actor.primed.includes(`/${pattern.nature}`));
print("actor, one reference misspelled", await shape.primer.load(missed, {}));
