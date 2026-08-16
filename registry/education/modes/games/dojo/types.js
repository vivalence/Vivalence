import { object, v } from "@vivalence/typology";

export const ONTOLOGY = ["word", "sentence", "conjugation"];

export const OVERFETCH = 3;

export const AXIS_KEYS = [
  "recall",
  "gameplay",
  "prompt",
  "greedy",
  "random",
  "preview",
  "streak",
  "anhieb",
  "continuous",
  "limit",
  "forgiving",
  "target",
  "knowables",
];

export const axes = (input) => object.pluck(input, AXIS_KEYS);

export const SETUP = AXIS_KEYS.filter((key) => key !== "knowables" && key !== "target");

export const DEFAULTS = { gameplay: "TYPE", prompt: "TEXT", forgiving: true, random: "GAMEPLAY" };

export const LIVE = ["gameplay", "recall", "greedy", "random", "preview", "continuous", "limit", "forgiving"];

export const GAMEPLAYS = ["TYPE", "PICK", "FLIP", "CONJUGATE"];

export const RANDOMS = ["ORDER", "GAMEPLAY"];

const randomOptions = v.enum(RANDOMS);

export const random = v
  .union([randomOptions, v.array(randomOptions)])
  .desc(
    "Where chance enters, one entry per level. ORDER: the queue is shuffled. GAMEPLAY: recall side, game and prompt are drawn per knowable from their pools — a miss keeps that draw for the retry, a landing that comes back (streak) draws a setup not yet worn, repeating only once every combination has been. Both entries = both levels; the empty array = neither, so the queue keeps course order and every pool cycles in its own order. Omit = GAMEPLAY.",
  )
  .optional();

export const randomness = (value) => (value === undefined ? [DEFAULTS.random] : [].concat(value ?? []));

export const drawing = (value) => randomness(value).includes("GAMEPLAY");

export const shuffling = (value) => randomness(value).includes("ORDER");

export const RECALLS = ["KNOWN", "LEARNING"];

export const PRESETS = {
  meet: {
    note: "first contact — see the meaning, flip to the word, grade yourself",
    count: 8,
    axes: { gameplay: "FLIP", prompt: "TEXT", recall: "LEARNING" },
  },
  recognize: {
    note: "passive — read the word, pick its meaning among distractors",
    count: 8,
    axes: { gameplay: "PICK", prompt: "TEXT", recall: "KNOWN" },
  },
  write: {
    note: "active — meaning in, word out",
    axes: { gameplay: "TYPE", prompt: "TEXT" },
  },
  shadow: {
    note: "memorize it while it shows, then type it from memory",
    axes: { gameplay: "TYPE", prompt: "TEXT", preview: { speed: { rate: "NORMAL" } } },
  },
  listen: {
    note: "hear it, type it",
    axes: { gameplay: "TYPE", prompt: "AUDIO" },
  },
  drill: {
    note: "consolidate — both directions, twice each before it leaves the queue",
    axes: { gameplay: "TYPE", prompt: "TEXT", recall: ["KNOWN", "LEARNING"], streak: 2 },
  },
  mixed: {
    note: "surprise every rep — gameplay and direction drawn per knowable",
    axes: { gameplay: ["TYPE", "PICK", "FLIP"], prompt: "TEXT", recall: ["KNOWN", "LEARNING"] },
  },
  ultra: {
    note: "streak 3, continuous, ten minutes",
    axes: { gameplay: "TYPE", prompt: "TEXT", streak: 3, continuous: true, limit: { seconds: 600 } },
  },
  conjugate: {
    note: "the table — infinitive and tense in, every form out, cell by cell",
    count: 2,
    where: { ontology: "conjugation" },
    axes: { gameplay: "CONJUGATE", prompt: "TEXT", recall: "LEARNING" },
  },
};

const recallOptions = v.enum(RECALLS);

export const recall = v
  .union([recallOptions, v.array(recallOptions)])
  .desc(
    "KNOWN: prompt learning side, produce known. LEARNING: inverse. Array = pool, one drawn per knowable. Omit = both.",
  )
  .optional();

const gameplayOptions = v.enum(GAMEPLAYS);

export const gameplay = v
  .union([gameplayOptions, v.array(gameplayOptions)])
  .desc(
    "TYPE: free text. PICK: choose the target among the knowables (>=2 knowables). FLIP: reveal + self-grade 1/2/3. CONJUGATE: a conjugation row as the whole table, cell by cell — rows only; a row drawn TYPE/PICK/FLIP plays its forms one by one. Array = pool, one drawn per knowable among what it can resolve; a table aboard stays a table under a live change.",
  );

