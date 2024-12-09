import Mustache from "mustache";
import { ProvisioningPrompt } from "./lib/prompts.js";

export default async function provision(inputs, ctx) {
  const { scope, constraints, mask } = inputs;

  const input = {
    prompt: Mustache.render(ProvisioningPrompt.template, {
      constraints,
      goal: mask.prompt.goal,
    }),
    schema: ProvisioningPrompt.schema,
    provider: ProvisioningPrompt.provider,
  };

  const response = await ctx.runtime.services.llm(input);

  return { scope, instruction: { prose: response.prose } };
}
