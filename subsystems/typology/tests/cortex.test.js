import { specimen, Cortex, Hallucinate, nearest, tiers } from "@vivalence/typology";

function mockFaculties() {
  const text = (tag) => ({
    role: "assistant",
    parts: [{ type: "text", text: tag }],
    meta: { stop: "end_turn" },
  });

  return [
    {
      type: "conversation", tune: [0.9, 1.0, 0.3],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async () => text("[opus]"),
        stream: async function* () { yield { event: "turn.open", turn: { role: "assistant" } }; yield { event: "turn.close", meta: {} }; },
      },
    },
    {
      type: "conversation", tune: [0.4, 0.6, 0.6],
      channels: { in: ["text"], out: ["text"] },
      via: {
        render: async () => text("[sonnet]"),
        stream: async function* () { yield { event: "turn.open", turn: { role: "assistant" } }; yield { event: "turn.close", meta: {} }; },
      },
    },
    {
      type: "conversation", tune: [0.1, 0.3, 1.0],
      channels: { in: ["text"], out: ["text"] },
      via: { render: async () => text("[haiku]") },
    },
    {
      type: "speech", tune: [0.3, 0.8, 0.7],
      channels: { in: ["text"], out: ["audio"] },
      via: {
        render: async () => ({ role: "assistant", parts: [{ type: "audio", data: "abc", media: "audio/mp3" }], meta: {} }),
        stream: async function* () { yield { event: "turn.open", turn: { role: "assistant" } }; yield { event: "turn.close", meta: {} }; },
      },
    },
    {
      type: "object", tune: [0.3, 0.7, 0.8],
      channels: { in: ["text"], out: ["object"] },
      via: { render: async () => ({ role: "assistant", parts: [{ type: "object", data: {} }], meta: {} }) },
    },
  ];
}

function populatedCortex() {
  return new Cortex().extend(mockFaculties());
}

specimen.describe("Cortex", () => {

  specimen.describe("extend + table", () => {

    specimen.it("populates table indexed by faculty type", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.table.get("conversation")).toHaveLength(3);
      specimen.expect(cortex.table.get("speech")).toHaveLength(1);
      specimen.expect(cortex.table.get("object")).toHaveLength(1);
      specimen.expect(cortex.table.get("nonexistent")).toBeUndefined();
    });

    specimen.it("extend is additive across multiple calls", () => {
      const cortex = new Cortex();
      cortex.extend([mockFaculties()[0]]);
      cortex.extend([mockFaculties()[1]]);
      specimen.expect(cortex.table.get("conversation")).toHaveLength(2);
    });
  });

  specimen.describe("resolve", () => {

    specimen.it("picks nearest faculty by tune", () => {
      const cortex = populatedCortex();

      const opus = cortex.resolve("conversation", { tune: "unleashed" });
      specimen.expect(opus.tune).toEqual([0.9, 1.0, 0.3]);

      const haiku = cortex.resolve("conversation", { tune: "frugal" });
      specimen.expect(haiku.tune).toEqual([0.1, 0.3, 1.0]);
    });

    specimen.it("via filter excludes faculties missing that delivery avenue", () => {
      const cortex = populatedCortex();
      const streamable = cortex.resolve("conversation", { tune: "frugal", via: "stream" });
      specimen.expect(streamable.via.stream).toBeDefined();
      specimen.expect(streamable.tune).not.toEqual([0.1, 0.3, 1.0]);
    });

    specimen.it("no tune defaults to midpoint [0.5, 0.5, 0.5]", () => {
      const cortex = populatedCortex();
      const result = cortex.resolve("conversation");
      specimen.expect(result.tune).toEqual([0.4, 0.6, 0.6]);
    });
  });

  specimen.describe("nearest (tier resolution)", () => {

    specimen.it("string tier resolves to vector then picks nearest", () => {
      const faculties = mockFaculties().filter((faculty) => faculty.type === "conversation");
      specimen.expect(nearest(faculties, "unleashed").tune).toEqual([0.9, 1.0, 0.3]);
      specimen.expect(nearest(faculties, "frugal").tune).toEqual([0.1, 0.3, 1.0]);
      specimen.expect(nearest(faculties, "balanced").tune).toEqual([0.4, 0.6, 0.6]);
    });

    specimen.it("unknown tier falls back to midpoint", () => {
      const faculties = [
        { tune: [0.1, 0.1, 0.1] },
        { tune: [0.5, 0.5, 0.5] },
        { tune: [0.9, 0.9, 0.9] },
      ];
      specimen.expect(nearest(faculties, "nonexistent").tune).toEqual([0.5, 0.5, 0.5]);
    });
  });

  specimen.describe("spawn", () => {

    specimen.it("returns Hallucinate instance with cortex reference", () => {
      const cortex = populatedCortex();
      const hallucinate = cortex.spawn();
      specimen.expect(hallucinate).toBeInstanceOf(Hallucinate);
      specimen.expect(hallucinate.cortex).toBe(cortex);
    });
  });
});
