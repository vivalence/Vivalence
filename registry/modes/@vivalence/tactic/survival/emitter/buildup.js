import { array } from "@vivalence/typology";
// ── buildup ─────────────────────────────────────────────────────────
// conjugation paradigms. structured introduction → active recall → drill.
//
// see       → exhibit the full table
// recognize → pick with paradigm-internal distractors
// connect   → match form ↔ translation
// build     → paradigm: fill the table yourself
// speed     → judge, slower for weak, faster for familiar
// produce   → conjugation cards: forms without the scaffold, weakest first

const PERSON_SLOTS = [
  "firstSingular",
  "secondSingular",
  "thirdSingular",
  "firstPlural",
  "secondPlural",
  "thirdPlural",
];

export default async (ctx) => {
  const lemmas = ctx.input.lemmas;
  if (!lemmas?.length) return [];

  const modes = ctx.daemon.modes.game;
  const buffers = [];

  // ── fetch paradigm ────────────────────────────────────────────────
  // pick the most frequent verb that still has room to grow.
  // averageRank ASC = most common first. limit 1 = focus on one verb.

  const conjugations = await ctx.daemon.entities.conjugation.find(
    { lemma: { slug: { $in: lemmas } } },
    {
      populate: ["lemma", "tense", "mood", "infinitive", ...PERSON_SLOTS],
      orderBy: { averageRank: "ASC" },
      limit: 1,
    },
  );
  if (!conjugations.length) return [];

  const conj = conjugations[0];
  const infinitive = conj.infinitive;
  const forms = PERSON_SLOTS.map((s) => conj[s]).filter(Boolean);
  if (!forms.length) return [];

  // ── also fetch these literals with memories populated ──────────────
  // the conjugation entity gives us structure but not memory state.
  // re-fetch the same literals so we know what's untouched/weak/strong.

  const formIds = forms.map((f) => f.id);
  const withMemory = await ctx.daemon.entities.literal.find(
    { id: { $in: formIds } },
    { populate: ["memories"] },
  );
  const byId = Object.fromEntries(withMemory.map((l) => [l.id, l]));

  const untouched = forms.filter((f) => {
    const m = byId[f.id]?.memory;
    return !m || m.status === "UNTOUCHED";
  });
  const weak = forms.filter((f) => {
    const s = byId[f.id]?.memory?.status;
    return s === "UNKNOWN" || s === "LEARNING";
  });
  const strong = forms.filter((f) => {
    const s = byId[f.id]?.memory?.status;
    return s === "KNOWN" || s === "GRADUATED";
  });

  const infinitiveText = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const tenseLabel = conj.tense?.trait?.LABELED?.name ?? "";
  const moodLabel = conj.mood?.trait?.LABELED?.name ?? "";
  const subtitle = [tenseLabel, moodLabel].filter(Boolean).join(" ");

  // ── 1. SEE — exhibit the full table ───────────────────────────────
  // always show the table so the learner sees the pattern.
  // title is the infinitive, subtitle is the tense/mood.

  buffers.push(
    await modes.exhibit.emit.present({
      layout: "table",
      title: infinitiveText,
      subtitle,
      literals: forms,
    }),
  );

  // ── 2. RECOGNIZE — pick with paradigm-internal distractors ────────
  // low-stakes recognition before production. the other forms of the
  // same verb are natural distractors. only untouched + weak.

  for (const lit of [...untouched, ...weak]) {
    const distractors = forms.filter((f) => f.id !== lit.id);
    if (distractors.length) {
      buffers.push(
        await modes.pick.emit.literal({
          literal: lit,
          distractors,
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── 3. CONNECT — match form ↔ translation ─────────────────────────
  // link forms to meanings before timed pressure.

  if (forms.length >= 2) {
    buffers.push(
      await modes.match.emit.batch({
        literals: forms,
        gameplay: "translate",
        recall: "LEARNING",
      }),
    );
  }

  // ── 4. BUILD — paradigm: fill the table yourself ──────────────────
  // structured recall. the learner has seen, picked, matched.
  // now reconstruct the whole paradigm before timed pressure.

  buffers.push(
    await modes.paradigm.emit.conjugation({
      conjugation: conj,
      recall: "LEARNING",
      feedback: "realtime",
      order: "ordered",
    }),
  );

  // ── 5. SPEED — judge, paced by familiarity ────────────────────────
  // untouched/weak get NORMAL speed (more thinking time).
  // strong forms get FAST (building automaticity).

  for (const lit of forms) {
    const isWeak = untouched.includes(lit) || weak.includes(lit);
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        distractors: forms.filter((f) => f.id !== lit.id),
        speed: { rate: isWeak ? "NORMAL" : "FAST" },
      }),
    );
  }

  // ── 6. PRODUCE — conjugation cards, weakest first ─────────────────
  // individual form production without the table scaffold.
  // untouched → weak → strong: hardest forms get the most reps.

  const drillOrder = [...untouched, ...weak, ...strong];
  for (const lit of drillOrder) {
    buffers.push(
      await modes.conjugation.emit.literal({
        literal: lit,
        infinitive,
        tense: conj.tense,
        mood: conj.mood,
        lemma: conj.lemma,
        recall: "LEARNING",
      }),
    );
  }

  return buffers;
};
