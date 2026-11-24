import { v } from "@vivalence/typology";

const { State } = v.primitives.hallucination;
const stored = JSON.parse(await Deno.readTextFile(Deno.args[0])).map((held) => JSON.parse(held.meta));

const Usage = v.object(
  {
    input: v.integer(),
    output: v.integer(),
    cost: v.number().optional(),
  },
  { additionalProperties: false },
);
const Meta = v.object(
  {
    state: State.optional(),
    usage: Usage.optional(),
    rounds: v.integer().optional(),
    fault: v.object({ kind: v.string(), message: v.union([v.string(), v.null()]) }).optional(),
    provider: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: false },
);
const Open = v.object({ state: State.optional() }, { additionalProperties: true });

const DIALECTS = [
  [(usage) => "prompt_tokens" in usage, (usage) => ({ input: usage.prompt_tokens, output: usage.completion_tokens, cost: usage.cost })],
  [(usage) => "input_tokens" in usage, (usage) => ({ input: usage.input_tokens, output: usage.output_tokens })],
];
const normalized = (meta) => {
  const [, read] = DIALECTS.find(([test]) => test(meta.usage));
  return { ...meta, usage: read(meta.usage), provider: { ...meta.provider, usage: meta.usage } };
};
const painted = (meta) => (meta.usage === undefined ? "" : `${meta.usage.input} / ${meta.usage.output}`);
const count = (schema, metas) => metas.filter((meta) => [...schema.errors(meta)].length === 0).length;

console.log("stored metas", stored.length);
console.log("open bag (B) admits", count(Open, stored), "· telemetry paints", JSON.stringify([...new Set(stored.map(painted))].slice(0, 3)));
console.log("closed Meta (A) admits as stored", count(Meta, stored));
const healed = stored.map(normalized);
console.log("closed Meta (A) admits normalized", count(Meta, healed), "· telemetry paints", JSON.stringify(healed.slice(0, 3).map(painted)));
for (const dialect of ["prompt_tokens", "input_tokens"]) {
  const one = stored.find((meta) => dialect in meta.usage);
  console.log(`--- ${dialect}: stored\n${JSON.stringify(one, null, 2)}\n--- normalized (A)\n${JSON.stringify(normalized(one), null, 2)}`);
}
