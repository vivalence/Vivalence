import { assess, weightedPick, weakest, shuffle } from "./tools.js";
// ── regular conjugations by ending ─────────────────────────────────
// -ar/-er/-ir regular patterns. weighted selection toward weakest class.

export default async (ctx) => {
  const classes = new Map();
  for (const suffix of ["ar", "er", "ir"]) {
    const data = await ctx.survey("conjugation", [`word.suffix.${suffix}`, "word.regularity.regular"]);
    if (data.length) classes.set(suffix, data);
  }
  if (!classes.size) return;

  const [suffix, data] = weightedPick(
    [...classes.entries()],
    ([, d]) => 1 - assess(d).avgStrength,
  );

  const { phase } = assess(data);
  const unseen = data.filter((d) => d.forms.some((f) => !f.memory));
  const all = [...classes.values()].flat();

  if (phase === "FAMILIARIZE") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 1), title: `-${suffix} verbs`, subtitle: "Same class, same endings" }));
    } else {
      ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(data).slice(0, 1), phase }));
    }
  } else if (phase === "EXPAND") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 1), title: `-${suffix} verbs` }));
    } else {
      const weak = data.filter((d) => d.forms.some((f) => f.memory && f.memory.strength < 0.3));
      if (weak.length) {
        ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weak).slice(0, 1) }));
      }
    }
  } else {
    const bottom = weakest(data.flatMap((d) => d.forms), 4);
    if (bottom.length) {
      const weakParadigms = data.filter((d) => d.forms.some((f) => bottom.includes(f))).slice(0, 1);
      ctx.pool.add(ctx.mode.emit.hunt({ items: weakParadigms, distractors: all }));
    } else {
      ctx.pool.add(ctx.mode.emit.hunt({ items: shuffle(data).slice(0, 1), distractors: all }));
    }
  }
};
