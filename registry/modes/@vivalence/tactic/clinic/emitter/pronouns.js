import { assess, weightedPick, weakest, shuffle } from "./tools.js";
// ── pronouns ───────────────────────────────────────────────────────
// grouped by type: personal → demonstrative → interrogative → ...
// weighted selection toward weakest group.

export default async (ctx) => {
  const types = ["personal", "demonstrative", "interrogative", "indefinite"];
  const groups = new Map();
  for (const type of types) {
    const data = await ctx.survey("word", ["word.part-of-speech.pronoun", `word.pronoun-type.${type}`]);
    if (data.length) groups.set(type, data);
  }
  const reflexive = await ctx.survey("word", ["word.part-of-speech.pronoun", "word.reflexive.yes"]);
  if (reflexive.length) groups.set("reflexive", reflexive);
  if (!groups.size) return;

  const [type, data] = weightedPick(
    [...groups.entries()],
    ([, d]) => 1 - assess(d).avgStrength,
  );

  const all = [...groups.values()].flat();
  const { phase } = assess(data);
  const unseen = data.filter((f) => !f.memory);
  const label = `${type.charAt(0).toUpperCase() + type.slice(1)} pronouns`;

  if (phase === "FAMILIARIZE") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 4), title: label }));
    } else {
      ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weakest(data, 6)).slice(0, 3), distractors: all, phase }));
    }
  } else if (phase === "EXPAND") {
    if (unseen.length) {
      ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 3), title: label }));
    } else {
      ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weakest(data, 6)).slice(0, 3) }));
    }
  } else {
    const bottom = weakest(all, 4);
    ctx.pool.add(ctx.mode.emit.hunt({ items: bottom.length ? bottom : shuffle(all).slice(0, 3), distractors: all }));
  }
};
