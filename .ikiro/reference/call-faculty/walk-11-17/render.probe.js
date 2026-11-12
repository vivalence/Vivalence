import { Controller, Cortex, fromm, is, Span, v, Vector } from "@vivalence/typology";

const { Turn, State, Picture, Choice } = v.primitives.hallucination;
const print = (title, held) => console.log(`=== ${title}\n${JSON.stringify(held, null, 2)}`);
const controller = () => new Controller({ stdout: new Span("probe") });
const tune = [0.5, 0.5, 0.5];

const calling = { role: "assistant", parts: [{ type: "tool_use", id: "call_1", name: "lookup", input: { query: "ciao" } }], meta: { state: "tools", usage: { input: 40, output: 9 } } };
const answering = { role: "assistant", parts: [{ type: "text", text: "ciao means hello" }], meta: { state: "complete", usage: { input: 71, output: 6 } } };
const graded = { role: "assistant", parts: [{ type: "object", data: { verdict: "right", grade: 0.9 } }], meta: { state: "complete", usage: { input: 30, output: 12 } } };
const script = [calling, answering];
let cursor = 0;

const cortex = new Cortex().register([
  { type: "dialogue", id: "dialogue-1", tune, via: { render: async () => script[cursor++] } },
  { type: "object", id: "object-1", tune, via: { render: async () => graded } },
  { type: "picture", id: "picture-1", tune, via: { render: async () => ({ images: [{ type: "image", media: "image/png", data: "iVBORw0KGgo" }], usage: { prompt_tokens: 12, completion_tokens: 4160, cost: 0.04 } }) } },
  { type: "choice", id: "choice-1", tune, options: 26, choices: 1, via: { render: async () => ({ same: { yes: 0.03, partly: 0.96, no: 0.01 } }) } },
  { type: "speech", id: "speech-1", tune, via: { render: async () => new Uint8Array([73, 68, 51, 4]) } },
  { type: "verbatim", id: "verbatim-1", tune, via: { stream: async function* () { yield { event: "/verbatim/final", segment: 0, transcript: "ciao a tutti" }; } } },
]);

const tools = new Vector().open({ nature: "lookup", input: v.object({ query: v.string() }) }, async () => ({ message: "found", literal: [{ id: "l1", text: "ciao" }] }));
const turns = [{ role: "user", parts: [{ type: "text", text: "what is ciao?" }] }];

const answers = {
  dialogue: await cortex.hallucinate.dialogue.render({ controller: controller(), turns, tools }),
  object: await cortex.hallucinate.object.render({ controller: controller(), turns, output: { schema: v.object({ verdict: v.string(), grade: v.number() }) } }),
  picture: await cortex.hallucinate.picture.render({ controller: controller(), policy: {}, prompt: "a red fox", images: [] }),
  choice: await cortex.hallucinate.choice.render({ controller: controller(), system: { judge: "judge" }, questions: { same: { ask: "same?", options: { yes: null, partly: null, no: null } } } }),
  speech: await cortex.hallucinate.speech.render({ controller: controller(), source: "buongiorno" }),
  verbatim: await cortex.hallucinate.verbatim.render({ controller: controller(), source: (async function* () {})() }),
};

const Response = v.object(
  {
    condition: v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]),
    output: v.record(v.string(), v.unknown()),
    turns: v.array(Turn),
    meta: v.object({ state: State, rounds: v.integer() }, { additionalProperties: true }),
  },
  { additionalProperties: false },
);
const faults = (schema, held) => [...schema.errors(held)].map((fault) => `${fault.path || "/"} ${fault.message}`);

for (const [name, held] of Object.entries(answers)) {
  const shown = held instanceof Uint8Array ? `Uint8Array(${held.length})` : held;
  print(`${name} · render · what the caller holds`, shown);
  const yielded = fromm.yield(held);
  console.log(`keys ${typeof held === "object" && !(held instanceof Uint8Array) ? Object.keys(held).join(" · ") : typeof held} | is.yieldish ${is.yieldish(held)} | fromm.yield reads it as "${yielded.kind}" | m26 Response faults ${JSON.stringify(faults(Response, held).slice(0, 3))}`);
}

const { open, ...four } = answers.dialogue;
console.log("=== the dialogue answer without `open` against m26's Response:", JSON.stringify(faults(Response, four)), "· open was", JSON.stringify(open));
console.log("=== Picture.Response holds the picture answer:", JSON.stringify(faults(Picture.Response, answers.picture)), "· Choice.Verdict holds the choice answer:", JSON.stringify(faults(Choice.Verdict, answers.choice)));

const read = ({ open, ...response }) => response;
print("object · render · read off the fold's state (S1)", read(answers.object));
console.log("faults", JSON.stringify(faults(Response, read(answers.object))), "· is.yieldish", is.yieldish(read(answers.object)), "· fromm.yield", fromm.yield(read(answers.object)).kind, "· output.object", JSON.stringify(read(answers.object).output.object));
