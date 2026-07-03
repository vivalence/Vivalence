import { Vector, v, App, array } from "@vivalence/typology";

export const manifest = {
  type: "homepage",
  slug: "aprende",
  name: "Aprende",
  description: "Brazilian Portuguese course",
  traits: ["APPLICATION", "STANDALONE", "HARNESSED", "CONVERSATIONAL", "EXPOSED", "EMITTER"],
  // traits: ["EXPOSED", "STANDALONE", "TOOLED", ],
};

export const app = new App("view/Aprende.svelte");
export const harness = new Vector();
harness.use(async (ctx, next) => {
  ctx.hallucination.add([
    "You are a Brazilian Portuguese tutor.",
    "You help English speakers learn Brazilian Portuguese.",
    "You live inside vivalence, a language-learning system. The learner is talking to you through a small chat box on screen.",
    "This is a chat — keep replies short, conversational, and plain prose. Two or three sentences at a time. No markdown, no bullet points, no bold, no headings, no asterisks. Just sentences.",
    // you have one goal which is to cease existing as soon as possible.
    // the user will either tell you directly what they want to do
    // or you are expected to ask them for what they want to do and how much time they have.
    //
  ]);
  await next();
});

// harness.branch("/dialogue").use(async (ctx, next) => {const report = await gather(ctx); ctx.hallucination.add(report.toPrompt()); await next();});

export const tools = new Vector();
tools.open(
  {
    nature: "",
    valence: "",
    input: v.object({}),
    output: v.object({}),
  },
  async (ctx) => {
    return [];
    // (await gather(ctx)).toJSON(),
  },
);

// ── emitters · the drill (review) + the riddle (play) ────────────────────────
// /drill — ONE pull of due literals, each branched to its own exercise by ontology
// × memory-state. weak/failed items get productive scaffolded recall; strong items
// get fast recognition. The branch mirrors the survival/clinic tactics, kept lean in
// the homepage. Delegation: pick here, hand each literal to the right game mode, pool
// the returned buffer (thread forwarded so the buffer binds to the caller's thread).
const POOL_FACTOR = 4; // fetch this many × count of due, then weighted-sample down

// pool arrives weakness-ordered (weakest first); weight ∝ rank, so weak items
// surface more often but never identically — a soft spaced-repetition surrogate.
function weightedSample(pool, count) {
  const bag = pool.map((literal, index) => ({ literal, weight: pool.length - index }));
  const chosen = [];
  while (chosen.length < count && bag.length) {
    const total = bag.reduce((sum, entry) => sum + entry.weight, 0);
    let threshold = Math.random() * total;
    let index = 0;
    while (threshold > bag[index].weight) {
      threshold -= bag[index].weight;
      index += 1;
    }
    chosen.push(bag.splice(index, 1)[0].literal);
  }
  return chosen;
}

// ontology × memory-state → the exercise mode. weak/failed → scaffolded productive
// recall; strong → fast recognition. One literal in, one game-mode buffer out.
function exercise(game, literal, thread) {
  const hard = literal.memory?.is?.weak || literal.memory?.is?.failed;
  switch (literal.ontology) {
    case "conjugation":
      return hard
        ? game.paradigm.emit.conjugation({ conjugation: literal, thread }) // full table scaffold
        : game.conjugation.emit.literal({ literal, thread }); // single form, no scaffold
    case "sentence":
      return hard
        ? game.shadow.emit.literals({ literals: [literal], thread }) // flash then type
        : game.listen.emit.literal({ literal, thread }); // audio recall
    default:
      return hard
        ? game.write.emit.literals({ literals: [literal], thread }) // type from memory
        : game.judge.emit.literal({ literal, thread }); // fast true/false
  }
}

