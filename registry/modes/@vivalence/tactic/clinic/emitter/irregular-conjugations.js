import { assess, weakest, shuffle } from "./tools.js";
// ── irregular conjugations ────────────────────────────────────────
// introduces irregular verbs. contrasts with known regulars in EXPAND phase.

export default async (ctx) => {
  const irregular = await ctx.survey("conjugation", ["word.regularity.irregular"]);
  if (!irregular.length) return;

  const { phase } = assess(irregular);
  const unseen = irregular.filter((d) => d.forms.some((f) => !f.memory));

  if (phase === "FAMILIARIZE") {
    const pick = shuffle(unseen.length ? unseen : irregular).slice(0, 1);
    ctx.pool.add(ctx.mode.emit.introduce({ items: pick, title: "Irregular verbs" }));
    ctx.pool.add(ctx.mode.emit.drill({ items: pick, phase }));

  } else if (phase === "EXPAND") {
    const regular = await ctx.survey("conjugation", ["word.regularity.regular"]);
    const knownRegular = regular.filter((d) => d.forms.some((f) => f.memory && f.memory.strength > 0.3)).slice(0, 1);
    const intro = shuffle(unseen).slice(0, 1);
    if (intro.length) {
      ctx.pool.add(ctx.mode.emit.introduce({
        items: knownRegular.length ? [...knownRegular, ...intro] : intro,
        title: "Regular vs Irregular",
        layout: "CONTRASTIVE",
      }));
      ctx.pool.add(ctx.mode.emit.drill({ items: intro, phase }));
    }
    const weakIrregular = irregular.filter((d) => d.forms.some((f) => f.memory && f.memory.strength < 0.3));
    if (weakIrregular.length) ctx.pool.add(ctx.mode.emit.reinforce({ items: weakIrregular.slice(0, 1) }));

  } else {
    const bottom = weakest(irregular.flatMap((d) => d.forms), 4);
    if (bottom.length) {
      const weakParadigms = irregular.filter((d) => d.forms.some((f) => bottom.includes(f))).slice(0, 1);
      ctx.pool.add(ctx.mode.emit.hunt({ items: weakParadigms, distractors: irregular }));
    } else {
      ctx.pool.add(ctx.mode.emit.hunt({ items: shuffle(irregular).slice(0, 1), distractors: irregular }));
    }
  }
};
