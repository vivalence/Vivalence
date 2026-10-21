import { v, Vector } from "@vivalence/typology";
import { SIGNAL } from "../domain/types.js";
import { deal, grade } from "./deal.js";
import { progress } from "./progress.js";

export const aperture = new Vector()
  .open(
    {
      nature: "/deck",
      valence: "the cards to review now — due first, then untouched by rank; suspended ones never. Example: { limit: 10, symbols: ['topic.bellum'] }",
      input: v.object({
        limit: v.integer({ minimum: 1, maximum: 50 }).desc("How many cards. Example: 10"),
        symbols: v.array(v.string()).desc("Symbol slugs every card must carry. Example: ['topic.bellum']").optional(),
      }),
    },
    async (ctx) => ({ language: ctx.statics.language, cards: await deal(ctx, ctx.input) }),
  )
  .open(
    {
      nature: "/grade",
      valence: "grade the card just answered; its SM-2 schedule evolves and the grade is traced. Example: { card: 'amor.noun', signal: 'GOOD' }",
      input: v.object({
        card: v.string().desc("The card's slug. Example: amor.noun"),
        signal: v.enum(SIGNAL).desc("AGAIN · HARD · GOOD · EASY. Example: GOOD"),
        thread: v.string().desc("The thread the grade was given on. Example: th3").optional(),
      }),
    },
    (ctx) => grade(ctx, ctx.input),
  )
  .open({ nature: "/stats", valence: "the learner report. Example: {}", input: v.object({}) }, (ctx) => progress(ctx))
  .open(
    {
      nature: "/chat",
      valence: "one answer from the Magister on the caller's thread. Example: { prompt: 'what is due today?', thread: 'th3' }",
      input: v.object({
        prompt: v.string().desc("What the learner says. Example: what is due today?"),
        thread: v.string().desc("Binds the exchange to the caller's thread. Example: th3"),
      }),
      output: v.object({ answer: v.string() }),
    },
    async (ctx) => {
      const render = await ctx.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
        output: v.object({ answer: v.string().desc("The Magister's reply. Example: Salve! Seven cards are due.") }),
        thread: ctx.input.thread,
      });
      return { answer: render.object.answer };
    },
  );
