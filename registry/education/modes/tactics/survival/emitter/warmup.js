import { array, random } from "@vivalence/typology";
// ── warmup ──────────────────────────────────────────────────────────
// activate what you know. build confidence. no typing.
// three sources: near-due successes, due now, weak by strength.
// 4 each, 12 total, deduped and shuffled.

export default async (ctx) => {
  // console.log({ input: ctx.input });
  const horizon = new Date(Date.now() + (ctx.input.horizon ?? 48) * 60 * 60 * 1000);

  const seen = new Set();
  const collect = (items) => {
    const added = [];
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      added.push(item);
    }
    return added;
  };

  const failures = collect(
    await ctx.daemon.entities.literal.byLastSignal(
      ["MISTAKE", "FAILURE", "NEUTRAL"],
      { ...ctx.input.where, retentions: { nextAt: { $lt: horizon } } },
      { limit: 4, blacklist: ctx.input.blacklist },
    ),
  );

  const due = collect(
    await ctx.daemon.entities.literal.feed(ctx.input.where, {
      limit: 4,
      blacklist: ctx.input.blacklist,
    }),
  );

  const weak = collect(
    await ctx.daemon.entities.literal.byStrength(
      { ...ctx.input.where, retentions: { strength: { $gte: 0.1, $lte: 0.5 } } },
      { limit: 4, blacklist: ctx.input.blacklist },
    ),
  );
  const words = array.shuffle([...failures, ...due, ...weak]);

  if (!words.length) return;

  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  const untouched = words.filter((word) => !word.retention || word.retention.is.virgin);
  if (untouched.length) {
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "TABLE",
        title: "New words",
        literals: untouched,
      }),
    );
  }

  const practice = ctx.pool.section();

  for (const word of words) {
    const vocalized = word.traits?.includes("VOCALIZED");

    if (!word.retention || word.retention.is.virgin) {
      // practice.add(ctx.daemon.modes.game.exhibit.emit.present({ literals: [word] }));
      practice.add(
        ctx.daemon.modes.game.judge.emit.literal({
          literal: word,
          distractors,
          speed: { rate: "SLOW" },
        }),
      );
    } else if (vocalized && random.coinflip(0.7)) {
      practice.add(
        ctx.daemon.modes.game["dojo"].emit.listen.literal({
          literal: word,
          distractors,
          gameplay: "TYPE",
          recall: "KNOWN",
        }),
      );
    } else {
      practice.add(ctx.daemon.modes.game["dojo"].emit.write.literals({ literal: word }));
    }
  }

  practice.apply(array.shuffle);

  // ctx.pool
  //   .section(
  //     ...words
  //       // .filter((l) => !l.retention?.is.virgin)
  //       // .filter((word) => !word.traits?.includes("VOCALIZED"))
  //       .map((literal) =>
  //         ctx.daemon.modes.game.flashcard.emit.literals({
  //           recall: !literal.retention?.is.succeeded ? "KNOWN" : "LEARNING",
  //           literal,
  //         }),
  //       ),

  //     ...words
  //       .filter((l) => l.retention?.is.virgin)
  //       .map((literal) =>
  //         ctx.daemon.modes.game.judge.emit.literal({
  //           literal,
  //           distractors,
  //           speed: { rate: "SLOW" },
  //         }),
  //       ),
  //     ...words
  //       .filter((word) => word.traits?.includes("VOCALIZED"))
  //       .map((literal) =>
  //         ctx.daemon.modes.game.listen.emit.literal({
  //           literal,
  //           distractors,
  //           // gameplay: "TYPE",
  //           gameplay: !literal.retention?.is.succeeded ? "PICK" : "TYPE",
  //           recall: "KNOWN",
  //         }),
  //       ),
  //   )
  //   .apply(array.shuffle);
};
