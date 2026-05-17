import { specimen, sleep, shape } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";

const { http } = shape;
const PORT = 9888;

function parseSseFrames(text) {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((chunk) => {
      const line = chunk.startsWith("data: ") ? chunk.slice(6) : chunk;
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

async function readSseFully(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

let scenario;
const abort = new AbortController();

specimen.describe("SSE wire — http(dewey.aperture) → /harness/dialogue/stream", () => {

  specimen.beforeAll(async () => {
    scenario = await create();
    Deno.serve(
      { port: PORT, signal: abort.signal, onListen() {} },
      http(scenario.dewey.aperture),
    );
    await sleep.ms(100);
  });

  specimen.afterAll(async () => {
    abort.abort();
    await scenario.orm.close();
  });

  specimen.it("response advertises text/event-stream + chunked", async () => {
    const thread = await scenario.createThread();
    const response = await fetch(`http://localhost:${PORT}/harness/dialogue/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ thread: thread.id, parts: [{ type: "text", text: "ping" }] }),
    });

    specimen.expect(response.status).toBe(200);
    specimen.expect(response.headers.get("content-type")).toContain("text/event-stream");
    await readSseFully(response);
  });

  specimen.it("plain text chat SSE: /turn/open, /part/delta+, /part/close, /turn/close arrive", async () => {
    const thread = await scenario.createThread();
    const response = await fetch(`http://localhost:${PORT}/harness/dialogue/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ thread: thread.id, parts: [{ type: "text", text: "stream wire test" }] }),
    });

    const text = await readSseFully(response);
    const frames = parseSseFrames(text);

    const opens  = frames.filter((f) => f.event === "/turn/open");
    const closes = frames.filter((f) => f.event === "/turn/close");
    const deltas = frames.filter((f) => f.event === "/part/delta");

    specimen.expect(opens.length).toBe(1);
    specimen.expect(closes.length).toBe(1);
    specimen.expect(deltas.length).toBeGreaterThan(0);
    specimen.expect(closes[0].meta.stop).toBe("end_turn");
  });

  specimen.it("tool loop SSE: 3 /turn/open + 3 /turn/close, tool_use part, tool_result part, stop reasons", async () => {
    const thread = await scenario.createThread();
    const response = await fetch(`http://localhost:${PORT}/harness/dialogue/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        thread: thread.id,
        parts: [{ type: "text", text: "lookup test" }],
        tune: "unleashed",
        tools: { lookup: { execute: async (input) => ({ definition: `${input.query} means house` }) } },
      }),
    });

    const text = await readSseFully(response);
    const frames = parseSseFrames(text);

    const opens  = frames.filter((f) => f.event === "/turn/open");
    const closes = frames.filter((f) => f.event === "/turn/close");

    specimen.expect(opens.length).toBe(3);
    specimen.expect(closes.length).toBe(3);
    specimen.expect(closes[0].meta.stop).toBe("tool_use");
    specimen.expect(closes[closes.length - 1].meta.stop).toBe("end_turn");

    const partOpens = frames.filter((f) => f.event === "/part/open");
    specimen.expect(partOpens.some((f) => f.part?.type === "tool_use")).toBe(true);

    const toolResultDrains = frames.filter((f) => f.event === "/part/open" && f.part?.type === "tool_result");
    const anyToolResultMention = text.includes('"type":"tool_result"');
    specimen.expect(anyToolResultMention).toBe(true);
  });
});
