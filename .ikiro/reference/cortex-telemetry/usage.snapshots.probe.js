import { Controller, Vector, Span, belt, v } from "@vivalence/typology";

const { respond, transcribe, converse, synthesize, vocalize, depict, choose } = belt.hallucinate;
const { Usage } = v.primitives.track;

const tenth = btoa(String.fromCharCode(...new Uint8Array(3200)));
const pcm = () => ({ event: "/audio/packet", audio: { data: tenth, rate: 16000, codec: "pcm_16000" } });
const tokens = (input, output) => [
  { name: "input", unit: "tokens", amount: input },
  { name: "output", unit: "tokens", amount: output },
];
const bench = (type, via) => ({ type, provider: "bench", id: `bench/${type}`, via });
const hallucination = () => new Controller({ stdout: new Span("hallucination") });

async function* said(texts, usage) {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  for (const text of texts) yield { event: "/part/delta", index: 0, part: { text } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", turn: { meta: { state: "complete", ...(usage ? { usage } : {}) } } };
}
async function* microphone(packets) {
  yield* packets;
}
const drained = async (packets) => {
  for await (const _packet of packets);
};

const show = (name, controller) => {
  const records = controller.stdout.history.filter((record) => record.track === "usage").map((record) => record.data);
  const faults = records.flatMap((record) => [...Usage.errors(record)]).length;
  console.log(`## ${name} — ${records.length} records, ${faults} faults`);
  console.log(JSON.stringify(records.at(-1), null, 2));
};

const user = { role: "user", parts: [{ type: "text", text: "what is casa" }] };

{
  const controller = hallucination();
  const faculty = bench("dialogue", {
    stream: () => said(["casa means ", "house"], [...tokens(60, 7), { name: "cost", unit: "usd", amount: 0.002 }]),
  });
  await drained(respond(faculty, "stream", { turns: [user] }, { rounds: 5, backoff: [], tools: new Vector(), controller }));
  show("respond · dialogue", controller);
}
{
  const controller = hallucination();
  const faculty = bench("verbatim", {
    stream: async function* ({ source }) {
      await drained(source);
      yield* said(["ciao"]);
    },
  });
  await drained(transcribe(faculty, { source: microphone([pcm(), pcm()]) }, { controller }));
  show("transcribe · verbatim", controller);
}
{
  const controller = hallucination();
  const faculty = bench("call", {
    stream: async function* ({ source }) {
      await drained(source);
      yield* said(["ciao"], tokens(9, 2));
      yield pcm();
      yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
    },
  });
  await drained(converse(faculty, { source: microphone([pcm()]), turns: [] }, { controller, tools: new Vector() }));
  show("converse · call", controller);
}
{
  const controller = hallucination();
  const faculty = bench("speech", {
    stream: async function* () {
      yield pcm();
      yield pcm();
      yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
    },
  });
  await drained(synthesize(faculty, { source: "ciao a tutti" }, { controller }));
  show("synthesize · speech", controller);
}
{
  const controller = hallucination();
  await vocalize(bench("speech", { render: async () => new Uint8Array(9000) }), { source: "ciao a tutti" }, { controller });
  show("vocalize · speech", controller);
}
{
  const controller = hallucination();
  const faculty = bench("picture", {
    render: async () => ({
      images: [{ type: "image", mime: "image/png", data: "iVBOR" }],
      meta: { usage: [{ name: "cost", unit: "usd", amount: 0.04 }] },
    }),
  });
  await depict(faculty, { prompt: "a red fox", images: [] }, { controller });
  show("depict · picture", controller);
}
{
  const controller = hallucination();
  const round = { system: {}, questions: { same: { type: "noul", ask: "same?" }, ok: { type: "noul", ask: "ok?" } } };
  await choose(bench("choice", { render: async () => ({ same: 0.9, ok: 0.1 }) }), round, { controller });
  show("choose · choice", controller);
}
