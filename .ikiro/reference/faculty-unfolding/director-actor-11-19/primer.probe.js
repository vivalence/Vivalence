import { Path, shape } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const directory = new Path("/Users/finn/.viva/registry/education/modes/teacher/francesca/primer");
const primer = await paladin.prime.directory(directory);
console.log("nodes", JSON.stringify(shape.primer.nodes(primer).map((node) => ({ nature: node.nature, load: node.load, valence: node.pattern.valence })), null, 2));
const system = await shape.primer.load(primer, {});
console.log("system", JSON.stringify(Object.fromEntries(Object.entries(system).map(([key, text]) => [key, `${String(text).length} chars`])), null, 2));
