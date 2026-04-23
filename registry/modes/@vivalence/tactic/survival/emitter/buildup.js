const themes = [
  { route: "pronouns", symbols: ["word.pronoun-type.personal"],      label: "Personal pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.demonstrative"], label: "Demonstrative pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.interrogative"], label: "Interrogative pronouns" },
  { route: "pronouns", symbols: ["word.pronoun-type.indefinite"],    label: "Indefinite pronouns" },
  { route: "pronouns", symbols: ["word.reflexive.yes"],              label: "Reflexive pronouns" },
  { route: "adverbs",  symbols: ["functional.time"],                 label: "Time adverbs" },
  { route: "adverbs",  symbols: ["functional.degree"],               label: "Degree adverbs" },
  { route: "adverbs",  symbols: ["functional.discourse"],            label: "Discourse adverbs" },
  { route: "degrees",  symbols: ["word.degree.comparative"],         label: "Comparatives" },
  { route: "degrees",  symbols: ["word.degree.superlative"],         label: "Superlatives" },
];

const assess = (words) => {
  const total = words.length;
  const virgin = words.filter((word) => !word.memory || word.memory.is.virgin).length;
  const weak = words.filter((word) => word.memory?.is.weak).length;
  const failed = words.filter((word) => word.memory?.is.failed).length;
  const strong = words.filter((word) => word.memory?.is.strong).length;
  const avgStrength = total
    ? words.reduce((sum, word) => sum + (word.memory?.strength ?? 0), 0) / total
    : 0;
  return { total, virgin, weak, failed, strong, avgStrength };
};

const weakness = ({ avgStrength, virgin, failed, strong, total }) =>
  total * ((1 - avgStrength) + failed / total + virgin / total - strong / total);

export default async (ctx) => {
  const all = await ctx.daemon.entities.literal.find(
    {
      ...ctx.input.where,
      ontology: "word",
      symbols: [...(ctx.input.where?.symbols ?? [])],
    },
    { populate: ["memories", "symbols"] },
  );
  if (!all.length) return;

  const ranked = themes
    .map((theme) => ({
      ...theme,
      words: all.filter((word) =>
        theme.symbols.every((needed) =>
          word.symbols.getItems().some((symbol) => symbol.slug === needed),
        ),
      ),
    }))
    .filter((bucket) => bucket.words.length)
    .map((bucket) => {
      const assessment = assess(bucket.words);
      return { ...bucket, assessment, weakness: weakness(assessment) };
    })
    .sort((a, b) => (b.weakness - a.weakness) || (Math.random() - 0.5));

  const buckets = ranked.slice(0, 3);

  console.log(`[buildup] ranked ${ranked.length} themes from ${all.length} words`);
  for (const bucket of ranked) {
    const { total, virgin, weak, failed, strong, avgStrength } = bucket.assessment;
    const chosen = buckets.includes(bucket) ? "✓" : " ";
    console.log(
      `[buildup] ${chosen} ${bucket.weakness.toFixed(2).padStart(7)}  ${bucket.label.padEnd(24)} ` +
      `n=${total} virgin=${virgin} weak=${weak} failed=${failed} strong=${strong} avgS=${avgStrength.toFixed(2)}`,
    );
  }

  for (const theme of buckets) {
    const target = ctx.daemon.modes.tactic.clinic.emit[theme.route];
    ctx.pool.add(
      target({
        ...ctx.input,
        where: {
          ...ctx.input.where,
          symbols: [...(ctx.input.where?.symbols ?? []), ...theme.symbols],
        },
      }),
    );
  }
};
