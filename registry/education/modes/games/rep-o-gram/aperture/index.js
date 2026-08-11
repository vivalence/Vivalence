import { Vector, object, v } from "@vivalence/typology";
import * as hal from "../hal/index.js";
import * as types from "../types.js";
import * as fold from "../fold.js";
import { draw } from "../emitter/feed.js";

const JUDGE_INPUT = v.object({
  typed: v.string().desc("What the learner wrote."),
  knowable: types.knowable.desc("The knowable being judged — carries both faces, its tokens and its literal."),
  recall: v.enum(["KNOWN", "LEARNING"]).desc("Which face the learner had to produce."),
});

const DRAW_INPUT = v.object({
  where: types.where,
  symbols: types.scope.optional(),
  count: types.count,
  prompt: types.prompt.optional(),
});

const PROVISION_INPUT = v.object({
  text: v.string().desc("Freeform provisioning request — axes, symbol scope, authored knowables."),
});

const review = async (ctx, identifier, grade) => {
  if (!identifier || !grade) return;
  const literal = await ctx.daemon.entities.literal.findOne(identifier);
  if (!literal) return;
  return literal.review(grade, ctx);
};

export const aperture = new Vector()
  .open({ nature: "/draw", input: DRAW_INPUT }, async (ctx) => {
    if (ctx.input.symbols?.length)
      ctx.input.where = object.merge(ctx.input.where, { symbols: ctx.input.symbols });
    const set = await draw(ctx);
    return [...set.literals.map(fold.fromLiteral), ...set.knowables];
  })

  .open({ nature: "/symbols" }, async (ctx) => {
    const rows = await ctx.daemon.entities.em
      .getConnection()
      .execute(
        "SELECT s.slug AS slug, count(sl.literal_entity_id) AS literals FROM Symbol s LEFT JOIN symbol_literals sl ON sl.symbol_entity_id = s.id GROUP BY s.id ORDER BY s.slug",
      );
    return rows;
  })

  .open({ nature: "/provision", input: PROVISION_INPUT }, async (ctx) => {
    const language = ctx.daemon.statics.language;
    const symbols = await ctx.daemon.entities.symbol.find({});

    const render = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "balanced" },
      system: { identity: hal.provision.identity(language) },
      turns: [
        {
          role: "user",
          parts: [
            {
              type: "text",
              text: hal.provision.request(
                symbols.map((symbol) => symbol.slug),
                ctx.input.text,
              ),
            },
          ],
        },
      ],
      output: { schema: hal.provision.output },
    });

    return render.output.object;
  })

  .open({ nature: "/judge", input: JUDGE_INPUT }, async (ctx) => {
    const language = ctx.daemon.statics.language;
    const knowable = ctx.input.knowable;
    const tokens = knowable.tokens ?? [];

    const render = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "balanced" },
      system: {
        rubric: hal.judge.rubric(language, {
          typed: ctx.input.typed,
          known: knowable.known,
          learning: knowable.learning,
          recall: ctx.input.recall,
          tokens,
        }),
      },
      turns: [],
      output: { schema: hal.judge.output },
    });

    const evaluation = render.output.object;
    const graded = tokens.map((token, index) => ({
      ...token,
      ...(evaluation?.tokens?.find((entry) => entry.index === index) ?? {
        grade: evaluation?.overall?.grade,
      }),
    }));

    await Promise.all([
      review(ctx, knowable.literal, evaluation?.overall?.grade),
      ...graded.map((token) => review(ctx, token.literal, token.grade)),
    ]);

    await ctx.daemon.entities.em.flush();

    return { overall: evaluation?.overall, tokens: graded };
  });
