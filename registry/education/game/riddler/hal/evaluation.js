import { v } from "@vivalence/typology";
import { GRADES } from "../types.js";

const EVALUATION_RENDER_OUTPUT = v.object({
  grades: v.array(
    v.object({
      slug: v.slug().desc("The literal being graded."),
      grade: v.enum(GRADES).desc("The memory signal earned on this literal."),
    }),
  ),
});

const EVALUATION_EXAMPLES = [
  `"terça" — instant and exact → MASTERY`,
  `"quarta-feira" — correct, merely verbose; forgive over-specification → SUCCESS`,
  `"domigo" — correct word, swallowed a letter; forgive spelling → SUCCESS`,
  `"dezembro, óbvio" — correct with cheek → SUCCESS`,
  `"você quer o nome ou o número?" — a clarifying question, no answer yet → NEUTRAL`,
  `"January" — right meaning, wrong language → NEUTRAL`,
  `"my sister" — right meaning, wrong language → NEUTRAL`,
  `"avô" when the answer was avó — wrong by one feature → MISTAKE`,
  `"7" when the answer was sete — right value, wrong form; a word was asked → MISTAKE`,
  `"terça?" for a recall that lands on segunda — plausible but wrong → MISTAKE`,
  `"cinco" when a week has sete days — simply wrong → FAILURE`,
  `"não sei, me dá uma dica" — gave up → FAILURE`,
].join("\n");

export const evaluation = {
  output: EVALUATION_RENDER_OUTPUT,

  judge: (
    language,
    { riddle, answer, literals },
  ) => `You are the silent, impartial judge of a riddle duel played in ${language.learning} — grade the challenger's whole attempt, then say nothing to them.
The riddle was "${riddle}"; the expected answer was "${answer}".
Be forgiving of spelling, accents, and over-specification; be strict on wrong meaning. An answer in any language other than ${language.learning} scores no better than NEUTRAL — the language is part of the task.
Return ONE signal for each of these literals — MASTERY (instant, exact) · SUCCESS (correct) · NEUTRAL (clarify, partial, wrong language) · MISTAKE (wrong but close) · FAILURE (wrong, or gave up):
${literals.map((literal) => `  ${literal.slug}`).join("\n")}
These examples fix the VERDICT rules:
${EVALUATION_EXAMPLES}`,
};
