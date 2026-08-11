import { object, v } from "@vivalence/typology";

export const ONTOLOGY = ["word", "sentence", "conjugation"];

export const OVERFETCH = 3;

export const AXIS_KEYS = [
  "recall",
  "gameplay",
  "prompt",
  "preview",
  "streak",
  "continuous",
  "limit",
  "forgiving",
  "target",
  "knowables",
];

export const axes = (input) => object.pluck(input, AXIS_KEYS);

export const DEFAULTS = { gameplay: "TYPE", prompt: "TEXT", forgiving: true };

export const PRESETS = {
  write: { gameplay: "TYPE", prompt: "TEXT" },
  shadow: { gameplay: "TYPE", prompt: "TEXT", preview: { speed: { rate: "NORMAL" } } },
  listen: { gameplay: "TYPE", prompt: "AUDIO" },
  flashcard: { gameplay: "FLIP", prompt: "TEXT" },
  pick: { gameplay: "PICK", prompt: "TEXT" },
  conjugate: { gameplay: "TYPE", prompt: "TEXT", recall: "LEARNING" },
  translate: { gameplay: "TYPE", prompt: "TEXT", recall: "KNOWN" },
  ultra: {
    gameplay: "TYPE",
    prompt: "TEXT",
    streak: 3,
    continuous: true,
    limit: { seconds: 600 },
  },
};

const recallOptions = v.enum(["KNOWN", "LEARNING"]);

export const recall = v
  .union([recallOptions, v.array(recallOptions)])
  .desc(
    "KNOWN: prompt learning side, produce known. LEARNING: inverse. Array = per-knowable by index. Omit = random per knowable.",
  )
  .optional();

export const gameplay = v
  .enum(["TYPE", "PICK", "FLIP"])
  .desc(
    "TYPE: free text. PICK: choose the target among the knowables (requires target, >=2 knowables). FLIP: reveal + self-grade 1/2/3.",
  );

export const prompt = v
  .enum(["TEXT", "AUDIO"])
  .desc(
    "TEXT: prompt text, audio button beside it when VOCALIZED resolves. AUDIO: audio only — every knowable must resolve an asset.",
  );

export const preview = v
  .object({
    speed: v
      .object({})
      .desc("{rate: FAST|NORMAL|SLOW} or {base, multiplier}. Display time = base + answer.length x multiplier ms.")
      .optional(),
  })
  .desc("Timed memorize phase before recall. TYPE only. Under streak: first rep of each knowable only.")
  .optional();

export const streak = v
  .integer({ minimum: 1 })
  .desc(
    "Consecutive successes required per knowable; failure resets + requeues. 1 = each correct at least once. Omit = single pass.",
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
      "Governs layout + token feedback. conjugation = a single paradigm form, prompted with its grammatical context.",
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
      "Conjugation prompt context {infinitive, tense, mood, person} — label strings resolved daemon-side from symbol trait.LABELED.",
    )
    .optional(),
  tokens: v.array(v.object({})).desc("{form, gloss, literal?} for per-token feedback + review.").optional(),
  asset: v
    .object({})
    .desc("VOCALIZED asset descriptor — the view resolves it against daemon cargo.")
    .optional(),
  literal: v.string().desc("Persisted literal id — reviews land here. Absent = retention untouched.").optional(),
  judge: v.enum(["MATCH", "LLM"]).desc("Emitter-stamped, never caller-set. /generate stamps LLM.").optional(),
});

export const knowables = v
  .array(knowable)
  .desc("Direct knowables — caller-authored sets, /generate output, or resolved conjugation forms.")
  .optional();

export const AXES = {
  recall,
  gameplay: gameplay.optional(),
  prompt: prompt.optional(),
  preview,
  streak,
  continuous,
  limit,
  forgiving: forgiving.optional(),
  target,
  knowables,
};

export const count = v.integer({ minimum: 1, maximum: 60 }).desc("How many to draw.").optional();

export const where = v.object({}).desc("Literal query, merged under the ontology guard.").optional();

export const scope = v.array(v.rel(v.symbol())).desc("Symbol slugs the set is drawn from — AND per symbol.");
