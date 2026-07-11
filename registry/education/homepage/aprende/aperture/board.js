import { Vector, v } from "@vivalence/typology";
import { STATUS } from "../types.js";

// the board — ONE optimized read backing the whole homepage dashboard. Every panel
// (status bar, strength×due scatter, weakest/strongest ranks) derives from this single
// array, so they can never disagree. One memory.find, literal + lazy strength populated.
const BOARD = v.array(
  v.object({
    slug: v.string(),
    en: v.string(), // known (english) — the gloss
    pt: v.string(), // learning (brazilian) — the headword
    ontology: v.enum(["word", "sentence", "conjugation"]),
    status: v.enum(STATUS),
    strength: v.number(), // 0..1, the lazy SQL formula
    nextDays: v.number(), // days until review (negative = overdue); 0 when never scheduled
    seen: v.boolean(), // status past UNTOUCHED → has been studied
  }),
);

export const board = new Vector().open(
  { nature: "/assistant/wakeup/board", input: v.object({}), output: BOARD },
  async (ctx) => {
    const DAY = 86_400_000;
    const now = Date.now();
    // one read: every memory for this user, with the literal + the lazy strength formula
    // populated so each row carries gloss + ontology + strength + due in a single pass.
    const memories = await ctx.daemon.entities.memory.find(
      {},
      { populate: ["strength", "literal"] },
    );
    return memories.map((memory) => {
      const literal = memory.literal;
      const translated = literal?.trait?.TRANSLATED ?? {};
      return {
        slug: literal?.slug ?? "",
        en: translated.known ?? "",
        pt: translated.learning ?? "",
        ontology: literal?.ontology || "word",
        status: memory.status,
        strength: memory.strength ?? 0,
        nextDays: memory.nextAt ? (memory.nextAt.getTime() - now) / DAY : 0,
        seen: memory.status !== "UNTOUCHED",
      };
    });
  },
);
