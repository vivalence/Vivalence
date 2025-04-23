import Mustache from "mustache";
import { GamePrompt } from "./lib/prompts.js";
import fs from "fs-extra";
import path from "node:path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const __filename = path.basename("instructions.json");
const __filepath = path.join(__dirname, __filename);

export default async function provision(inputs, ctx) {
  const { scope, constraints, mask } = inputs;

  // Render the prompt template with our enhanced context
  const prompt = Mustache.render(GamePrompt.template, {
    goal: mask.goal,
    constraints: processedConstraints,
    language: ctx.runtime.statics.language,
  });

  // Prepare input for the LLM
  const input = {
    prompt,
    schema: GamePrompt.schema,
    provider: GamePrompt.provider,
  };

  // Generate the sentence pair
  const sentence = await ctx.runtime.services.llm(input);

  // const topography = ctx.runtime.ontology.classify(signal)

  const tokens = await ctx.runtime.call("/classification/unitsFromText", {
    text: sentence.learning,
  });

  const instruction = {
    instruction: {
      sentence,
      pattern: patternUsed,
      tokens: tokens
        .map((token) => ({
          token: token.annotation.meta.token,
          start_char: token.annotation.meta.start_char,
          end_char: token.annotation.meta.end_char,
        }))
        .sort((a, b) => a.start_char - b.start_char),
    },
    scope: {
      ...scope,
      units: tokens
        .filter((t) => !!t.unit)
        .map((token) => ({
          id: token.unit.id,
          tags: token.unit.tags.map(({ id }) => ({ id })),
          token: {
            token: token.annotation.meta.token,
            start_char: token.annotation.meta.start_char,
            end_char: token.annotation.meta.end_char,
          },
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

  // Log generated instruction if debug mode is enabled
  if (mask.debug) {
    fs.appendFileSync(__filepath, JSON.stringify(instruction) + ",\n");
  }

  return [instruction];
}
