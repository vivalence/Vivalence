import { Vector } from "@vivalence/typology";
import { machine, posture } from "./tools/index.js";
import { RENDER } from "./page/style.js";

export const harness = new Vector();

harness.use(async (ctx, next) => {
  ctx.hallucination.system.machine = machine(posture(ctx));
  ctx.hallucination.system.render = RENDER;
  await next();
});
