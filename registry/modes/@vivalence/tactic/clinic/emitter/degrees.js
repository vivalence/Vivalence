import { assess, weakest, shuffle } from "./tools.js";
// ── adjective degrees ──────────────────────────────────────────────
// comparative, superlative, absolute. introduces base first, then expands.

export default async (ctx) => {
  const comparative = await ctx.survey("word", ["word.part-of-speech.adjective", "word.degree.comparative"]);
  const superlative = await ctx.survey("word", ["word.part-of-speech.adjective", "word.degree.superlative"]);
  const base = await ctx.survey("word", ["word.part-of-speech.adjective", "word.degree.absolute"]);

  const all = [...new Map([...base, ...comparative, ...superlative].map((f) => [f.id, f])).values()];
  if (!all.length) return;

  const { phase } = assess(all);
  const unseen = all.filter((f) => !f.memory);

  if (phase === "FAMILIARIZE") {
    const unseenBase = base.filter((f) => !f.memory);
    const source = unseenBase.length ? unseenBase : unseen;
    if (source.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(source).slice(0, 3), title: "Adjective degrees" }));
    } else {
      ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weakest(all, 6)).slice(0, 3), distractors: all, phase }));
    }
  } else if (phase === "EXPAND") {
    const unseenSuper = superlative.filter((f) => !f.memory);
    if (unseenSuper.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseenSuper).slice(0, 2), title: "Superlatives" }));
    } else if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 2), title: "More adjective degrees" }));
    } else {
      ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weakest(all, 6)).slice(0, 3) }));
    }
  } else {
    const bottom = weakest(all, 4);
    ctx.pool.add(ctx.mode.emit.hunt({ items: bottom.length ? bottom : shuffle(all).slice(0, 3), distractors: all }));
  }
};
