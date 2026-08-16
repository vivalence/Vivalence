import { v } from "@vivalence/typology";

// the learning-domain scales the whole mode speaks in — retention statuses (the
// acquisition ladder) and trace signals (per-exercise outcomes).
export const STATUS = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
export const SIGNAL = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

export const TUTOR_MESSAGE_INPUT = v.object({
  prompt: v.string().desc("The learner's message to the tutor."),
  thread: v.string().optional().desc("Binds the exchange to the caller's thread."),
});

export const LANGUAGE = v.object({
  slug: v.string(),
  name: v.string().optional(),
  contractions: v
    .record(v.string(), v.array(v.string()))
    .default({})
    .desc(
      "contraction → its expansions; the checker treats every spelling in a row as one answer. A key starting with an apostrophe (or n') is a SUFFIX RULE riding any host word ('re → are); any other key is a literal pair (won't → will not).",
    ),
  elision: v
    .boolean()
    .default(false)
    .desc("an apostrophe in an answer stands for an optionally elided vowel — dov'è ≡ dove è, un'amica ≡ una amica"),
});
