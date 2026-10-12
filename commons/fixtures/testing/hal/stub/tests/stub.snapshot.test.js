import { soma, specimen } from "@vivalence/typology";
import { join } from "@std/path";
import provider from "../provider/index.js";

const { describe, it, expect } = specimen;

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    Deno.mkdirSync(SNAPSHOTS, { recursive: true });
    specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  }
  expect(pojo).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file))));
  return pojo;
}

const said = (text) => ({ role: "user", parts: [{ type: "text", text }] });
const answered = (name) => ({ role: "user", parts: [{ type: "tool_result", id: "x", name }] });
const drain = async (packets) => {
  const held = [];
  for await (const packet of packets) held.push(packet);
  return held;
};

const TOOLS = [{ name: "srs_lookup" }, { name: "session" }];

const RUNS = {
  "a plain line": { turns: [said("salve --pace 1ms")] },
  "three deltas": { turns: [said("salve --deltas 3 --pace 1ms")] },
  "a tool round": { tools: TOOLS, turns: [said("salve --tool session --pace 1ms")] },
  "the answer after the tool round": { tools: TOOLS, turns: [said("salve --tool session --pace 1ms"), answered("session")] },
  "two rounds, the second": { tools: TOOLS, turns: [said("salve --tool srs_lookup --rounds 2 --pace 1ms"), answered("srs_lookup")] },
  "two rounds, the answer": { tools: TOOLS, turns: [said("salve --tool srs_lookup --rounds 2 --pace 1ms"), answered("srs_lookup"), answered("srs_lookup")] },
  "a sealed turn": { turns: [said("salve --close length --pace 1ms")] },
};

describe("stub · every scripted run, packet by packet and folded", () => {
  it("the dialogue faculty at its deepest tune, one request per run", async () => {
    const [deep] = await provider({ statics: {} });
    const runs = {};
    for (const [name, request] of Object.entries(RUNS)) {
      const packets = await drain(deep.via.stream(request));
      runs[name] = { packets, folded: packets.reduce((turn, packet) => soma.pour(turn, packet), null) };
    }
    const pinned = pin(runs, "stub-runs.snapshot.json");
    expect(pinned["a tool round"].folded.parts.map((part) => part.type)).toEqual(["tool_use"]);
  });

  it("the same request twice is the same stream", async () => {
    const [deep] = await provider({ statics: {} });
    const request = RUNS["two rounds, the second"];
    expect(await drain(deep.via.stream(request))).toEqual(await drain(deep.via.stream(request)));
  });
});
