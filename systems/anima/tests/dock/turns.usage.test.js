import { specimen } from "@vivalence/typology";
import { enrich, usages } from "../../src/app/panels/a/widgets/turns.js";

const NOW = new Date("2026-09-28T12:00:00.000Z");

const THREAD = [
  { id: "u1", role: "user", createdAt: "2026-09-28T09:00:00.000Z", parts: [{ type: "text", text: "what is due?" }] },
  {
    id: "a1",
    role: "assistant",
    createdAt: "2026-09-28T09:00:02.000Z",
    meta: { usage: { input_tokens: 1200, output_tokens: 40 } },
    parts: [{ type: "tool_use", id: "call-1", name: "queue_due", input: { limit: 3 } }],
  },
  {
    id: "r1",
    role: "user",
    createdAt: "2026-09-28T09:00:03.000Z",
    parts: [{ type: "tool_result", tool_use_id: "call-1", output: { message: "three due" } }],
  },
  {
    id: "a2",
    role: "assistant",
    createdAt: "2026-09-28T09:00:05.000Z",
    meta: { usage: { input_tokens: 1500, output_tokens: 210 } },
    parts: [{ type: "text", text: "three cards are due." }],
  },
  { id: "u2", role: "user", createdAt: "2026-09-28T09:01:00.000Z", parts: [{ type: "text", text: "thanks" }] },
  { id: "a3", role: "assistant", createdAt: "2026-09-28T09:01:02.000Z", parts: [{ type: "text", text: "any time." }] },
];

specimen.describe("usages — what each turn of the log spent, joined turns summed", () => {
  specimen.it("a joined turn spends what every turn it spans spent", () => {
    const items = enrich(THREAD, NOW);
    const spent = usages(items, THREAD);
    specimen.expect(items.filter((item) => item.kind === "turn").map((item) => item.turn.id)).toEqual(["u1", "a1", "u2", "a3"]);
    specimen.expect(spent.get("a1")).toEqual({ input: 2700, output: 250 });
  });

  specimen.it("a turn with no usage on the wire spends nothing: null, never a zero", () => {
    const spent = usages(enrich(THREAD, NOW), THREAD);
    specimen.expect([spent.get("u1"), spent.get("u2"), spent.get("a3")]).toEqual([null, null, null]);
    specimen.expect([...spent.keys()]).toEqual(["u1", "a1", "u2", "a3"]);
  });

  specimen.it("an empty log spends nothing", () => {
    specimen.expect(usages([], []).size).toBe(0);
  });

  specimen.it("the source is not mutated", () => {
    const before = JSON.stringify(THREAD);
    const items = enrich(THREAD, NOW);
    const held = JSON.stringify(items);
    usages(items, THREAD);
    specimen.expect(JSON.stringify(THREAD)).toBe(before);
    specimen.expect(JSON.stringify(items)).toBe(held);
  });
});
