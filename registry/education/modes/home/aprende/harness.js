import { Vector } from "@vivalence/typology";

import * as hal from "./hal/index.js";

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.tutor = [
    hal.tutor.identity,
    hal.tutor.mission,
    hal.tutor.capabilities,
    hal.tutor.language(ctx.daemon.statics?.language),
  ].join("\n\n");
  await next();
});
