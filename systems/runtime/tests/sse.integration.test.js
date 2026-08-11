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
    specimen.expect(closes[0].meta.state).toBe("complete");
  });

  specimen.it("executable tools do not cross the JSON wire — single round, no tool call", async () => {
    const thread = await scenario.createThread();
    const response = await fetch(`http://localhost:${PORT}/harness/dialogue/stream`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        thread: thread.id,
        parts: [{ type: "text", text: "lookup test" }],
        tune: "unleashed",
        tools: { lookup: { execute: async (ctx) => ({ definition: `${ctx.input.query} means house` }) } },
      }),
    });

    const text = await readSseFully(response);
    const frames = parseSseFrames(text);

    const opens  = frames.filter((f) => f.event === "/turn/open");
    const closes = frames.filter((f) => f.event === "/turn/close");

    specimen.expect(opens.length).toBe(1);
    specimen.expect(closes.length).toBe(1);
    specimen.expect(closes[0].meta.state).toBe("complete");
    specimen.expect(frames.at(-1).event).toBe("/response/close");
    specimen.expect(text.includes('"type":"tool_use"')).toBe(false);
  });
});
