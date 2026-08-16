import { object } from "@vivalence/typology";
import { buffer } from "./buffer.js";

const PARADIGM_COUNT = 2;

export const conjugations = (ctx) =>
  buffer(ctx, {
    set: [
      {
        pick: "feed",
        where: object.merge(ctx.input.where ?? {}, {
          ontology: "conjugation",
          ...(ctx.input.symbols?.length ? { symbols: ctx.input.symbols } : {}),
        }),
        limit: ctx.input.count ?? PARADIGM_COUNT,
      },
    ],
    data: { recall: ctx.input.recall ?? "LEARNING", gameplay: ctx.input.gameplay ?? "CONJUGATE" },
  });
