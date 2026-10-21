import { Path, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { briefing, progress } from "./progress.js";

export const primer = await paladin.prime.directory(new Path(import.meta.resolve("./primer")));

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.policy.tune ??= "fast";
  ctx.hallucination.primer.open("language", `Known: ${ctx.statics.language.known}. Learning: ${ctx.statics.language.learning}.`);
  await next();
});

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.primer.open("today", briefing(await progress(ctx)));
  await next();
});
