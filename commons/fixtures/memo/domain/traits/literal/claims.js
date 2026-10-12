import { traits, v } from "@vivalence/typology";
import { card } from "../../card.js";

const sides = () => v.object({ known: v.string(), learning: v.string() });
const asset = () => v.object({ asset: v.object({ path: v.string() }) });

export const TRANSLATED = traits.define("TRANSLATED", {
  schematic: sides(),
  repository: {
    get card() {
      return { fields: ["id", "slug", "ontology", "traits", "trait"], populate: ["notes"], project: card };
    },
    search(query) {
      const like = `%${query.search}%`;
      return [
        { slug: { $like: like } },
        { trait: { TRANSLATED: { known: { $like: like } } } },
        { trait: { TRANSLATED: { learning: { $like: like } } } },
      ];
    },
  },
});

export const EXEMPLIFIED = traits.define("EXEMPLIFIED", { schematic: sides() });
export const RANKED = traits.define("RANKED", { schematic: v.object({ rank: v.integer({ minimum: 0 }) }) });
export const VOCALIZED = traits.define("VOCALIZED", { schematic: asset() });
export const DEPICTED = traits.define("DEPICTED", { schematic: asset() });
