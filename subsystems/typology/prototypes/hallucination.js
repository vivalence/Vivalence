import { Vector, Span, is, object, shape, shard, steer } from "@vivalence/typology";
import { v } from "../schematics/v.js";
import { Tier, Tune, Packet, Verbatim, Audio } from "../schematics/primitives/hallucination.js";

// hal is a typed fetch over the cortex — ONE record describes the whole call:
// { policy?, system?, turns, tools?, settings?, output?, cache? }. `policy` is
// the app-side half (tune → faculty resolution, rounds/backoff → the respond
// loop); it is validated here and STRIPPED by the lowering — the wire Request
// carries only provider keys. The other lowering: a `tools` Vector is cut to
// the wire catalog; the Vector itself never crosses.
const POLICY = v.object({
  rounds: v.integer({ minimum: 1, default: 10 }),
  backoff: v.array(v.integer(), { default: [1000, 4000] }),
  tune: v.union([Tier, Tune]).optional(),
});

export function Hallucination(cortex) {
  const resolveFaculty = (type, via, tune) => {
    const faculty = cortex.findOne({ type, tune, via });
    if (!faculty)
      throw new Error(`[hallucination] no '${type}' faculty resolves a '${via}' avenue`);
    return faculty;
  };

  const declarations = (tools) =>
    steer.trie.rollup(tools, () => null).map(({ pattern, steps }) => ({
      name: shard.hallucinate.nameOf(steps),
      ...(pattern.valence && { valence: pattern.valence }),
      ...(pattern.input && { input: pattern.input }),
    }));

  const policyOf = (ctx, type, avenue) => ({
    rounds: ctx.policy.rounds,
    backoff: ctx.policy.backoff,
    tools: ctx.tools,
    span: ctx.span.branch(type).branch(avenue),
  });

  const policing = (request) => {
    const policy = v.create(POLICY);
    v.cast(POLICY, object.assign(policy, request.policy ?? {}));
    const failure = [...v.errors(POLICY, policy)][0];
    if (failure)
      throw new Error(`[hallucination] invalid policy ${failure.path}: ${failure.message}`);
    return policy;
  };

  const lowering = async (ctx, next) => {
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

  const sourcing = async (ctx, next) => {
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

  const rendering = (type) => async (ctx) => {
    ctx.output = await shard.hallucinate.render(
      resolveFaculty(type, "render", ctx.policy.tune),
      ctx.input,
      policyOf(ctx, type, "render"),
    );
  };

  const streaming = (type) => (ctx) => {
    ctx.output = shard.hallucinate.respond(
      resolveFaculty(type, "stream", ctx.policy.tune),
      "stream",
      ctx.input,
      policyOf(ctx, type, "stream"),
    );
  };

  const transcribing = (ctx) => {
    ctx.output = shard.hallucinate.transcribe(
      resolveFaculty("verbatim", "stream", ctx.policy.tune),
      ctx.input,
      policyOf(ctx, "verbatim", "stream"),
    );
  };

  const synthesizing = (ctx) => {
    ctx.output = shard.hallucinate.synthesize(
      resolveFaculty("speech", "stream", ctx.policy.tune),
      ctx.input,
      policyOf(ctx, "speech", "stream"),
    );
  };

  const vocalizing = async (ctx) => {
    ctx.output = await shard.hallucinate.vocalize(
      resolveFaculty("speech", "render", ctx.policy.tune),
      ctx.input,
      policyOf(ctx, "speech", "render"),
    );
  };

  const hallucinator = new Vector();

  for (const avenue of ["dialogue", "object"]) {
    hallucinator
      .branch(`/${avenue}`)
      .use(lowering)
      .open({ nature: "stream", yields: Packet.Response }, streaming(avenue))
      .open("render", rendering(avenue));
  }

  hallucinator
    .branch("/verbatim")
    .use(sourcing)
    .open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, transcribing);

  hallucinator
    .branch("/speech")
    .use(sourcing)
    .open({ nature: "stream", yields: Audio.Any }, synthesizing)
    .open("render", vocalizing);

  return shape.object(hallucinator, steer.strategy.echo);
}
