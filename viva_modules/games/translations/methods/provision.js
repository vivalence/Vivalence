import Mustache from "mustache";
import { GamePrompt } from "./lib/prompts.js";

export default async function (inputs, ctx) {
  const { scope, constraints, mask, language } = inputs;

  const prompt = Mustache.render(GamePrompt.template, {
    constraints,
    language,
    innerPrompt: mask.prompt.inner,
  });

  const input = { prompt, schema: GamePrompt.schema, provider: GamePrompt.provider };

  const sentence = await ctx.runtime.services.llm(input);

  const tokens = await ctx.runtime.call("/classification/unitsFromText", {
    text: sentence.learning,
  });

  const instruction = {
    type: "TRANSLATIONS",
    instruction: {
      sentence, // @lj TODO for feedback: deconstruct the sentence and send the deconstruction
    },
    scope: {
      ...scope,
      units: tokens
        .filter((t) => !!t.unit)
        .map((token) => ({
          id: token.unit.id,
          token: token.annotation.meta.token,
          start_char: token.annotation.meta.start_char,
          end_char: token.annotation.meta.end_char,
          tags: token.unit.tags.map(({ id }) => ({ id })),
        })),
      tags: Array.from(
        tokens.reduce((acc, token) => {
          token.unit?.tags?.forEach(({ id }) => {
            if (!acc.has(id)) acc.add(id);
          });
          return acc;
        }, new Set()),
      ).map((id) => ({ id })),
    },
  };

  return instruction;
}
