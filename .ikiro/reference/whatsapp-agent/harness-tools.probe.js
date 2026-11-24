import { Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";
import paladin from "@vivalence/paladin";

const companion = new Vector()
  .graft(gestalten.tools.thread);

const operator = new Vector()
  .graft(gestalten.tools.thread, gestalten.tools.entity, gestalten.tools.buffer)
  .graft(gestalten.tools.modes, gestalten.tools.tool)
  .graft(paladin.tools.fs, paladin.tools.shell);

const natures = (vector, prefix = "") =>
  [...vector.trie].flatMap(([pattern, next]) => {
    const here = `${prefix}${pattern.nature ?? pattern}`;
    return [...(next.effect ? [here] : []), ...natures(next, here)];
  });
console.log(JSON.stringify({ companion: natures(companion), operator: natures(operator) }));
