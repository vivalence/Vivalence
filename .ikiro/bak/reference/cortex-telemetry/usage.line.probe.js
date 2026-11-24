import { Controller, Vector, Span, belt } from "@vivalence/typology";
import { line } from "../../../subsystems/paladin/prototypes/telemetry.js";

async function* said() {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  yield { event: "/part/delta", index: 0, part: { text: "casa means house" } };
  yield { event: "/part/close", index: 0 };
  const usage = [
    { name: "input", unit: "tokens", amount: 60 },
    { name: "output", unit: "tokens", amount: 7 },
    { name: "cost", unit: "usd", amount: 0.002 },
  ];
  yield { event: "/turn/close", turn: { meta: { state: "complete", usage } } };
}

const controller = new Controller({ stdout: new Span("hallucination") });
const faculty = { type: "dialogue", provider: "bench", id: "bench/dialogue", via: { stream: said } };
const turns = [{ role: "user", parts: [{ type: "text", text: "what is casa" }] }];
const policy = { rounds: 5, backoff: [], tools: new Vector(), controller };
for await (const _packet of belt.hallucinate.respond(faculty, "stream", { turns }, policy));
for (const record of controller.stdout.history.filter((record) => record.track === "usage")) console.log(line(record));
