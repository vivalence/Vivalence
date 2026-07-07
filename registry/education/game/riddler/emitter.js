import { Vector, v } from "@vivalence/typology";
import * as hal from "./hal/index.js";

const CANDIDATE_POOL_MULTIPLIER = 3;

const EMITTER_RIDDLE_INPUT = v.object({
  symbols: v
    .array(v.rel(v.symbol()))
    .desc("Structural subjects the riddles are built on (weekday/month/… — slug|id|entity)."),
  instructions: v.string({
    default: "",
    description: "Optional freeform steering, appended verbatim.",
  }),
  numberOfRiddles: v.integer({
    minimum: 1,
    maximum: 5,
    default: 4,
    description: "How many riddle buffers to cast.",
  }),
  levelPoolSize: v.integer({
    minimum: 0,
    maximum: 60,
    default: 12,
    description: "How many of the learner's words to sample as the level indicator.",
  }),
});

export const emitter = new Vector().open(
  { nature: "/riddle/fromSymbols", input: EMITTER_RIDDLE_INPUT },
  async (ctx) => {
    const language = ctx.daemon.statics.language;
    const count = ctx.input.numberOfRiddles;
    console.log("emitter/riddle/fromSymbols {input}", { input: ctx.input, count, language });

    // const pool = await ctx.daemon.entities.literal.feed(
    const pool = await ctx.daemon.entities.literal.find(
      // { ontology: "word", symbols: ctx.input.symbols },
      { symbols: ctx.input.symbols },
      {
        // limit: count * CANDIDATE_POOL_MULTIPLIER,
        // populate: ["memories", "memories.strength", "symbols"],
      },
    );
    console.log("emitter/riddle/fromSymbols {pool}", { pool });
    if (!pool.length) return;

    const level = await ctx.daemon.entities.literal.sample(
      { ontology: "word" },
      {
        status: ["LEARNING", "KNOWN", "UNKNOWN"],
        limit: ctx.input.levelPoolSize,
        populate: ["memories", "memories.strength"],
      },
    );

    console.log("emitter/riddle/fromSymbols {level}", { level });
    const { object } = await ctx.daemon.cortex
      .hallucination({ tune: "capable" })
      .output.object(hal.emitter.output)
      .entities.turn.append(
        {
          role: "system",
          parts: [
            {
              type: "text",
              text: [
                hal.emitter.identity(language),
                hal.emitter.subject(pool),
                hal.emitter.ceiling(level),
              ].join("\n\n"),
            },
          ],
        },
        {
          role: "user",
          parts: [
            { type: "text", text: hal.emitter.compose(language, count, ctx.input.instructions) },
          ],
        },
      )
      .object.render();

    for (const cast of (object?.riddles ?? []).slice(0, count)) {
      const literals = pool.filter((literal) => cast.literals?.includes(literal.slug));

      ctx.pool.add(
        ctx.mode.app.buffer({
          data: {
            riddle: cast.riddle,
            answer: cast.answer,
            history: [
              {
                role: "system",
                parts: [
                  {
                    type: "text",
                    text: [
                      hal.assistant.identity(language),
                      hal.assistant.duel(language, cast),
                    ].join("\n\n"),
                  },
                ],
              },
            ],
          },
          symbols: ctx.input.symbols,
          literals,
        }),
      );
    }
  },
);
