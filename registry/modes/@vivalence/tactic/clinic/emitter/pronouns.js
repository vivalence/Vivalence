import { analysis } from "./shards/analysis.js";
import { routine } from "./shards/routine.js";

// ── pronouns ───────────────────────────────────────────────────────
// grouped by type: personal → demonstrative → interrogative → ...
// weighted selection toward weakest group.

export default async (ctx) => {
  const study = analysis(ctx);
  const teach = routine(ctx);

  const groups = new Map();
  for (const type of ["personal", "demonstrative", "interrogative", "indefinite"]) {
    const items = await study.find("word", {
      where: { symbols: ["word.part-of-speech.pronoun", `word.pronoun-type.${type}`] },
      populate: ["memories", "symbols"],
    });
    if (items.length) groups.set(type, items);
  }
  const reflexive = await study.find("word", {
    where: { symbols: ["word.part-of-speech.pronoun", "word.reflexive.yes"] },
    populate: ["memories", "symbols"],
  });
  if (reflexive.length) groups.set("reflexive", reflexive);
  if (!groups.size) return;

  const [type, data] = study.weightedPick(
    [...groups.entries()],
    ([, items]) => 1 - study.assess(items).avgStrength,
  );

  const all = [...groups.values()].flat();
  const unseen = data.filter((word) => !word.memory);
  const label = `${type[0].toUpperCase() + type.slice(1)} pronouns`;
  const phase = study.phase(data);

  if (phase === "FAMILIARIZE") {
    if (unseen.length) teach.familiarize(study.shuffle(unseen).slice(0, 4), { title: label });
    else await teach.produce(study.shuffle(study.weakest(data, 6)).slice(0, 3), { distractors: all, withContext: false });
  } else if (phase === "EXPAND") {
    if (unseen.length) teach.familiarize(study.shuffle(unseen).slice(0, 3), { title: label });
    else await teach.reinforce(study.shuffle(study.weakest(data, 6)).slice(0, 3));
  } else {
    const bottom = study.weakest(all, 4);
    teach.stress(bottom.length ? bottom : study.shuffle(all).slice(0, 3), { distractors: all });
  }
};

// ── previous implementation — kept per code-history convention ─────
// import { assess, weightedPick, weakest, shuffle } from "./tools.js";
//
// export default async (ctx) => {
//   const types = ["personal", "demonstrative", "interrogative", "indefinite"];
//   const groups = new Map();
//   for (const type of types) {
//     const data = await ctx.survey("word", ["word.part-of-speech.pronoun", `word.pronoun-type.${type}`]);
//     if (data.length) groups.set(type, data);
//   }
//   const reflexive = await ctx.survey("word", ["word.part-of-speech.pronoun", "word.reflexive.yes"]);
//   if (reflexive.length) groups.set("reflexive", reflexive);
//   if (!groups.size) return;
//
//   const [type, data] = weightedPick(
//     [...groups.entries()],
//     ([, d]) => 1 - assess(d).avgStrength,
//   );
//
//   const all = [...groups.values()].flat();
//   const { phase } = assess(data);
//   const unseen = data.filter((f) => !f.memory);
//   const label = `${type.charAt(0).toUpperCase() + type.slice(1)} pronouns`;
//
//   if (phase === "FAMILIARIZE") {
//     if (unseen.length) {
//       ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 4), title: label }));
//     } else {
//       ctx.pool.add(ctx.mode.emit.drill({ items: shuffle(weakest(data, 6)).slice(0, 3), distractors: all, phase }));
//     }
//   } else if (phase === "EXPAND") {
//     if (unseen.length) {
//       ctx.pool.add(ctx.mode.emit.introduce({ items: shuffle(unseen).slice(0, 3), title: label }));
//     } else {
//       ctx.pool.add(ctx.mode.emit.reinforce({ items: shuffle(weakest(data, 6)).slice(0, 3) }));
//     }
//   } else {
//     const bottom = weakest(all, 4);
//     ctx.pool.add(ctx.mode.emit.hunt({ items: bottom.length ? bottom : shuffle(all).slice(0, 3), distractors: all }));
//   }
// };
