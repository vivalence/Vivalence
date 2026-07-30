import { array, v, Vector } from "@vivalence/typology";

export const grammatica = new Vector().open(
  {
    nature: "/grammatica",
    input: v.object({
      where: v.object({}).optional(),
      limit: v.integer({ minimum: 1, maximum: 10 }).default(3),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game;

    const conjugations = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      {
        limit: ctx.input.limit,
        blacklist: ctx.input.blacklist,
        populate: ["uses", "symbols", "memories"],
      },
    );
    if (!conjugations.length) return;

    const forms = conjugations.flatMap((conjugation) =>
      conjugation.uses.getItems()
    );
    const untouched = forms.filter((form) =>
      !form.memory || form.memory.is.virgin
    );
    if (untouched.length) {
      ctx.pool.add(
        game.exhibit.emit.present({
          layout: "TABLE",
          title: "Verbi nuovi",
          literals: untouched,
        }),
      );
    }

    const practice = ctx.pool.section();

    for (const conjugation of conjugations) {
      practice.add(
        game.paradigm.emit.conjugation({
          conjugation,
          recall: "LEARNING",
          feedback: "REALTIME",
          order: "ORDERED",
        }),
      );
    }

    const failed = forms.filter((form) => form.memory?.is.failed);
    for (const form of failed) {
      practice.add(game.conjugation.emit.literal({ literal: form }));
    }

    practice.apply(array.shuffle);
  },
);
