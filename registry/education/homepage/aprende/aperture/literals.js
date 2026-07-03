import { Vector, v } from "@vivalence/typology";

// the literals at the intersection of a symbol set — every literal carrying ALL
// of the given symbols. `$all` (LiteralRepository.resolveSymbols) is the AND.
const LITERAL = v.object({
  slug: v.string(),
  known: v.string(),
  learning: v.string(),
  symbols: v.array(v.string()),
});

export const literals = new Vector().open(
  {
    nature: "/assistant/wakeup/literals",
    input: v.object({ symbols: v.array(v.string()).default([]) }),
    output: v.object({
      symbols: v.array(v.string()),
      count: v.integer(),
      literals: v.array(LITERAL),
    }),
  },
  async (ctx) => {
    const found = await ctx.daemon.entities.literal.find(
      { symbols: { $all: ctx.input.symbols } },
      { populate: ["symbols"] },
    );
    return {
      symbols: ctx.input.symbols,
      count: found.length,
      literals: found.map((literal) => ({
        slug: literal.slug,
        known: literal.trait?.TRANSLATED?.known ?? "",
        learning: literal.trait?.TRANSLATED?.learning ?? "",
        symbols: literal.symbols.getItems().map((symbol) => symbol.slug),
      })),
    };
  },
);