export const PROMPTS = ["TEXT", "AUDIO"];

const promptOptions = v.enum(PROMPTS);

export const prompt = v
  .union([promptOptions, v.array(promptOptions)])
  .desc(
    "TEXT: prompt text, audio button beside it when VOCALIZED resolves. AUDIO: audio only — every knowable must resolve an asset. Array = pool, one drawn per knowable among what it can resolve.",
  );

export const greedy = v
  .boolean()
  .desc(
    "With AUDIO in the prompt pool: every knowable that resolves an asset plays AUDIO — recall still draws (LEARNING = transcribe, KNOWN = translate). Conjugation tables ignore it. Omit = drawn per knowable.",
  )
  .optional();

export const listening = (prompt) => {
  const pool = [].concat(prompt ?? "TEXT");
  return pool.length > 0 && pool.every((entry) => entry === "AUDIO");
};

export const STATUSES = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];

export const PREVIEW_WHENS = ["ONCE", "ALWAYS", "MISSED", "STATUS"];

export const preview = v
  .object({
    speed: v
      .object({})
      .desc("{rate: FAST|NORMAL|SLOW} or {base, multiplier}. Display time = base + answer.length x multiplier ms.")
      .optional(),
    when: v
      .enum(PREVIEW_WHENS)
      .desc(
        "ONCE (default): the first rep of each knowable. ALWAYS: every rep, requeues included. MISSED: only while the knowable's last signal is a miss — its history before the session, then its own reps inside it. STATUS: while the literal's retention status is one of `status`.",
      )
      .optional(),
    status: v
      .array(v.enum(STATUSES))
      .desc("STATUS when — the retention statuses that earn a preview. Omit = UNTOUCHED + UNKNOWN.")
      .optional(),
  })
  .desc("Timed memorize phase before recall. TYPE + CONJUGATE only. `when` says which reps show it.")
  .optional();

export const streak = v
  .integer({ minimum: 1 })
  .desc(
    "Consecutive successes required per knowable; failure resets + requeues. 1 = each correct at least once. Omit = single pass. A conjugation table runs the streak per CELL inside the table and passes once itself.",
  )
  .optional();

export const anhieb = v
  .integer({ minimum: 1 })
  .desc(
    "Bonus runs credited when a subject lands on its FIRST rep — streak 3 with anhieb 1 leaves a first-try answer at 2/3. Ignored without a streak.",
  )
  .optional();

export const continuous = v
  .boolean()
  .desc(
    "The buffer refetches a fresh set itself when the current one completes — requeries the symbols scope when present, else repeats its feed. Session ends only via limit or the player leaving.",
  )
  .optional();

export const limit = v
  .object({
    reps: v.integer({ minimum: 1 }).desc("Max total attempts.").optional(),
    seconds: v.integer({ minimum: 1 }).desc("Max session duration.").optional(),
  })
  .desc("Hard cutoff — releases even mid-streak. Omit = run to completion.")
  .optional();

export const forgiving = v
  .boolean()
  .desc("MATCH + retype-correction normalize diacritics/case/punctuation (string.fold).");

export const target = v.string().desc("PICK: id of the correct knowable; the rest are distractors.").optional();

export const knowable = v.object({
  ontology: v
    .enum(ONTOLOGY)
    .desc(
      "Governs layout + token feedback. conjugation = a paradigm TABLE: known/learning are the infinitive, tokens are the forms, typed cell by cell; the row literal takes the aggregate review. A single form is a word carrying its context.",
    ),
  known: v.string(),
  learning: v.string(),
  example: v
    .object({})
    .desc("{known, learning} usage example, shown beside a word prompt and revealed with the answer.")
    .optional(),
  context: v
    .object({})
    .desc(
      "Grammatical context shown over the prompt — a table carries {tense, mood, suffix, regularity} (LABELED names), a form word carries {infinitive, tense, mood, person, number} (its own symbol facets).",
    )
    .optional(),
  tokens: v
    .array(v.object({}))
    .desc(
      "{form, gloss, literal?} for per-token feedback + review. A table's tokens are its forms in slot order, each with {slot, person, number, asset?}.",
    )
    .optional(),
  asset: v
    .object({})
    .desc("VOCALIZED asset descriptor — the view resolves it against daemon cargo.")
    .optional(),
  literal: v.string().desc("Persisted literal id — reviews land here. Absent = retention untouched.").optional(),
  judge: v.enum(["MATCH", "LLM"]).desc("Emitter-stamped, never caller-set. /generate stamps LLM.").optional(),
});

