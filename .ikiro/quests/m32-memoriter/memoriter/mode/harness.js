import { Vector } from "@vivalence/typology";
import magister from "./hal/memoriter.md" with { type: "text" };

export const harness = new Vector().use(async (ctx, next) => {
  const language = ctx.daemon.statics?.language;
  ctx.hallucination.policy.tune ??= "fast";
  ctx.hallucination.system.magister = magister;
  if (language)
    ctx.hallucination.system.language =
      `Known: ${language.known?.name}. Learning: ${language.learning?.name}.`;
  await next();
});
