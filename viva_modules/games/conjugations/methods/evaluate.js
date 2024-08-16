import Mustache from "mustache";
import { GamePrompt } from "./lib/prompts.js";

// export async function POST({ fetch, locals, request }) {
export default async function generate({ inputs, instruction, scope }, ctx) {
  const { language } = GamePrompt;

  const evaluateConjugation = async (conjugation) => {
    // TODO: use full annotation here
    const part = {
      input: inputs[conjugation.scope.unit.id],
      person: conjugation.person,
      number: conjugation.number,
      spoken: conjugation.spoken,
      learning: conjugation.learning,

      verb: instruction.verb.learning,
      tense: instruction.tense,
      language,
    };

    const prompt = Mustache.render(Prompt.template, part);

    const input = { prompt, schema: Prompt.schema, provider: Prompt.provider };
    const evaluation = await ctx.runtime.services.llm(input);

    // @lf i should rename this to /unit/review, evaluate or update or something
    await ctx.runtime.call("/units/review", {
      gameType: "CONJUGATIONS",
      response: evaluation.status,
      scope: { ...scope, tag: null, unit: { id: conjugation.scope.unit.id } },
    });
    for (const tag in conjugation.scope.unit.tags) {
      await ctx.runtime.call("/tags/review", {
        gameType: "CONJUGATIONS",
        response: evaluation.status,
        scope: {
          ...scope,
          unit: null,
          tag: { id: tag.id },
        },
      });
    }

    return {
      data: {
        index: conjugation.meta.index,
        unitId: conjugation.scope.unit.id,
        evaluation: evaluation.status,
      },
    };
  };

  const promises = instruction.conjugations.map(evaluateConjugation);
  const results = await Promise.all(promises);

  const evaluations = [
    results.reduce((acc, r) => {
      if (r.data && ["KNOWN", "GRADUATE"].includes(r.data.evaluation)) acc += 1;
      return acc;
    }, 0),
    results.length,
  ];

  for (const tag of scope.tags) {
    const result = await ctx.runtime.call("/tags/review", {
      gameType: "CONJUGATIONS",
      response: evaluations,
      scope: {
        ...scope,
        unit: null,
        game: { id: scope.game.id },
        tag: { id: tag.id },
      },
    });

    results.push(result);
  }

  return results;
}
