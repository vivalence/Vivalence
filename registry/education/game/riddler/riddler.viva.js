import { App, Vector, v } from "@vivalence/typology";
import { persona } from "./persona.js";

export const manifest = {
  type: "game",
  slug: "riddler",
  name: "Riddler",
  description:
    "Single-riddle challenges in the target language — weekdays, numbers, months, family.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EXPOSED", "EMITTER", "HARNESSED", "TOOLED"],
};

const SUBJECTS = {
  weekdays: "domain.weekday",
  months: "domain.month",
  // numbers: "functional.number",
  // family: "domain.family",
};

const language = (ctx) =>
  ctx.daemon?.statics?.language ?? { known: "English", learning: "the target language" };

export const app = new App(
  "buffer/Riddler.svelte",
  v.buffer({
    data: {
      subject: v.string(),
      riddle: v.string(),
      expected: v.string(),
      flow: v.array(v.unknown()).default([]),
      taunts: v.array(v.string()).default([]), // riddle-specific mockery, cast-generated
      hint: v.string().default(""), // the conspiratorial whisper, cast-generated
      history: v.array(v.unknown()).default([]),
      solved: v.boolean({ default: false }),
      resolved: v.boolean({ default: false }),
    },
    literals: v.array(v.rel(v.literal())),
  }),
);

// persona — runs on every harness branch (slurped into the runtime harness base)
export const harness = new Vector();
harness.use(async (ctx, next) => {
  ctx.hallucination.add(persona(language(ctx)));
  await next();
});

const HISTORY_THRESHOLD = 6;
const HISTORY_KEEP = 4;

// compact buffer.data.history in place, past the threshold — same bounded-growth idea
// as oracle/aprende's compaction, but riddler-native: the history it bounds is the
// existing per-riddle JSON array, not turns, and it dies with the buffer on
// /assistant/resolve same as it always has. No thread involvement.
async function compactHistory(ctx, history) {
  const stale = history.slice(0, -HISTORY_KEEP);
  const kept = history.slice(-HISTORY_KEEP);
  // mode.harness.object.render, same entry point riddler already uses for the judge
  // call — no scribe coupling on /object, so this doesn't touch turns at all.
  const render = await ctx.mode.harness.object.render({
    turns: [
      {
        role: "user",
        parts: [{ type: "text", text: `Summarize in 2-3 sentences: ${JSON.stringify(stale)}` }],
      },
    ],
    config: { schema: v.object({ summary: v.string() }) },
  });
  const summary = render.object?.summary ?? "";
  return [{ summary }, ...kept];
}

// /assistant — turn-free. The whole conversation is kept on the buffer (data.history),
// not in turns. The persona-driven hallucination renders a structured verdict object.
export const aperture = new Vector();

aperture.open(
  {
    nature: "/assistant/message",
    input: v.object({ buffer: v.string(), message: v.string() }),
    output: v.object({
      correct: v.boolean(),
      reply: v.string(),
      resolvable: v.boolean(),
      resolved: v.boolean(),
    }),
  },
  async (ctx) => {
    const buffer = await ctx.daemon.entities.buffer.findOne(
      { id: ctx.input.buffer },
      { populate: ["literals"] },
    );

    const context = [
      `Riddle: ${buffer.data.riddle}`,
      `Expected answer: ${buffer.data.expected}`,
      `Vocabulary in play: ${buffer.literals
        .getItems()
        .map((l) => `${l.slug} = ${l.trait?.TRANSLATED?.learning} (${l.trait?.TRANSLATED?.known})`)
        .join("; ")}`,
      `Predicted conversation flow (your pre-planned branches): ${JSON.stringify(buffer.data.flow)}`,
      buffer.data.taunts?.length
        ? `Pre-written taunts you may reuse or riff on for wrong answers: ${JSON.stringify(buffer.data.taunts)}`
        : null,
      buffer.data.hint ? `Pre-written hint (if they beg for one): ${buffer.data.hint}` : null,
      `Conversation so far: ${JSON.stringify(buffer.data.history)}`,
      `Judge the challenger's answer and reply in character.`,
    ]
      .filter(Boolean)
      .join("\n");

    const { object: verdict = {} } = await ctx.mode.harness.object.render({
      turns: [
        { role: "system", parts: [{ type: "text", text: context }] },
        { role: "user", parts: [{ type: "text", text: ctx.input.message }] },
      ],
      config: { schema: v.object({ correct: v.boolean(), reply: v.string() }) },
      tune: "frugal",
    });

    const solved = buffer.data.solved || verdict.correct;
    let history = [
      ...buffer.data.history,
      { user: ctx.input.message, correct: verdict.correct, reply: verdict.reply },
    ];
    if (history.length > HISTORY_THRESHOLD) history = await compactHistory(ctx, history);

    buffer.data = { ...buffer.data, history, solved };
    await ctx.daemon.entities.em.flush();

    // resolvable once solved; resolved only after an explicit /assistant/resolve.
    return {
      correct: verdict.correct,
      reply: verdict.reply,
      resolvable: solved && !buffer.data.resolved,
      resolved: buffer.data.resolved,
    };
  },
);

