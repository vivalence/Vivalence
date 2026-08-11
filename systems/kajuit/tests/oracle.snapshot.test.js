import { specimen, trace, Cortex } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as oracle from "../../../registry/playground/modes/chaosmonkey/oracle/oracle.viva.js";

const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

const lastUserText = (turns) => {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user") continue;
    const text = turns[index].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
};

const answered = (turns) => turns.at(-1)?.parts?.some((part) => part.type === "tool_result");

const seer = () => ({
  type: "dialogue",
  tune: [0.9, 1.0, 0.3],
  context: 200000,
  channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
  via: {
    render: async (request) => {
      const { turns, output } = request;
      if (output?.schema) {
        const data = { answer: `the mist parts: ${lastUserText(turns)}` };
        return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
      }
      return {
        role: "assistant",
        parts: [{ type: "text", text: lastUserText(turns) }],
        meta: { state: "complete" },
      };
    },
  },
});

const stable = (node) => {
  const out = { path: node.path, nature: node.nature };
  if (node.timing) out.timing = { measured: node.timing.begun != null && node.timing.sealed != null };
  if (node.entries.length) out.entries = node.entries.map((entry) => entry.verb);
  if (node.children.length) out.children = node.children.map(stable);
  return out;
};

let scenario;

specimen.beforeAll(async () => {
  scenario = await mountMode(oracle, { cortex: new Cortex().register([seer()]) });
});

specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("oracle /ask over the wire — daemon spans cross as flat records", () => {
  specimen.it("the wire trace folds back into a chronicle and lands as a snapshot", async () => {
    const result = await scenario.conn.call("/mode/chaosmonkey/oracle/ask", {
      prompt: "what am i",
      thread: scenario.fixtures.thread.id,
    });
    specimen.expect(result.answer).toBe("the mist parts: what am i");

    const story = trace.chronicle(result.trace);
    const root = story.roots[0];
    specimen.expect(root.nature).toBe("ask");
    const input = root.children.find((child) => child.nature === "input");
    specimen.expect(input.entries[0].data).toEqual({
      prompt: "what am i",
      thread: scenario.fixtures.thread.id,
    });
    const render = root.children.find((child) => child.nature === "render");
    specimen.expect(render.entries[0].data.output.object).toEqual({ answer: "the mist parts: what am i" });
    specimen.expect(trace.duration(root)).not.toBe(null);

    const capture = specimen.snapshot(story.roots, {
      base,
      dry: DRY,
      locate: "oracle-ask.snapshot.json",
      parse: (roots) => roots.map(stable),
    });
    console.log(`\n===BEGIN oracle-ask → ${capture.path}===\n${JSON.stringify(capture.pojo, null, 2)}\n===END===\n`);
    specimen.expect(capture.pojo[0].timing).toEqual({ measured: true });
  });
});