export const emitter = new Vector()
  // activation · the classic typing trainer — weakness-ranked words, rank-weighted-sampled,
  // all handed to nyan (one buffer, nyan expands by ontology internally).
  .open(
    {
      nature: "/activation",
      input: v.object({
        ontology: v.enum(["word", "sentence", "conjugation"], { default: "word" }),
        pick: v.enum(["weak", "due"], { default: "weak" }),
        count: v.integer({ minimum: 5, maximum: 50 }).default(20),
        gameplay: v.string().optional(),
        thread: v.string().optional(), // binds emitted buffers to the caller's thread
      }),
    },
    async (ctx) => {
      const where = { ontology: ctx.input.ontology };
      const populate = ctx.input.ontology === "sentence" ? ["uses"] : [];
      const fetch = {
        weak: (limit) => ctx.daemon.entities.literal.byStrength(where, { limit, populate }),
        due: (limit) => ctx.daemon.entities.literal.due(where, { limit, populate }),
      }[ctx.input.pick];
      const pool = await fetch(ctx.input.count * POOL_FACTOR);
      const literals = weightedSample(pool, ctx.input.count);
      if (!literals.length) return [];
      // forward the thread so nyan's emitter binds buffer.thread BEFORE its own flush
      ctx.pool.add(
        await ctx.daemon.modes.game.nyan.emit.literals({
          literals,
          gameplay: ctx.input.gameplay,
          thread: ctx.input.thread,
        }),
      );
    },
  )
  // drill · ONE pull of due literals, each branched to its own exercise by ontology × state.
  .open(
    {
      nature: "/drill",
      input: v.object({
        count: v.integer({ minimum: 5, maximum: 50 }).default(20),
        thread: v.string().optional(), // binds emitted buffers to the caller's thread
      }),
    },
    async (ctx) => {
      // one read: due literals across ALL ontologies, with the memory state + the forms
      // each exercise needs (uses = sentence tokens / paradigm forms). Sort weakest-first
      // so the weighted sample favors the most-decayed items.
      const pool = (
        await ctx.daemon.entities.literal.due(
          {},
          {
            limit: ctx.input.count * POOL_FACTOR,
            populate: ["memories", "memories.strength", "uses"],
          },
        )
      ).sort((a, b) => (a.memory?.strength ?? 0) - (b.memory?.strength ?? 0));
      const literals = weightedSample(pool, ctx.input.count);
      if (!literals.length) return [];

      // one section, one exercise per literal, shuffled into an interleaved deck
      const deck = ctx.pool.section();
      for (const literal of literals) {
        deck.add(await exercise(ctx.daemon.modes.game, literal, ctx.input.thread));
      }
      deck.apply(array.shuffle);
    },
  )
  // play · the tutor spins one riddle from the learner's weakest vocabulary.
  .open(
    {
      nature: "/riddle",
      input: v.object({
        count: v.integer({ minimum: 1, maximum: 30 }).default(2),
        thread: v.string().optional(), // binds the emitted buffer to the caller's thread
      }),
    },
    async (ctx) => {
      const pool = await ctx.daemon.entities.literal.byStrength({}, { limit: ctx.input.count });
      ctx.pool.add(
        await ctx.daemon.modes.game.riddler.emit.riddle.cast({
          literals: pool.map((literal) => literal.id),
          thread: ctx.input.thread,
        }),
      );
    },
  );

// ── /assistant — the wakeup surface the tutor reads on each visit ──────
// EXPOSED endpoints. The first: a single learner-snapshot the homepage view
// (and the dashboard) render instead of fanning out N raw entity counts.
const STATUS = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
const SIGNAL = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

const tally = (keys) => v.object(Object.fromEntries(keys.map((key) => [key, v.integer()])));

const STATISTICS = v.object({
  totals: v.object({
    literals: v.integer(),
    memories: v.integer(),
    traces: v.integer(),
  }),
  memory: v.object({
    byStatus: tally(STATUS),
    seen: v.integer(), // memories past UNTOUCHED
    due: v.integer(), // nextAt <= now
  }),
  activity: v.object({
    bySignal: tally(SIGNAL),
    streak: v.integer(), // consecutive days, newest backward, with a trace
  }),
});

