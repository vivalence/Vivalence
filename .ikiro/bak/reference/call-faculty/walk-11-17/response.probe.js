import { Controller, Cortex, shape, Span, v, Vector } from "@vivalence/typology";
import { Condition } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/prototypes/yield.js";

const { Turn, State } = v.primitives.hallucination;
const Usage = v.object({ input: v.integer(), output: v.integer(), cost: v.number().optional() }, { additionalProperties: false });
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

const Response = v.object(
  {
    condition: Condition.desc('How the request ended. Example: "NOMINAL"'),
    output: v
      .record(v.string(), v.unknown())
      .desc('The bag: message, object, entities by type. Example: { message: "ciao means hello" }'),
    turns: v.array(Turn).desc("The turns this request produced, in order."),
    meta: Meta.desc('Why and how it stopped. Example: { state: "complete", rounds: 1 }'),
  },
  { additionalProperties: false },
);

const faults = (held) => [...Response.errors(held)].map((fault) => `${fault.path || "/"} ${fault.message}`);
const tune = [0.5, 0.5, 0.5];
const calling = { role: "assistant", parts: [{ type: "tool_use", id: "call_1", name: "lookup", input: { query: "ciao" } }], meta: { state: "tools", usage: { input: 40, output: 9 } } };
const answering = { role: "assistant", parts: [{ type: "text", text: "ciao means hello" }], meta: { state: "complete", usage: { input: 71, output: 6 } } };
const script = [calling, answering];
let cursor = 0;
const cortex = new Cortex().register([{ type: "dialogue", id: "dialogue-1", tune, via: { render: async () => script[cursor++] } }]);
const tools = new Vector().open({ nature: "lookup", input: v.object({ query: v.string() }) }, async () => ({ message: "found", literal: [{ id: "l1", text: "ciao" }] }));
const held = await cortex.hallucinate.dialogue.render({ controller: new Controller({ stdout: new Span("probe") }), turns: [{ role: "user", parts: [{ type: "text", text: "what is ciao?" }] }], tools });
const { open, ...answer } = held;

console.log("=== the dialogue answer (S1 form), whole\n" + JSON.stringify(answer, null, 2));
console.log("Response faults:", JSON.stringify(faults(answer)));
console.log("today's five keys:", JSON.stringify(faults(held)));
console.log("a picture answer:", JSON.stringify(faults({ images: [], usage: {} })));
console.log("condition EXHAUSTED:", JSON.stringify(faults({ ...answer, condition: "EXHAUSTED" })), "· condition DONE:", JSON.stringify(faults({ ...answer, condition: "DONE" })));
console.log("Condition untouched by desc:", JSON.stringify(Condition));

const harness = new Vector();
harness.branch("/dialogue").open({ nature: "render", input: v.primitives.harness.Request, output: Response }, async () => answer);
const node = shape.strip(harness).branches.dialogue.branches.render.effect;
console.log("=== the strip's effect keys:", Object.keys(node).join(" · "));
console.log("=== what telemetry's output section holds (key · description):");
for (const [key, schema] of Object.entries(node.output.properties)) console.log(` ${node.output.required.includes(key) ? key : key + "?"} · ${schema.description}`);
