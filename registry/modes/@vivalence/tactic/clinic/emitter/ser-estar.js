import { assess, weakest, shuffle } from "./tools.js";
// ── ser vs estar ───────────────────────────────────────────────────
// contrastive: two ways to "be". permanent vs temporary.

export default async (ctx) => {
  const ser = await ctx.survey("conjugation", ["word.lemma.ser"]);
  const estar = await ctx.survey("conjugation", ["word.lemma.estar"]);
  if (!ser.length && !estar.length) return;

  const all = [...ser, ...estar];
  const { phase } = assess(all);

  if (phase === "FAMILIARIZE") {
    const serPick = ser.slice(0, 1);
    const estarPick = estar.slice(0, 1);
    if (serPick.length && estarPick.length) {
      ctx.pool.add(ctx.mode.emit.introduce({
        items: [...serPick, ...estarPick],
        title: "ser vs estar",
        subtitle: "Two ways to 'be'",
        layout: "CONTRASTIVE",
      }));
    } else {
      const unseen = all.filter((d) => d.forms.some((f) => !f.memory));
      ctx.pool.add(ctx.mode.emit.introduce({ items: (unseen.length ? unseen : all).slice(0, 1), title: "ser vs estar" }));
    }
  } else if (phase === "EXPAND") {
    const weak = all.filter((d) => d.forms.some((f) => f.memory && f.memory.strength < 0.3));
    ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weak.length ? weak : all).slice(0, 2), phase }));
  } else {
    const allForms = all.flatMap((d) => d.forms);
    const bottom = weakest(allForms, 4);
    if (bottom.length) {
      const weakParadigms = all.filter((d) => d.forms.some((f) => bottom.includes(f))).slice(0, 2);
      ctx.pool.add(ctx.mode.emit.hunt({ items: weakParadigms, distractors: all }));
    } else {
      ctx.pool.add(ctx.mode.emit.hunt({ items: shuffle(all).slice(0, 2), distractors: all }));
    }
  }
};
