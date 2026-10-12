import { Vector } from "@vivalence/typology";
import magister from "./hal/memo.md" with { type: "text" };
import { briefing, progress } from "./progress.js";

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.policy.tune ??= "fast";
  ctx.hallucination.system.magister = magister;
  ctx.hallucination.system.language = `Known: ${ctx.statics.language.known}. Learning: ${ctx.statics.language.learning}.`;
  await next();
});

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.today = briefing(await progress(ctx));
  await next();
});
