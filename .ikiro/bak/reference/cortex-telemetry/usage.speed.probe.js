import { Controller, Vector, Span, belt } from "@vivalence/typology";
import { speed } from "../../../systems/anima/src/skins/chrome/panels/sidebar/sections.js";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function* said() {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  await pause(300);
  for (const [index, type] of ["thinking", "text"].entries()) {
    yield { event: "/part/open", index, part: { type, text: "" } };
    for (let word = 0; word < 12; word += 1) {
      await pause(50);
      yield { event: "/part/delta", index, part: { text: "parola " } };
    }
    yield { event: "/part/close", index };
  }
  const usage = [
    { name: "input", unit: "tokens", amount: 60 },
    { name: "output", unit: "tokens", amount: 40 },
  ];
  yield { event: "/turn/close", turn: { meta: { state: "complete", usage } } };
}

const controller = new Controller({ stdout: new Span("hallucination") });
const faculty = { type: "dialogue", provider: "bench", id: "bench/dialogue", via: { stream: said } };
const turns = [{ role: "user", parts: [{ type: "text", text: "go" }] }];
const policy = { rounds: 5, backoff: [], tools: new Vector(), controller };
const RING = 12;
const seen = [];
for await (const packet of belt.hallucinate.respond(faculty, "stream", { turns }, policy)) {
  if (packet.event !== "/part/close" && packet.event !== "/part/open") continue;
  const activity = { status: "RUNNING", steps: controller.stdout.history.slice(-RING) };
  seen.push(`${packet.event} ${packet.index}: ${speed([activity])}`);
}
console.log(seen.join("\n"));
console.log("no usage yet:", speed([{ status: "RUNNING", steps: [] }]), "· nothing running:", speed([{ status: "DONE", steps: [] }]));
console.log(JSON.stringify(controller.stdout.history.filter((record) => record.track === "usage")[0]));
