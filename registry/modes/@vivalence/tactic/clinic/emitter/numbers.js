import { assess, weakest, shuffle } from "./tools.js";
// ── numbers ────────────────────────────────────────────────────────

export default async (ctx) => {
  const all = await ctx.survey("word", ["functional.number"]);
  if (!all.length) return;

  const { phase } = assess(all);
  const unseen = all.filter((f) => !f.memory);

  if (phase === "FAMILIARIZE") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 3), title: "Numbers" }));
    } else {
      ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weakest(all, 6)).slice(0, 3), distractors: all, phase }));
    }
  } else if (phase === "EXPAND") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 2), title: "More numbers" }));
    } else {
      ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weakest(all, 6)).slice(0, 3) }));
    }
  } else {
    const bottom = weakest(all, 4);
    ctx.pool.add(ctx.mode.emit.hunt({ items: bottom.length ? bottom : shuffle(all).slice(0, 3), distractors: all }));
  }
};
