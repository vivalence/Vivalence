import { Controller, Vector, Span, belt } from "@vivalence/typology";

const span = new Span("hallucination");
const before = [...span.tracked.patterns].length;
const USAGE = new Vector().open("usage", () => {});
const started = performance.now();
for (let index = 0; index < 10000; index += 1) span.tracks(USAGE);
const each = (performance.now() - started) / 10000;
console.log("patterns before", before, "after 10000 grafts", [...span.tracked.patterns].length, "ms per graft", each.toFixed(5));

async function* said() {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  yield { event: "/part/delta", index: 0, part: { text: "casa" } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/part/open", index: 1, part: { type: "text", text: "" } };
  yield { event: "/part/delta", index: 1, part: { text: "house" } };
  yield { event: "/part/close", index: 1 };
  yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
}
const states = (controller) => controller.stdout.history.filter((record) => record.track === "usage").map((record) => record.data.state ?? "running");
const faculty = (type) => ({ type, provider: "bench", id: `bench/${type}`, via: { stream: said } });
const turns = [{ role: "user", parts: [{ type: "text", text: "hi" }] }];

const left = new Controller({ stdout: new Span("hallucination") });
for await (const packet of belt.hallucinate.respond(faculty("dialogue"), "stream", { turns }, { rounds: 5, backoff: [], tools: new Vector(), controller: left }))
  if (packet.event === "/part/close") break;
console.log("respond, listener leaves after a part:", states(left));

const aborted = new Controller({ stdout: new Span("hallucination") });
for await (const packet of belt.hallucinate.respond(faculty("dialogue"), "stream", { turns }, { rounds: 5, backoff: [], tools: new Vector(), controller: aborted }))
  if (packet.event === "/part/close") aborted.abort.abort();
console.log("respond, controller aborted after a part:", states(aborted));

const ear = new Controller({ stdout: new Span("hallucination") });
for await (const packet of belt.hallucinate.transcribe(faculty("verbatim"), { source: (async function* () {})() }, { controller: ear }))
  if (packet.event === "/part/close") break;
console.log("transcribe, listener leaves after a part:", states(ear));
