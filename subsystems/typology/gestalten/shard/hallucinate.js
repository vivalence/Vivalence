import { Vector, Span, belt, is, object, steer } from "@vivalence/typology";
import { v } from "../../schematics/v.js";
import { Tier, Tune } from "../../schematics/primitives/hallucination.js";

// hal is a typed fetch over the cortex — ONE record describes the whole call:
// { policy?, system?, turns, tools?, settings?, output?, cache? }. `policy` is
// the app-side half (tune → faculty resolution, rounds/backoff → the respond
// loop); it is validated here and STRIPPED by the lowering — the wire Request
// carries only provider keys. The other lowering: a `tools` Vector is cut to
// the wire catalog; the Vector itself never crosses.
export const POLICY = v.object({
  rounds: v.integer({ minimum: 1, default: 10 }),
  backoff: v.array(v.integer(), { default: [1000, 4000] }),
  tune: v.union([Tier, Tune]).optional(),
});

export const policing = (request) => {
  const policy = v.create(POLICY);
  v.cast(POLICY, object.assign(policy, request.policy ?? {}));
  const failure = [...v.errors(POLICY, policy)][0];
  if (failure)
    throw new Error(`[hallucination] invalid policy ${failure.path}: ${failure.message}`);
  return policy;
};

export const declarations = (tools) =>
  steer.trie.rollup(tools, () => null).map(({ pattern, steps }) => ({
    name: belt.hallucinate.nameOf(steps),
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
  }));

export const policyOf = (ctx, type, avenue) => ({
  rounds: ctx.policy.rounds,
  backoff: ctx.policy.backoff,
  tools: ctx.tools,
  span: ctx.span.branch(type).branch(avenue),
});

const faculty = (cortex, type, via, tune) => {
  const found = cortex.findOne({ type, tune, via });
  if (!found) throw new Error(`[hallucination] no '${type}' faculty resolves a '${via}' avenue`);
  return found;
};

export const lowering = () => async (ctx, next) => {
  const request = ctx.input ?? {};
  const policy = policing(request);

  const tools = is.Vector(request.tools) ? request.tools : new Vector();
  const catalog = is.Vector(request.tools) ? declarations(tools) : (request.tools ?? []);
  const marks = request.cache?.marks ?? [
    ...(request.system && Object.keys(request.system).length ? ["context"] : []),
    ...(catalog.length ? ["tools"] : []),
  ];

  ctx.policy = policy;
  ctx.tools = tools;
  ctx.span = new Span("/hallucination");
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
  ctx.policy = policing(request);
  ctx.span = new Span("/hallucination");
  ctx.input = {
    source: request.source,
    config: request.config ?? {},
    ...(request.harmonize && { harmonize: request.harmonize }),
  };
  await next();
};

export const rendering = (cortex, type) => async (ctx) => {
  ctx.output = await belt.hallucinate.render(
    faculty(cortex, type, "render", ctx.policy.tune),
    ctx.input,
    policyOf(ctx, type, "render"),
  );
};

export const streaming = (cortex, type) => (ctx) => {
  ctx.output = belt.hallucinate.respond(
    faculty(cortex, type, "stream", ctx.policy.tune),
    "stream",
    ctx.input,
    policyOf(ctx, type, "stream"),
  );
};

export const transcribing = (cortex) => (ctx) => {
  ctx.output = belt.hallucinate.transcribe(
    faculty(cortex, "verbatim", "stream", ctx.policy.tune),
    ctx.input,
    policyOf(ctx, "verbatim", "stream"),
  );
};

export const synthesizing = (cortex) => (ctx) => {
  ctx.output = belt.hallucinate.synthesize(
    faculty(cortex, "speech", "stream", ctx.policy.tune),
    ctx.input,
    policyOf(ctx, "speech", "stream"),
  );
};

export const vocalizing = (cortex) => async (ctx) => {
  ctx.output = await belt.hallucinate.vocalize(
    faculty(cortex, "speech", "render", ctx.policy.tune),
    ctx.input,
    policyOf(ctx, "speech", "render"),
  );
};