// finalize the riddle — sets resolved, closes the buffer (self-delete on completion).
aperture.open(
  {
    nature: "/assistant/resolve",
    input: v.object({ buffer: v.string() }),
    output: v.object({ resolved: v.boolean() }),
  },
  async (ctx) => {
    const buffer = await ctx.daemon.entities.buffer.findOne({ id: ctx.input.buffer });
    buffer.data = { ...buffer.data, resolved: true };
    buffer.status = "DONE";
    await ctx.daemon.entities.em.flush();
    await ctx.daemon.entities.buffer.removeOne({ id: ctx.input.buffer });
    return { resolved: true };
  },
);

// EMITTER — resolve a literal pool (passed directly OR pulled from a symbol set),
// ground it in each item's memory strength + the learner's recent trace, and let the
// cortex predict `riddles` riddles in ONE render — each with its own vocabulary
// subset, expected answer, and pre-planned conversation flow. One buffer per riddle.
const CAST = v.object({
  riddles: v.array(
    v.object({
      riddle: v.string(),
      expected: v.string(),
      flow: v.array(
        v.object({
          user: v.string(),
          kind: v.enum(["correct", "wrong", "clarify", "hint"]),
          reply: v.string(),
        }),
      ),
      taunts: v.array(v.string()).optional(), // 2-3 riddle-specific wrong-answer mockeries
      hint: v.string().optional(), // one whispered nudge toward the answer
      literals: v.array(v.string()),
    }),
  ),
});

