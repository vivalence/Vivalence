import { v } from "@vivalence/typology";

const GENERATE_RENDER_OUTPUT = v.object({
  sentences: v.array(
    v.object({
      known: v.string().desc("The sentence in the learner's native language."),
      learning: v.string().desc("The same sentence in the language being learned."),
    }),
  ),
});

export const generate = {
  output: GENERATE_RENDER_OUTPUT,

  identity: ({ known, learning }) =>
    `You compose sentence pairs for translation practice. The learner's native language is ${known.name}; the language they are learning is ${learning.name}.
Every sentence must be grammatically correct and sound natural to a native speaker of ${learning.name}.`,

  pool: (literals) =>
    `Build the sentences from THIS vocabulary pool (learning (known)):
${literals
  .map(
    (literal) =>
      `  ${literal.trait?.TRANSLATED?.learning} (${literal.trait?.TRANSLATED?.known})`,
  )
  .join("\n")}
Use as many of these words as fit naturally into a single sentence. Never force a word that makes the sentence awkward.`,

  anchors: (literals) =>
    `Anchor material — EVERY sentence must contain at least one of these, in this form or a natural inflection of it:
${literals
  .map(
    (literal) =>
      `  ${literal.trait?.TRANSLATED?.learning} (${literal.trait?.TRANSLATED?.known})`,
  )
  .join("\n")}`,

  compose: (language, count, instructions) =>
    `Compose ${count} DISTINCT sentence pairs in ${language.learning.name}, each one clear sentence — no compounds, no run-ons.
Favor practical everyday scenarios: daily routine, conversation, opinions, directions.
Vary between statements, questions and negations across the set.
Pitch the complexity at the vocabulary pool and never above it.
Produce each sentence in both languages.${instructions ? `\n${instructions}` : ""}`,
};
