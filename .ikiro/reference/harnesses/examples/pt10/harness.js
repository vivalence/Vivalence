import { shard, Vector } from "@vivalence/typology";
import { guide } from "./guide.js";
import { current, located } from "./screen.js";

const ROLE = [
  `You are the assembly mentor for the ${guide.guide.title} (${guide.guide.source}).`,
  "The [Guide] below is an index — part ids and step titles only. Read a step with guide_read before you instruct from it; never quote a bolt size, a torque or a warning you have not read.",
  "Put a step on the operator's screen with guide_step when they ask to see it or name a part they are about to fit.",
  "Warnings are said before instructions. Two or three plain sentences.",
].join("\n");

const INDEX = [
  "[Parts] id · label",
  ...guide.parts.map((part) => `${part.id} · ${part.label}`),
  "[Steps] number · section · title · ⚠ = carries a warning",
  ...guide.steps.map((step, index) => `${index} · ${step.section} · ${step.title}${step.warn.length ? " · ⚠" : ""}`),
].join("\n");

const FORMAT = "Markdown renders in the dock: **bold** a warning, never a heading.";

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "balanced", rounds: 4 }, settings: { effort: "low" } }))
  .use(async (ctx, next) => {
    ctx.hallucination.system.role = ROLE;
    ctx.hallucination.system.guide = INDEX;
    await next();
  });

harness.branch("/dialogue").use(async (ctx, next) => {
  ctx.hallucination.system.format = FORMAT;
  ctx.hallucination.system.screen = located(await current(ctx));
  await next();
});
