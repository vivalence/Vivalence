const themes = [
  { route: "pronouns", symbols: ["word.pronoun-type.personal"], label: "Personal pronouns" },
  {
    route: "pronouns",
    symbols: ["word.pronoun-type.demonstrative"],
    label: "Demonstrative pronouns",
  },
  {
    route: "pronouns",
    symbols: ["word.pronoun-type.interrogative"],
    label: "Interrogative pronouns",
  },
  { route: "pronouns", symbols: ["word.pronoun-type.indefinite"], label: "Indefinite pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.total"], label: "Total pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.article"], label: "Article pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.relative"], label: "Relative pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.negative"], label: "Negative pronouns" },
  { route: "pronouns", symbols: ["word.reflexive.yes"], label: "Reflexive pronouns" },
  { route: "determiners", symbols: ["word.part-of-speech.determiner"], label: "Determiners" },
  { route: "adverbs", symbols: ["functional.time"], label: "Time adverbs" },
  { route: "adverbs", symbols: ["functional.degree"], label: "Degree adverbs" },
  { route: "adverbs", symbols: ["functional.discourse"], label: "Discourse adverbs" },
  { route: "adverbs", symbols: ["functional.intensifier"], label: "Intensifier adverbs" },
  { route: "degrees", symbols: ["word.degree.comparative"], label: "Comparatives" },
  { route: "degrees", symbols: ["word.degree.superlative"], label: "Superlatives" },
  { route: "degrees", symbols: ["word.degree.absolute"], label: "Absolute degree" },
  { route: "numbers", symbols: ["word.numeral-type.cardinal"], label: "Cardinal numerals" },
  { route: "numbers", symbols: ["word.numeral-type.ordinal"], label: "Ordinal numerals" },
  { route: "prepositions", symbols: ["word.part-of-speech.adposition"], label: "Prepositions" },
  // {
  //   route: "connectors",
  //   symbols: ["word.part-of-speech.coordinating-conjunction"],
  //   label: "Coordinating conjunctions",
  // },
  // {
  //   route: "connectors",
  //   symbols: ["word.part-of-speech.subordinating-conjunction"],
  //   label: "Subordinating conjunctions",
  // },
  // { route: "connectors", symbols: ["functional.connector"], label: "Connectors" },
  // { route: "negation", symbols: ["functional.negation"], label: "Negation" },
  // { route: "questions", symbols: ["functional.question"], label: "Question words" },
];

const assess = (words) => {
  const total = words.length;
  const virgin = words.filter((word) => !word.retention || word.retention.is.virgin).length;
  const weak = words.filter((word) => word.retention?.is.weak).length;
  const failed = words.filter((word) => word.retention?.is.failed).length;
  const strong = words.filter((word) => word.retention?.is.strong).length;
  const withRetention = words.filter((word) => word.retention).length;
  const avgStrength = total
    ? words.reduce((sum, word) => sum + (word.retention?.strength ?? 0), 0) / total
    : 0;
  return { total, virgin, weak, failed, strong, withRetention, avgStrength };
};

const weakness = ({ avgStrength, virgin, failed, strong, total }) =>
  total * (1 - avgStrength + failed / total + virgin / total - strong / total);

export default async (ctx) => {
  // console.log(`[buildup] input.where=${JSON.stringify(ctx.input.where ?? {})}`);

  const all = await ctx.daemon.entities.literal.find(
    {
      ...ctx.input.where,
      ontology: "word",
      symbols: [...(ctx.input.where?.symbols ?? [])],
    },
    { populate: ["retentions", "retentions.strength", "symbols"] },
  );
  if (!all.length) {
    // console.log(`[buildup] empty pool — abort`);
    return;
  }

  const totalWords = await ctx.daemon.entities.literal.count({ ontology: "word" });
  const retentionsLoaded = all.filter((word) => word.retention).length;
  const strengthSample = all.find((word) => word.retention)?.retention?.strength;
  // console.log(`[buildup] pool=${all.length} of ${totalWords} ontology=word; with-retention=${retentionsLoaded}; sample-strength=${strengthSample}`);

  const ranked = themes
    .map((theme) => {
      const words = all.filter((word) =>
        theme.symbols.every((needed) =>
          word.symbols.getItems().some((symbol) => symbol.slug === needed),
        ),
      );
      return { ...theme, words };
    })
    .map((bucket) => {
      const assessment = assess(bucket.words);
      return { ...bucket, assessment, weakness: weakness(assessment) };
    })
    .sort((a, b) => b.weakness - a.weakness || Math.random() - 0.5);

  const present = ranked.filter((bucket) => bucket.words.length);
  const missing = ranked.filter((bucket) => !bucket.words.length);

  const totalTopWeakness = present.slice(0, 5).reduce((sum, b) => sum + b.weakness, 0);
  const dice = Math.random() * totalTopWeakness;
  let cursor = 0;
  const picked =
    present.slice(0, 5).find((bucket) => (cursor += bucket.weakness) >= dice) ?? present[0];

  // console.log(`[buildup] themes present=${present.length} missing=${missing.length} from ${all.length} words`); if (missing.length) {console.log(`[buildup] missing themes (n=0 in pool): ${missing.map((b) => `${b.label}[${b.symbols.join(",")}]`).join(" | ")}`);}
  // for (const bucket of present) {const { total, virgin, weak, failed, strong, withRetention, avgStrength } = bucket.assessment; const chosen = bucket === picked ? "✓" : " "; console.log(`[buildup] ${chosen} ${bucket.weakness.toFixed(2).padStart(7)}  ${bucket.label.padEnd(24)} ` + `n=${total} eng=${withRetention} virgin=${virgin} weak=${weak} failed=${failed} strong=${strong} avgS=${avgStrength.toFixed(3)}`,);}
  const wordWeakness = (word) => {
    if (!word.retention) return 2;
    const strength = word.retention.strength ?? 0;
    const failedBoost = word.retention.is.failed ? 1 : 0;
    const virginBoost = word.retention.is.virgin ? 1 : 0;
    return 1 - strength + failedBoost + virginBoost;
  };

  const limit = 12;
  const focus = [...picked.words].sort((a, b) => wordWeakness(b) - wordWeakness(a)).slice(0, limit);

  const distractors = picked.words;
  const game = ctx.daemon.modes.game;

  // console.log(`[buildup] picked "${picked.label}" — focusing ${focus.length}/${picked.words.length}`);

  const virgins = focus.filter((word) => !word.retention || word.retention.is.virgin);
  if (virgins.length) {
    ctx.pool.add(
      game.exhibit.emit.present({
        layout: "TABLE",
        title: picked.label,
        literals: virgins,
      }),
    );
  }

  for (const word of focus) {
    if (!word.retention || word.retention.is.virgin) {
      ctx.pool.add(
        game.judge.emit.literal({
          literal: word,
          distractors,
          recall: "LEARNING",
          speed: { rate: "SLOW" },
        }),
      );
    } else if (word.retention.is.failed) {
      ctx.pool.add(
        game.judge.emit.literal({
          literal: word,
          distractors,
          recall: "LEARNING",
          speed: { rate: "FAST" },
        }),
      );
    } else if (word.retention.is.weak) {
      ctx.pool.add(game["rep-o-gram"].emit.write.literals({ literal: word, recall: "LEARNING" }));
    }
  }

  if (focus.length >= 4) {
    ctx.pool.add(
      game.match.emit.batch({
        literals: focus.slice(0, 6),
        gameplay: "TRANSLATE",
        recall: "LEARNING",
      }),
    );
  }
};