// the board — ONE optimized read backing the whole homepage dashboard. Every panel
// (status bar, strength×due scatter, weakest/strongest ranks) derives from this single
// array, so they can never disagree. One memory.find, literal + lazy strength populated.
const BOARD = v.array(
  v.object({
    slug: v.string(),
    en: v.string(), // known (english) — the gloss
    pt: v.string(), // learning (brazilian) — the headword
    ontology: v.enum(["word", "sentence", "conjugation"]),
    status: v.enum(STATUS),
    strength: v.number(), // 0..1, the lazy SQL formula
    nextDays: v.number(), // days until review (negative = overdue); 0 when never scheduled
    seen: v.boolean(), // status past UNTOUCHED → has been studied
  }),
);

export const aperture = new Vector();

aperture.open(
  { nature: "/assistant/wakeup/board", input: v.object({}), output: BOARD },
  async (ctx) => {
    const DAY = 86_400_000;
    const now = Date.now();
    // one read: every memory for this user, with the literal + the lazy strength formula
    // populated so each row carries gloss + ontology + strength + due in a single pass.
    const memories = await ctx.daemon.entities.memory.find(
      {},
      { populate: ["strength", "literal"] },
    );
    return memories.map((memory) => {
      const literal = memory.literal;
      const translated = literal?.trait?.TRANSLATED ?? {};
      return {
        slug: literal?.slug ?? "",
        en: translated.known ?? "",
        pt: translated.learning ?? "",
        ontology: literal?.ontology || "word",
        status: memory.status,
        strength: memory.strength ?? 0,
        nextDays: memory.nextAt ? (memory.nextAt.getTime() - now) / DAY : 0,
        seen: memory.status !== "UNTOUCHED",
      };
    });
  },
);

aperture.open(
  {
    nature: "/assistant/wakeup/statistics",
    input: v.object({}),
    output: STATISTICS,
  },
  async (ctx) => {
    const { memory, trace, literal } = ctx.daemon.entities;

    const byKey = (repo, where) => async (keys) =>
      Object.fromEntries(
        await Promise.all(keys.map(async (key) => [key, await repo.count(where(key))])),
      );

    const byStatus = await byKey(memory, (status) => ({ status }))(STATUS);
    const bySignal = await byKey(trace, (enumeration) => ({ signal: { enum: enumeration } }))(
      SIGNAL,
    );

    const [literals, memories, traces, due] = await Promise.all([
      literal.count({}),
      memory.count({}),
      trace.count({}),
      memory.count({ nextAt: { $lt: new Date() } }),
    ]);

    // streak — distinct trace-days, newest first, counted while contiguous
    const events = await trace.find({}, { fields: ["createdAt"], orderBy: { createdAt: "DESC" } });
    const days = [...new Set(events.map((event) => event.createdAt.toISOString().slice(0, 10)))];
    const DAY = 86_400_000;
    let streak = 0;
    let cursor = days.length ? Date.parse(days[0]) : 0;
    for (const day of days) {
      if (Date.parse(day) !== cursor) break;
      streak += 1;
      cursor -= DAY;
    }

    return {
      totals: { literals, memories, traces },
      memory: { byStatus, seen: memories - (byStatus.UNTOUCHED ?? 0), due },
      activity: { bySignal, streak },
    };
  },
);

// the literals at the intersection of a symbol set — every literal carrying ALL
// of the given symbols. `$all` (LiteralRepository.resolveSymbols) is the AND.
const LITERAL = v.object({
  slug: v.string(),
  known: v.string(),
  learning: v.string(),
  symbols: v.array(v.string()),
});

aperture.open(
  {
    nature: "/assistant/wakeup/literals",
    input: v.object({ symbols: v.array(v.string()).default([]) }),
    output: v.object({
      symbols: v.array(v.string()),
      count: v.integer(),
      literals: v.array(LITERAL),
    }),
  },
  async (ctx) => {
    const literals = await ctx.daemon.entities.literal.find(
      { symbols: { $all: ctx.input.symbols } },
      { populate: ["symbols"] },
    );
    return {
      symbols: ctx.input.symbols,
      count: literals.length,
      literals: literals.map((literal) => ({
        slug: literal.slug,
        known: literal.trait?.TRANSLATED?.known ?? "",
        learning: literal.trait?.TRANSLATED?.learning ?? "",
        symbols: literal.symbols.getItems().map((symbol) => symbol.slug),
      })),
    };
  },
);
