import { Controller, Cortex, fromm, Span, v } from "@vivalence/typology";

const { Part } = v.primitives.hallucination;
const Usage = v.object({ input: v.integer(), output: v.integer(), cost: v.number().optional() }, { additionalProperties: false });
const Meta = v.object({ usage: Usage.optional(), provider: v.record(v.string(), v.unknown()).optional() }, { additionalProperties: false });
const Picture = v.object({
  images: v.array(Part.Image),
  revised: v.string().optional(),
  provider: v.string().optional(),
  id: v.string().optional(),
  meta: Meta.optional(),
}, { additionalProperties: false });

const vendor = { prompt_tokens: 12, completion_tokens: 4160, cost: 0.04 };
const tune = [0.5, 0.5, 0.5];
const cortex = new Cortex().register([
  { type: "picture", id: "picture-1", tune, via: { render: async () => ({ images: [{ type: "image", media: "image/png", data: "iVBORw0KGgo" }], meta: { usage: { input: 12, output: 4160, cost: 0.04 }, provider: { usage: vendor } } }) } },
]);
const after = await cortex.hallucinate.picture.render({ controller: new Controller({ stdout: new Span("probe") }), policy: {}, prompt: "a red fox", images: [] });
console.log(JSON.stringify(after, null, 2));
console.log("faults", [...Picture.errors(after)].length, "· fromm.yield reads", fromm.yield(after).kind);
