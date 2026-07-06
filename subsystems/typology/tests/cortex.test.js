import { specimen, Cortex, nearest, tiers } from "@vivalence/typology";

function mockFaculties() {
  const text = (tag) => ({
    role: "assistant",
    parts: [{ type: "text", text: tag }],
    meta: { stop: "end_turn" },
  });

  return [
    {
      type: "dialogue", tune: [0.9, 1.0, 0.3, 0.5],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async () => text("[opus]"),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "dialogue", tune: [0.4, 0.6, 0.6, 0.5],
      channels: { in: ["text"], out: ["text"] },
      via: {
        render: async () => text("[sonnet]"),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "dialogue", tune: [0.1, 0.3, 1.0, 0.5],
      channels: { in: ["text"], out: ["text"] },
      via: { render: async () => text("[haiku]") },
    },
    {
      type: "speech", tune: [0.3, 0.8, 0.7, 0.2],
      channels: { in: ["text"], out: ["audio"] },
      via: {
        render: async () => ({ role: "assistant", parts: [{ type: "audio", data: "abc", media: "audio/mp3" }], meta: {} }),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "object", tune: [0.3, 0.7, 0.8, 0.5],
      channels: { in: ["text"], out: ["object"] },
      via: { render: async () => ({ role: "assistant", parts: [{ type: "object", data: {} }], meta: {} }) },
    },
  ];
}

function populatedCortex() {
  return new Cortex().register(mockFaculties());
}

specimen.describe("Cortex", () => {

  specimen.describe("register + find", () => {

    specimen.it("stores faculties queryable by type", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.find({ type: "dialogue" })).toHaveLength(3);
      specimen.expect(cortex.find({ type: "speech" })).toHaveLength(1);
      specimen.expect(cortex.find({ type: "object" })).toHaveLength(1);
      specimen.expect(cortex.find({ type: "nonexistent" })).toHaveLength(0);
    });

    specimen.it("register is additive across multiple calls and returns this", () => {
      const cortex = new Cortex();
      specimen.expect(cortex.register([mockFaculties()[0]])).toBe(cortex);
      cortex.register([mockFaculties()[1]]);
      specimen.expect(cortex.find({ type: "dialogue" })).toHaveLength(2);
    });

    specimen.it("register accepts a single faculty without an array", () => {
      const cortex = new Cortex().register(mockFaculties()[0]);
      specimen.expect(cortex.find({ type: "dialogue" })).toHaveLength(1);
    });

    specimen.it("register pads 3-dimension tunes without mutating the supplied faculty", () => {
      const supplied = {
        type: "dialogue", tune: [0.2, 0.4, 0.8],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async () => ({}) },
      };
      const cortex = new Cortex().register([supplied]);

      specimen.expect(supplied.tune).toEqual([0.2, 0.4, 0.8]);
      specimen.expect(cortex.find({ type: "dialogue" })[0].tune).toEqual([0.2, 0.4, 0.8, 0.5]);
    });

    specimen.it("invalid faculty throws on register", () => {
      let error = null;
      try { new Cortex().register([{ type: "dialogue", tune: [0.5, 0.5, 0.5] }]); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid faculty");
    });

    specimen.it("find without type returns everything; via filters delivery avenue", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.find()).toHaveLength(5);
      specimen.expect(cortex.find({ type: "dialogue", via: "stream" })).toHaveLength(2);
    });
  });

  specimen.describe("findOne", () => {

    specimen.it("picks nearest faculty by tune", () => {
      const cortex = populatedCortex();

      const opus = cortex.findOne({ type: "dialogue", tune: "unleashed" });
      specimen.expect(opus.tune).toEqual([0.9, 1.0, 0.3, 0.5]);

      const haiku = cortex.findOne({ type: "dialogue", tune: "frugal" });
      specimen.expect(haiku.tune).toEqual([0.1, 0.3, 1.0, 0.5]);
    });

    specimen.it("via filter excludes faculties missing that delivery avenue", () => {
      const cortex = populatedCortex();
      const streamable = cortex.findOne({ type: "dialogue", tune: "frugal", via: "stream" });
      specimen.expect(streamable.via.stream).toBeDefined();
      specimen.expect(streamable.tune).not.toEqual([0.1, 0.3, 1.0, 0.5]);
    });

    specimen.it("no tune defaults to midpoint [0.5, 0.5, 0.5, 0.5]", () => {
      const cortex = populatedCortex();
      const result = cortex.findOne({ type: "dialogue" });
      specimen.expect(result.tune).toEqual([0.4, 0.6, 0.6, 0.5]);
    });

    specimen.it("invalid query throws: via outside render|stream", () => {
      const cortex = populatedCortex();
      let error = null;
      try { cortex.findOne({ type: "dialogue", via: "teleport" }); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid query");
    });

    specimen.it("query io is shared and never mutates the caller's where", () => {
      const cortex = populatedCortex();
      const supplied = { type: "dialogue" };
      cortex.findOne(supplied);
      cortex.find(supplied);
      specimen.expect(supplied).toEqual({ type: "dialogue" });
    });

    specimen.it("unknown type with no derivation returns undefined", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.findOne({ type: "verbatim" })).toBe(undefined);
      specimen.expect(cortex.findOne({ type: "nonexistent" })).toBe(undefined);
    });
  });

  specimen.describe("findOne derives", () => {

    specimen.it("object derives from dialogue when no native object faculty is stored", () => {
      const cortex = new Cortex().register([mockFaculties()[0]]);

      specimen.expect(cortex.find({ type: "object" })).toHaveLength(0);
      const derived = cortex.findOne({ type: "object" });
      specimen.expect(derived).toBeDefined();
      specimen.expect(derived.type).toBe("object");
      specimen.expect(derived.via.render).toBeDefined();
    });

    specimen.it("native object faculty wins over derivation", () => {
      const cortex = populatedCortex();
      const found = cortex.findOne({ type: "object" });
      specimen.expect(found.tune).toEqual([0.3, 0.7, 0.8, 0.5]);
    });

    specimen.it("derived object supports render only — via stream returns undefined", () => {
      const cortex = new Cortex().register([mockFaculties()[0]]);
      specimen.expect(cortex.findOne({ type: "object", via: "stream" })).toBe(undefined);
    });

    specimen.it("no dialogue donor → no object derivation", () => {
      const cortex = new Cortex().register([mockFaculties()[3]]);
      specimen.expect(cortex.findOne({ type: "object" })).toBe(undefined);
    });

    specimen.it("derived faculty translates a respond call into a sealed object turn", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text", "tool_use"] },
        via: {
          render: async (turns, config) => {
            specimen.expect(config.tools.respond).toBeDefined();
            specimen.expect(config.tool_choice).toEqual({ type: "any" });
            return {
              role: "assistant",
              parts: [{ type: "tool_use", id: "r1", name: "respond", input: JSON.stringify({ verdict: "ok" }) }],
              meta: { stop: "tool_use" },
            };
          },
        },
      }]);

      const derived = cortex.findOne({ type: "object" });
      const turn = await derived.via.render([], { output: { type: "object" } });

      specimen.expect(turn.parts[0].type).toBe("object");
      specimen.expect(turn.parts[0].data.verdict).toBe("ok");
      specimen.expect(turn.meta.stop).toBe("end_turn");
      specimen.expect(turn.object.verdict).toBe("ok");
    });

    specimen.it("derived faculty passes a real tool_use through untouched", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text", "tool_use"] },
        via: {
          render: async () => ({
            role: "assistant",
            parts: [{ type: "tool_use", id: "t1", name: "lookup", input: "{}" }],
            meta: { stop: "tool_use" },
          }),
        },
      }]);

      const derived = cortex.findOne({ type: "object" });
      const turn = await derived.via.render([], { output: { type: "object" } });

      specimen.expect(turn.parts[0].type).toBe("tool_use");
      specimen.expect(turn.meta.stop).toBe("tool_use");
    });
  });

  specimen.describe("nearest (tier resolution)", () => {

    specimen.it("string tier resolves to vector then picks nearest", () => {
      const faculties = mockFaculties().filter((faculty) => faculty.type === "dialogue");
      specimen.expect(nearest(faculties, "unleashed").tune).toEqual([0.9, 1.0, 0.3, 0.5]);
      specimen.expect(nearest(faculties, "frugal").tune).toEqual([0.1, 0.3, 1.0, 0.5]);
      specimen.expect(nearest(faculties, "balanced").tune).toEqual([0.4, 0.6, 0.6, 0.5]);
    });

    specimen.it("unknown tier falls back to midpoint", () => {
      const faculties = [
        { tune: [0.1, 0.1, 0.1, 0.1] },
        { tune: [0.5, 0.5, 0.5, 0.5] },
        { tune: [0.9, 0.9, 0.9, 0.9] },
      ];
      specimen.expect(nearest(faculties, "nonexistent").tune).toEqual([0.5, 0.5, 0.5, 0.5]);
    });
  });

});