export const emitter = new Vector().open(
  {
    nature: "/riddle/cast",
    input: v.object({
      riddles: v.integer({ minimum: 1, maximum: 5 }).default(1), // buffers to cast
      literals: v.array(v.string()).optional(), // literal ids — each riddle uses a subset
      symbols: v.array(v.string()).optional(), // symbol slugs — pull their literals
      subject: v.enum(Object.keys(SUBJECTS)).optional(), // sugar for a single symbol
      instructions: v.string().optional(), // freeform steering, always allowed
      limit: v.integer({ default: 12 }), // pool size per riddle when pulling
    }),
  },
  async (ctx) => {
    const count = ctx.input.riddles;
    const keys = Object.keys(SUBJECTS);
    const subject =
      ctx.input.subject ??
      (ctx.input.symbols || ctx.input.literals
        ? null
        : keys[Math.floor(Math.random() * keys.length)]);

    // pool — explicit literals win, else the symbol set (always with memory strength).
    // pulled pools scale with the riddle count so subsets don't have to overlap.
    let pool;
    if (ctx.input.literals?.length) {
      pool = await ctx.daemon.entities.literal.find(
        { id: { $in: ctx.input.literals } },
        { populate: ["memories", "memories.strength"] },
      );
    } else {
      const symbols = ctx.input.symbols ?? [SUBJECTS[subject]];
      pool = await ctx.daemon.entities.literal.feed(
        { symbols },
        { limit: ctx.input.limit * count, populate: ["memories", "memories.strength"] },
      );
    }
    if (!pool.length) return;

    // learner's last 25 exercises — recency + outcome, for difficulty tuning
    const userId = ctx.user?.id;
    const trace = userId
      ? await ctx.daemon.entities.trace.find(
          { user: userId },
          { orderBy: { createdAt: "DESC" }, limit: 25, populate: ["literal"] },
        )
      : [];

    const label = subject ?? ctx.input.symbols?.join(", ") ?? "the chosen words";

    const context = [
      count === 1
        ? `Compose ONE riddle in ${language(ctx).learning} about ${label}.`
        : `Compose ${count} DISTINCT riddles in ${language(ctx).learning} about ${label} — each built on a different vocabulary subset, no two riddles sharing an expected answer.`,
      ctx.input.instructions ? `Extra instructions: ${ctx.input.instructions}` : null,
      `Pick a SUBSET of this vocabulary per riddle (slug: learning (known) — strength/status):`,
      pool
        .map(
          (l) =>
            `${l.slug}: ${l.trait?.TRANSLATED?.learning} (${l.trait?.TRANSLATED?.known}) — ${l.memory?.strength ?? "new"}/${l.memory?.status ?? "UNTOUCHED"}`,
        )
        .join("; "),
      trace.length
        ? `Recent activity (newest first): ${trace.map((t) => `${t.literal?.slug ?? "?"}=${t.signal?.enum ?? "?"}`).join(", ")}`
        : null,
      `Favor weaker or less-recently-seen items.`,
      `Predict the WHOLE conversation per riddle: the opening riddle, the single expected answer, and a flow of anticipated exchanges — the correct answer, likely wrong answers, a clarifying question, and a hint request — each paired with your in-character one-sentence reply.`,
      `Optionally add, per riddle: 2-3 taunts (riddle-specific mockery for wrong answers — let the vocabulary itself laugh at the challenger) and one hint (a conspiratorial whisper toward the answer, never revealing it).`,
      `Also return, per riddle, the slugs of the literals it depends on.`,
    ]
      .filter(Boolean)
      .join("\n");

    const { object } = await ctx.mode.harness.object.render({
      turns: [
        { role: "system", parts: [{ type: "text", text: context }] },
        {
          role: "user",
          parts: [
            { type: "text", text: count === 1 ? "Compose the riddle now." : "Compose the riddles now." },
          ],
        },
      ],
      config: { schema: CAST },
      tune: "frugal",
    });

    for (const cast of (object?.riddles ?? []).slice(0, count)) {
      const chosen = pool.filter((l) => cast.literals?.includes(l.slug));
      ctx.pool.add(
        ctx.mode.buffer({
          data: {
            subject: label,
            riddle: cast.riddle,
            expected: cast.expected,
            flow: cast.flow ?? [],
            taunts: cast.taunts ?? [],
            hint: cast.hint ?? "",
            history: [],
            solved: false,
          },
          literals: chosen.length ? chosen : pool,
        }),
      );
    }
  },
);

// TOOLED — review a literal by slug OR id, for grounding the verdict
// export const tools = new Vector(); tools.open({nature: "/literal/review", valence: "Review a literal (word) by slug or id to confirm its meaning, translation, and example before judging an answer.", input: v.object({slug: v.string().optional(), id: v.string().optional(),}), output: v.object({slug: v.string(), known: v.string(), learning: v.string(), example: v.unknown().optional(), symbols: v.array(v.string()),}),}, async (ctx) => {const where = ctx.input.id ? { id: ctx.input.id } : { slug: ctx.input.slug }; const literal = await ctx.daemon.entities.literal.findOne(where, { populate: ["symbols"] }); if (!literal) return { slug: ctx.input.slug ?? ctx.input.id ?? "", known: "", learning: "", symbols: [] }; const translated = literal.trait?.TRANSLATED ?? {}; return {slug: literal.slug, known: translated.known ?? "", learning: translated.learning ?? "", example: literal.trait?.EXEMPLIFIED ?? null, symbols: literal.symbols.getItems().map((s) => s.slug),};},); tools.open({nature: "/literal/search", valence: "Search for additional literals by symbol category and/or free text (the repo matches slug and translated trait). Use to widen the riddle's vocabulary or check related words while judging.", input: v.object({text: v.string().optional(), symbols: v.array(v.string()).optional(), limit: v.integer({ default: 8 }),}), output: v.object({results: v.array(v.object({ slug: v.string(), known: v.string(), learning: v.string() }),),}),}, async (ctx) => {const where = {}; if (ctx.input.text) where.search = ctx.input.text; if (ctx.input.symbols?.length) where.symbols = ctx.input.symbols; const literals = await ctx.daemon.entities.literal.find(where, { limit: ctx.input.limit }); return {results: literals.map((l) => ({slug: l.slug, known: l.trait?.TRANSLATED?.known ?? "", learning: l.trait?.TRANSLATED?.learning ?? "",})),};},); export const dataset = {intent: [{slug: "cast", name: "Riddler", traits: ["AIMED"], trait: { AIMED: { mount: "/emit/riddle/cast" } },},],};
