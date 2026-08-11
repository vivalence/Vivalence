import { Vector } from "@vivalence/typology";
import francesca from "./francesca.md" with { type: "text" };
import state from "./state.md" with { type: "text" };

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.policy.tune ??= "fast";
  ctx.hallucination.system.francesca = francesca;
  ctx.hallucination.system.state = state;
  await next();
});