export const knowables = v
  .array(knowable)
  .desc("Direct knowables — caller-authored sets, /generate output, or resolved conjugation tables.")
  .optional();

export const AXES = {
  recall,
  gameplay: gameplay.optional(),
  prompt: prompt.optional(),
  greedy,
  random,
  preview,
  streak,
  anhieb,
  continuous,
  limit,
  forgiving: forgiving.optional(),
  target,
  knowables,
};

export const count = v.integer({ minimum: 1, maximum: 60 }).desc("How many to draw.").optional();

export const where = v.object({}).desc("Literal query, merged under the ontology guard.").optional();

export const scope = v.array(v.rel(v.symbol())).desc("Symbol slugs the set is drawn from — AND per symbol.");

export const CAP = 200;
export const SYMBOL_PAGE = 40;

export const PICKS = [
  "all",
  "feed",
  "due",
  "novel",
  "byStrength",
  "byLastSignal",
  "sample",
  "literals",
  "authored",
];

export const STREAMS = ["feed", "due", "novel", "byStrength", "byLastSignal", "sample"];

export const TRAITS = ["TRANSLATED", "EXEMPLIFIED", "RANKED", "ANNOTATED", "VOCALIZED", "CONJUGATED"];

export const SYMBOL_TRAITS = ["ONTOLOGICAL", "STRUCTURAL", "TOPOGRAPHICAL"];


export const SIGNALS = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

export const MISSED = ["MISTAKE", "FAILURE"];

const slugs = v.array(v.rel(v.symbol()));

export const symbols = v
  .union([
    slugs,
    v.object({
      $all: slugs.desc("Every one of these — AND.").optional(),
      $in: slugs.desc("At least one of these — OR.").optional(),
      $none: slugs.desc("None of these — exclusion.").optional(),
    }),
  ])
  .desc(
    "Symbol constraint, the literal repository's own grammar. Array = every slug required (AND). Object = $all AND any-of-$in AND none-of-$none. Slugs are dotted, e.g. word.tense.present, word.lemma.essere, domain.food, proficiency.cefr.a1.",
  );

const traitNames = v.array(v.enum(TRAITS));

export const traits = v
  .union([
    traitNames,
    v.object({
      $contains: traitNames.desc("Every one of these — AND.").optional(),
      $overlap: traitNames.desc("At least one of these — OR.").optional(),
      $none: traitNames.desc("None of these — exclusion.").optional(),
    }),
  ])
  .desc(
    "Literal trait constraint, the data repository's own grammar. Array = every trait required. Object = $contains AND any-of-$overlap AND none-of-$none. VOCALIZED for anything that must play audio.",
  );

export const query = v
  .object({
    symbols: symbols.optional(),
    traits: traits.optional(),
    search: v.string().desc("Text matched against slug and both translations.").optional(),
    ontology: v
      .union([v.enum(ONTOLOGY), v.array(v.enum(ONTOLOGY))])
      .desc("word | sentence | conjugation, one or several. Omit = all three.")
      .optional(),
    rank: v
      .object({
        $lte: v.integer({ minimum: 1 }).optional(),
        $gte: v.integer({ minimum: 1 }).optional(),
      })
      .desc("Course-order window over the literal rank.")
      .optional(),
  })
  .desc("Literal repository query — nothing implicit: what is written is what is asked.");

export const clause = v
  .object({
    pick: v
      .enum(PICKS)
      .desc(
        "all: every match in course order. feed: due topped up with novel. due: scheduled for review now. novel: never studied, course order. byStrength: weakest retention first. byLastSignal: last review signal among `signals` (default MISTAKE + FAILURE). sample: random order, optionally only retention `status`. literals: exactly the given ids. authored: exactly the given pairs, retention untouched.",
      ),
    where: query.optional(),
    limit: v
      .integer({ minimum: 1, maximum: CAP })
      .desc(`Cap for this clause — ${CAP} when omitted.`)
      .optional(),
    signals: v
      .array(v.enum(SIGNALS))
      .desc("byLastSignal pick — the last signals that qualify. Omit = MISTAKE + FAILURE.")
      .optional(),
    status: v
      .array(v.enum(STATUSES))
      .desc("sample pick — the retention statuses that qualify. Omit = every literal.")
      .optional(),
    literals: v.array(v.rel(v.literal())).desc("literals pick — literal ids or slugs.").optional(),
    knowables: knowables.desc("authored pick — the pairs."),
  })
  .desc("One source of the set: a pick, its query, its cap.");

export const set = v
  .array(clause)
  .desc(
    "The declared set — clauses union in order, each drawing past what earlier clauses already took. Materialized into the buffer's literals + data.knowables on commission.",
  );
