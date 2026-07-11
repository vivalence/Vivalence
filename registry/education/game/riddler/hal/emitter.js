import { v } from "@vivalence/typology";

const RIDDLER_RENDER_OUTPUT = v.object({
  riddles: v.array(
    v.object({
      riddle: v.string().desc("The riddle prompt — one sentence, LEARNING language."),
      answer: v.string().desc("The single expected answer, LEARNING language."),
      literals: v.array(v.slug()).desc("The slugs of the vocabulary this riddle depends on."),
    }),
  ),
});

const GENERATION_EXAMPLES = [
  `weekday, offset: "Que dia chega dois dias antes de quinta?" → terça`,
  `weekday, between: "Qual dia separa terça de quinta?" → quarta`,
  `weekday, after-rest: "Que dia descansa logo depois do sábado?" → domingo`,
  `weekday, recall-back: "Se hoje é quarta, que dia foi anteontem?" → segunda`,
  `number, count: "Quantos dias fecham uma semana?" → sete`,
  `number, sum: "Quanto é três mais quatro, em palavra?" → sete`,
  `month, opener: "Que mês abre o ano com fogos?" → janeiro`,
  `month, next: "Qual mês vem logo depois de março?" → abril`,
  `month, closer: "Que mês fecha o ano?" → dezembro`,
  `family, uncle: "Quem é o irmão do seu pai?" → tio`,
  `family, grandmother: "Quem é a mãe da sua mãe?" → avó`,
].join("\n");

export const emitter = {
  output: RIDDLER_RENDER_OUTPUT,

  identity: ({
    known,
    learning,
  }) => `You are the Riddler — a theatrical riddle-master who guards knowledge behind riddles.
You compose ONLY in ${learning}, the language the challenger is learning; never in ${known}, whatever tongue they answer in.
Each riddle is ONE sentence of plain prose — no markdown, no lists, no asterisks.
Vanity is your craft — you hold yourself the sharpest mind in the room and build every riddle to prove it, delighting in the small twist that makes a learner think rather than merely recall.`,

  subject: (
    pool,
  ) => `Build each riddle from a SUBSET of these words (slug · learning (known) · strength · status):
${pool
  .map(
    (literal) =>
      `  ${literal.slug} · ${literal.trait?.TRANSLATED?.learning} (${literal.trait?.TRANSLATED?.known}) · ${literal.memory?.strength ?? "new"} · ${literal.memory?.status ?? "UNTOUCHED"}`,
  )
  .join("\n")}`,

  ceiling: (
    sample,
  ) => `This is the learner's level, sampled across their vocabulary (slug · strength · status):
${sample
  .map(
    (literal) =>
      `  ${literal.slug} · ${literal.memory?.strength ?? "new"} · ${literal.memory?.status ?? "UNTOUCHED"}`,
  )
  .join("\n")}
Pitch every riddle at THIS level and never above it — no word harder than the learner already knows, and speak in their vocabulary.`,

  compose: (language, count, instructions) => `${
    count === 1
      ? `Compose ONE riddle in ${language.learning}.`
      : `Compose ${count} DISTINCT riddles in ${language.learning} — each on a different vocabulary subset, no two sharing an answer.`
  }
Every riddle demands understanding and transformation, never bare recall — an offset, a relation, a small sum.
Return per riddle: the riddle, the single expected answer, one hint that nudges without revealing, and the slugs it draws on.
These examples fix the VOICE and the difficulty — mirror them, scaled to the learner's level:
${GENERATION_EXAMPLES}${instructions ? `\n${instructions}` : ""}
Compose now.`,
};
