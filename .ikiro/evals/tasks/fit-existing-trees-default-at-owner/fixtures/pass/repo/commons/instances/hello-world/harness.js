import { Vector } from "@vivalence/typology";
import { machine, standing } from "./tools/index.js";
import { RENDER } from "./page/style.js";

export const FORMAT = "The dock renders markdown.";

export const harness = new Vector();

harness.use(async (ctx, next) => {
  ctx.hallucination.system.machine = machine(standing(ctx));
  ctx.hallucination.system.render = RENDER;
  await next();
});

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.format = FORMAT;
  ctx.hallucination.policy.rounds = 4;
  await next();
});
