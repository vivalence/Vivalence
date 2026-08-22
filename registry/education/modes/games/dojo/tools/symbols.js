import { v, Vector } from "@vivalence/typology";
import * as types from "../types.js";
import { catalog } from "../aperture/index.js";

export const symbols = new Vector().open(
  {
    nature: "/symbols",
    valence: "Search the symbol catalog — the one-call answer to category questions: which " +
      "symbol groups the contractions, what domains exist, how many literals carry a tag. " +
      "Each line is slug · name · literal count, strongest first; use the slugs to scope " +
      'any set, where or provision. Example: { search: "preposition" }.',
    input: v.object({
      search: v
        .string()
        .desc("Matched against the symbol slug and its LABELED name, contains.")
        .optional(),
      traits: v
        .array(v.enum(types.SYMBOL_TRAITS))
        .desc("Symbol kinds that qualify — the symbol repository's traits.$overlap.")
        .optional(),
      limit: v.integer({ minimum: 1 }).default(30),
    }),
  },
  async (ctx) => {
    const rows = await catalog(ctx.daemon, ctx.input);
    return {
      message: rows.length
        ? rows
          .map((row) =>
            [row.slug, row.name, `${row.literals} literal${row.literals === 1 ? "" : "s"}`]
              .filter(Boolean)
              .join(" · ")
          )
          .join("\n")
        : "no symbols match these filters.",
    };
  },
);
