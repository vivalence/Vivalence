import Mustache from "mustache";
import { GamePrompt } from "./lib/prompts.js";

export default async function (inputs, ctx) {
  const { scope, prompt, mask, language } = inputs;

  const input = {
    prompt: Mustache.render(GamePrompt.template, {
      prompt,
      language,
      // innerPrompt: mask.prompt.inner,
    }),
    schema: GamePrompt.schema,
    provider: GamePrompt.provider,
  };

  const prose = await ctx.runtime.services.llm(input);

  const instruction = {
    type: "PROSE",
    instruction: { prose },
    scope: { ...scope },
  };

  return instruction;
}
