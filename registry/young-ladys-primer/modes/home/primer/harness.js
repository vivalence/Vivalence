import { Vector } from "@vivalence/typology";
import * as hal from "./hal/index.js";

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.narrator = [
    hal.narrator.identity,
    hal.narrator.mission,
    hal.narrator.form,
  ].join("\n\n");
  await next();
});
