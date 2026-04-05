import { assess, weakest, shuffle } from "./tools.js";
// ── adverbs ────────────────────────────────────────────────────────
// grouped by subtype: time, degree, discourse. prefers time first.

export default async (ctx) => {
  const time = await ctx.survey("word", ["word.part-of-speech.adverb", "functional.time"]);
  const degree = await ctx.survey("word", ["word.part-of-speech.adverb", "functional.degree"]);
  const discourse = await ctx.survey("word", ["word.part-of-speech.adverb", "functional.discourse"]);

  const grouped = [time, degree, discourse].filter((g) => g.length);
  const all = grouped.length
    ? [...new Map(grouped.flat().map((f) => [f.id, f])).values()]
    : await ctx.survey("word", ["word.part-of-speech.adverb"]);

  if (!all.length) return;

  const { phase } = assess(all);
  const unseen = all.filter((f) => !f.memory);

  if (phase === "FAMILIARIZE") {
    const unseenTime = time.filter((f) => !f.memory);
    const source = unseenTime.length ? unseenTime : unseen;
    if (source.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(source).slice(0, 4), title: "Adverbs" }));
    } else {
      ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weakest(all, 6)).slice(0, 3), distractors: all, phase }));
    }
  } else if (phase === "EXPAND") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 3), title: "More adverbs" }));
    } else {
      ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weakest(all, 6)).slice(0, 3) }));
    }
  } else {
    const bottom = weakest(all, 4);
    ctx.pool.add(ctx.mode.emit.hunt({ items: bottom.length ? bottom : shuffle(all).slice(0, 3), distractors: all }));
  }
};
