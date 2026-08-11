import { v } from "@vivalence/typology";

export const GRADES = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

const JUDGE_RENDER_OUTPUT = v.object({
  overall: v.object({
    grade: v.enum(GRADES).desc("The signal the whole attempt earned."),
    feedback: v.string().desc("One brief sentence summarizing the attempt. Empty when perfect."),
  }),
  tokens: v.array(
    v.object({
      index: v.integer().desc("Index into the expected token list."),
      grade: v.enum(GRADES).desc("The signal this token earned."),
      correction: v.string().desc("What the learner should have written. Empty unless wrong."),
      feedback: v.string().desc("One concise sentence about this token. Empty unless wrong."),
    }),
  ),
});

const JUDGE_EXAMPLES = [
  `expected "eu falo português" · wrote "eu falo português" — instant and exact → MASTERY`,
  `expected "eu quero água" · wrote "quero água" — subject dropped, natural in the language → SUCCESS`,
  `expected "a casa é bonita" · wrote "a casa e bonita" — accent swallowed; forgive spelling → SUCCESS`,
  `expected "eu gosto de café" · wrote "eu adoro café" — acceptable alternative, stronger register → NEUTRAL`,
  `expected "onde fica o banheiro" · wrote "where is the bathroom" — right meaning, wrong language → NEUTRAL`,
  `expected "ele come pão" · wrote "ele comeu pão" — wrong tense on the verb → MISTAKE`,
  `expected "nós vamos à praia" · wrote "nós vamos" — content word missing → MISTAKE`,
  `expected "eu tenho dois irmãos" · wrote "eu tenho dois carros" — meaning changed → FAILURE`,
  `expected anything · wrote "não sei" — gave up → FAILURE`,
].join("\n");

export const judge = {
  output: JUDGE_RENDER_OUTPUT,

  rubric: (language, { typed, known, learning, recall, tokens }) =>
    `You are the silent, impartial judge of one translation attempt, ${
      recall === "KNOWN" ? `${language.learning.name} into ${language.known.name}` : `${language.known.name} into ${language.learning.name}`
    }.

Prompt (${recall === "KNOWN" ? language.learning.name : language.known.name}): "${recall === "KNOWN" ? learning : known}"
Expected (${recall === "KNOWN" ? language.known.name : language.learning.name}): "${recall === "KNOWN" ? known : learning}"
The learner wrote: "${typed}"

Grade EACH expected token below, in order, and then the attempt as a whole:
${tokens.map((token, index) => `  [${index}] "${token.form}"${token.gloss ? ` (${token.gloss})` : ""}`).join("\n")}

Ignore capitalization and minor punctuation. Punctuation-only tokens pass unless the sentence structure is broken.
Give correction and feedback ONLY where the token is wrong; leave them empty otherwise.
These examples fix the VERDICT rules:
${JUDGE_EXAMPLES}`,
};
