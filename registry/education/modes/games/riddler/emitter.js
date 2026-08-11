import { Vector, v } from "@vivalence/typology";
import * as hal from "./hal/index.js";

const CANDIDATE_POOL_MULTIPLIER = 3;

const EMITTER_RIDDLE_INPUT = v.object({
  literals: v
    .array(v.rel(v.literal()))
    .optional()
    .desc("Explicit vocabulary the riddles draw on (slug|id|entity)."),
  symbols: v
    .array(v.rel(v.symbol()))
    .optional()
    .desc("Structural subjects the pool is drawn from (weekday/month/… — slug|id|entity)."),
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

    const scope = [];
    if (ctx.input.literals?.length) scope.push({ id: { $in: ctx.input.literals } });
    if (ctx.input.symbols?.length) scope.push({ symbols: { slug: { $in: ctx.input.symbols } } });
    const pool = scope.length
      ? await ctx.daemon.entities.literal.find(scope.length === 1 ? scope[0] : { $or: scope }, {})
      : [];
    console.log("emitter/riddle/fromSymbols {pool}", { pool });
    if (!pool.length) return;

    const level = await ctx.daemon.entities.literal.sample(
      { symbols: ["word"] },
      {
        status: ["LEARNING", "KNOWN", "UNKNOWN"],
        limit: ctx.input.levelPoolSize,
        populate: ["retentions", "retentions.strength"],
      },
    );

    console.log("emitter/riddle/fromSymbols {level}", { level });
    const { output } = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "capable" },
      system: {
        identity: hal.emitter.identity(language),
        subject: hal.emitter.subject(pool),
        ceiling: hal.emitter.ceiling(level),
      },
      turns: [
        {
          role: "user",
          parts: [
            { type: "text", text: hal.emitter.compose(language, count, ctx.input.instructions) },
          ],
        },
      ],
      output: { schema: hal.emitter.output },
    });

    for (const cast of (output.object?.riddles ?? []).slice(0, count)) {
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
          symbols: ctx.input.symbols ?? [],
          literals,
        }),
      );
    }
  },
);
