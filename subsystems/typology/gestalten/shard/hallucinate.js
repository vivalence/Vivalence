import { Vector, belt, is, steer } from "@vivalence/typology";

export const routing = (steps) => {
  const [avenue, via] = steps.slice(-2).map((step) => step.nature);
  return { avenue, via };
};

export const declarations = (tools) =>
  steer.trie.rollup(tools, () => null).map(({ pattern, steps }) => ({
    name: belt.hallucinate.nameOf(steps),
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
  }));

export const policyOf = (ctx) => ({ ...ctx.policy, tools: ctx.tools, controller: ctx.controller });

const faculty = (cortex, type, via, tune) => {
  const found = cortex.findOne({ type, tune, via });
  if (!found) throw new Error(`[hallucination] no '${type}' faculty resolves a '${via}' avenue`);
  return found;
};

export const lowering = () => async (ctx, next) => {
  const request = ctx.input ?? {};
  const tools = is.Vector(request.tools) ? request.tools : new Vector();
  const catalog = is.Vector(request.tools) ? declarations(tools) : (request.tools ?? []);
  const marks = ctx.policy.cache?.marks ?? [
    ...(request.system && Object.keys(request.system).length ? ["context"] : []),
    ...(catalog.length ? ["tools"] : []),
  ];

  ctx.tools = tools;
  ctx.input = {
    ...(request.system && { system: request.system }),
    turns: request.turns ?? [],
    ...(catalog.length && { tools: catalog }),
    ...(marks.length && { cache: { marks } }),
    ...(request.settings && { settings: request.settings }),
    ...(request.output && { output: request.output }),
  };
  await next();
};

export const sourcing = () => async (ctx, next) => {
  const request = ctx.input ?? {};
  ctx.input = { source: request.source, settings: request.settings ?? {} };
  await next();
};

export const rendering = (cortex, type) => async (ctx) => {
  ctx.output = await belt.hallucinate.render(faculty(cortex, type, "render", ctx.policy.tune), ctx.input, policyOf(ctx));
};

export const streaming = (cortex, type) => (ctx) => {
  ctx.output = belt.hallucinate.respond(faculty(cortex, type, "stream", ctx.policy.tune), "stream", ctx.input, policyOf(ctx));
};

export const transcribing = (cortex, via = "stream") => (ctx) => {
  const verb = via === "render" ? "transcript" : "transcribe";
  ctx.output = belt.hallucinate[verb](faculty(cortex, "verbatim", via, ctx.policy.tune), ctx.input, policyOf(ctx));
};

export const synthesizing = (cortex) => (ctx) => {
  ctx.output = belt.hallucinate.synthesize(faculty(cortex, "speech", "stream", ctx.policy.tune), ctx.input, policyOf(ctx));
};

export const vocalizing = (cortex) => async (ctx) => {
  ctx.output = await belt.hallucinate.vocalize(faculty(cortex, "speech", "render", ctx.policy.tune), ctx.input, policyOf(ctx));
};
