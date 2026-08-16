import { array, object } from "@vivalence/typology";

export default async (ctx) => {
  const game = ctx.daemon.modes.game;
  const baseWhere = object.omit(ctx.input.where ?? {}, ["ontology"]);
  const blacklist = ctx.input.blacklist;

  const conjugationLimit = ctx.input.conjugations ?? 1;
  const verbLimit = ctx.input.verbs ?? 2;
  const errorLimit = ctx.input.errors ?? 3;

  const conjugationWhere = { ...baseWhere, ontology: "conjugation" };
  const verbWhere = object.merge(baseWhere, {
    ontology: "word",
    symbols: ["word.part-of-speech.verb"],
  });

  const populate = ["uses", "symbols", "retentions"];
  const opts = (limit) => ({ limit, blacklist, populate });

  const [conjugations, conjugationErrors, verbs, verbErrors] = await Promise.all([
    ctx.daemon.entities.literal.feed(conjugationWhere, opts(conjugationLimit)),
    ctx.daemon.entities.literal.byLastSignal(
      ["MISTAKE", "FAILURE"],
      conjugationWhere,
      opts(errorLimit),
    ),
    ctx.daemon.entities.literal.feed(verbWhere, opts(verbLimit)),
    ctx.daemon.entities.literal.byLastSignal(["MISTAKE", "FAILURE"], verbWhere, opts(errorLimit)),
  ]);

  const dedupe = (items) => {
    const seen = new Set();
    return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
  };
  const allConjugations = dedupe([...conjugations, ...conjugationErrors]);
  const allVerbs = dedupe([...verbs, ...verbErrors]);

  if (!allConjugations.length && !allVerbs.length) return;

  const untouched = dedupe(
    [...allVerbs, ...allConjugations.flatMap((c) => c.uses.getItems())].filter(
      (word) => !word.retention || word.retention.is.virgin,
    ),
  );
  if (untouched.length) {
    ctx.pool.add(
      game.exhibit.emit.present({
        layout: "TABLE",
        title: "Unfamiliar verbs",
        literals: untouched,
      }),
    );
  }

  const practice = ctx.pool.section();

  for (const conjugation of allConjugations) {
    practice.add(
      game.paradigm.emit.conjugation({
        conjugation,
        recall: "LEARNING",
        feedback: "REALTIME",
        order: "ORDERED",
      }),
    );
  }

  for (const verb of allVerbs) {
    const isInfinitive = verb.symbols
      .getItems()
      .some((s) => s.slug === "word.verb-form.infinitive");
    if (isInfinitive || verb.retention?.is?.failed) {
      practice.add(game["dojo"].emit.write.literals({ literal: verb }));
    } else {
      practice.add(
        game["dojo"].emit.conjugations({ where: { uses: { $in: [verb.id] } }, count: 1 }),
      );
    }
  }

  practice.apply(array.shuffle);
};
