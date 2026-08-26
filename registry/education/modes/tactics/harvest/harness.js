import { Vector } from "@vivalence/typology";
import archivist from "./hal/archivist.md" with { type: "text" };

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.policy.tune ??= "capable";
  ctx.hallucination.system.archivist = archivist;
  await next();
});
