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
  numbers: "functional.number",
  months: "domain.month",
  family: "domain.family",
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
      `Conversation so far: ${JSON.stringify(buffer.data.history)}`,
      `Judge the challenger's answer and reply in character.`,
    ].join("\n");

    const { object: verdict = {} } = await ctx.mode.harness.object.render({
      turns: [
        { role: "system", parts: [{ type: "text", text: context }] },
        { role: "user", parts: [{ type: "text", text: ctx.input.message }] },
      ],
      config: { schema: v.object({ correct: v.boolean(), reply: v.string() }) },
      tune: "frugal",
    });

    const solved = buffer.data.solved || verdict.correct;
    buffer.data = {
      ...buffer.data,
      history: [
        ...buffer.data.history,
        { user: ctx.input.message, correct: verdict.correct, reply: verdict.reply },
      ],
      solved,
    };
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
// cortex predict one riddle (using a subset of the pool) plus the whole conversation.
export const emitter = new Vector().open(
  {
    nature: "/riddle/cast",
    input: v.object({
      literals: v.array(v.string()).optional(), // literal ids — riddler uses a subset
      symbols: v.array(v.string()).optional(), // symbol slugs — pull their literals
      subject: v.enum(Object.keys(SUBJECTS)).optional(), // sugar for a single symbol
      instructions: v.string().optional(), // freeform steering, always allowed
      limit: v.integer({ default: 12 }),
    }),
  },
  async (ctx) => {
    const keys = Object.keys(SUBJECTS);
    const subject =
      ctx.input.subject ??
      (ctx.input.symbols || ctx.input.literals
        ? null
        : keys[Math.floor(Math.random() * keys.length)]);

    // pool — explicit literals win, else the symbol set (always with memory strength)
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
        { limit: ctx.input.limit, populate: ["memories", "memories.strength"] },
      );
    }

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
      `Compose ONE riddle in ${language(ctx).learning} about ${label}.`,
      ctx.input.instructions ? `Extra instructions: ${ctx.input.instructions}` : null,
      `Pick a SUBSET of this vocabulary (slug: learning (known) — strength/status):`,
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
      `Predict the WHOLE conversation: the opening riddle, the single expected answer, and a flow of anticipated exchanges — the correct answer, likely wrong answers, a clarifying question, and a hint request — each paired with your in-character one-sentence reply.`,
      `Also return the slugs of the literals the riddle depends on.`,
    ]
      .filter(Boolean)
      .join("\n");

    const { object: cast = {} } = await ctx.mode.harness.object.render({
      turns: [
        { role: "system", parts: [{ type: "text", text: context }] },
        { role: "user", parts: [{ type: "text", text: "Compose the riddle now." }] },
      ],
      config: {
        schema: v.object({
          riddle: v.string(),
          expected: v.string(),
          flow: v.array(
            v.object({
              user: v.string(),
              kind: v.enum(["correct", "wrong", "clarify", "hint"]),
              reply: v.string(),
            }),
          ),
          literals: v.array(v.string()),
        }),
      },
      tune: "frugal",
    });

    const chosen = pool.filter((l) => cast.literals?.includes(l.slug));

    ctx.pool.add(
      ctx.mode.buffer({
        data: {
          subject: label,
          riddle: cast.riddle,
          expected: cast.expected,
          flow: cast.flow ?? [],
          history: [],
          solved: false,
        },
        literals: chosen.length ? chosen : pool,
      }),
    );
  },
);

// TOOLED — review a literal by slug OR id, for grounding the verdict
// export const tools = new Vector(); tools.open({nature: "/literal/review", valence: "Review a literal (word) by slug or id to confirm its meaning, translation, and example before judging an answer.", input: v.object({slug: v.string().optional(), id: v.string().optional(),}), output: v.object({slug: v.string(), known: v.string(), learning: v.string(), example: v.unknown().optional(), symbols: v.array(v.string()),}),}, async (ctx) => {const where = ctx.input.id ? { id: ctx.input.id } : { slug: ctx.input.slug }; const literal = await ctx.daemon.entities.literal.findOne(where, { populate: ["symbols"] }); if (!literal) return { slug: ctx.input.slug ?? ctx.input.id ?? "", known: "", learning: "", symbols: [] }; const translated = literal.trait?.TRANSLATED ?? {}; return {slug: literal.slug, known: translated.known ?? "", learning: translated.learning ?? "", example: literal.trait?.EXEMPLIFIED ?? null, symbols: literal.symbols.getItems().map((s) => s.slug),};},); tools.open({nature: "/literal/search", valence: "Search for additional literals by symbol category and/or free text (the repo matches slug and translated trait). Use to widen the riddle's vocabulary or check related words while judging.", input: v.object({text: v.string().optional(), symbols: v.array(v.string()).optional(), limit: v.integer({ default: 8 }),}), output: v.object({results: v.array(v.object({ slug: v.string(), known: v.string(), learning: v.string() }),),}),}, async (ctx) => {const where = {}; if (ctx.input.text) where.search = ctx.input.text; if (ctx.input.symbols?.length) where.symbols = ctx.input.symbols; const literals = await ctx.daemon.entities.literal.find(where, { limit: ctx.input.limit }); return {results: literals.map((l) => ({slug: l.slug, known: l.trait?.TRANSLATED?.known ?? "", learning: l.trait?.TRANSLATED?.learning ?? "",})),};},); export const dataset = {intent: [{slug: "cast", name: "Riddler", traits: ["AIMED"], trait: { AIMED: { mount: "/emit/riddle/cast" } },},],};
