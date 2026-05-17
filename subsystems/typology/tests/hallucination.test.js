import { specimen, soma, Cortex, Hallucination, Vector, shape, steer } from "@vivalence/typology";


function lastUserText(turns) {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user") continue;
    const text = turns[index].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
}

function hasToolResult(turns) {
  return turns.at(-1)?.parts?.some((part) => part.type === "tool_result");
}

function textPackets(text, meta = { stop: "end_turn" }) {
  return [
    { event: "/turn/open", turn: { role: "assistant" } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
    ...Array.from(text).map((character) => ({ event: "/part/delta", index: 0, delta: { text: character } })),
    { event: "/part/close", index: 0 },
    { event: "/turn/close", meta },
  ];
}

function toolUsePackets(id, name, input) {
  return [
    { event: "/turn/open", turn: { role: "assistant" } },
    { event: "/part/open", index: 0, part: { type: "tool_use", id, name, input: "" } },
    { event: "/part/delta", index: 0, delta: { input: JSON.stringify(input) } },
    { event: "/part/close", index: 0 },
    { event: "/turn/close", meta: { stop: "tool_use" } },
  ];
}

function populatedCortex() {
  const cortex = new Cortex();
  cortex.extend([
    {
      type: "dialogue", tune: [0.9, 1.0, 0.3],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async (turns, config) => {
          const text = lastUserText(turns);
          if (config.tools && !hasToolResult(turns)) {
            return {
              role: "assistant",
              parts: [
                { type: "tool_use", id: "t1", name: Object.keys(config.tools)[0], input: JSON.stringify({ query: text }) },
              ],
              meta: { stop: "tool_use" },
            };
          }
          return { role: "assistant", parts: [{ type: "text", text: `[opus] ${text}` }], meta: { stop: "end_turn" } };
        },
        stream: async (turns, config) => {
          const text = lastUserText(turns);
          if (config.tools && !hasToolResult(turns)) {
            return (async function* () { for (const packet of toolUsePackets("t1", Object.keys(config.tools)[0], { query: text })) yield packet; })();
          }
          return (async function* () { for (const packet of textPackets(`[opus] ${text}`)) yield packet; })();
        },
      },
    },
    {
      type: "dialogue", tune: [0.4, 0.6, 0.6],
      channels: { in: ["text"], out: ["text"] },
      via: {
        render: async (turns) => ({ role: "assistant", parts: [{ type: "text", text: `[sonnet] ${lastUserText(turns)}` }], meta: { stop: "end_turn" } }),
        stream: async (turns) => (async function* () { for (const packet of textPackets(`[sonnet] ${lastUserText(turns)}`)) yield packet; })(),
      },
    },
    {
      type: "speech", tune: [0.3, 0.8, 0.7],
      channels: { in: ["text"], out: ["audio"] },
      via: {
        render: async (turns) => ({ role: "assistant", parts: [{ type: "audio", data: btoa(lastUserText(turns)), media: "audio/mp3" }], meta: { stop: "end_turn" } }),
        stream: async (turns) => {
          const data = btoa(lastUserText(turns));
          return (async function* () {
            yield { event: "/turn/open", turn: { role: "assistant" } };
            yield { event: "/part/open", index: 0, part: { type: "audio", data: "", media: "audio/mp3" } };
            yield { event: "/part/delta", index: 0, delta: { data } };
            yield { event: "/part/close", index: 0 };
            yield { event: "/turn/close", meta: { stop: "end_turn" } };
          })();
        },
      },
    },
    {
      type: "object", tune: [0.3, 0.7, 0.8],
      channels: { in: ["text"], out: ["object"] },
      via: {
        render: async (turns, config) => ({ role: "assistant", parts: [{ type: "object", data: { echo: lastUserText(turns) }, schema: config.schema }], meta: { stop: "end_turn" } }),
      },
    },
  ]);
  return cortex;
}

function makeHarness(cortex) {
  const harness = new Vector();
  harness.use(cortex.shard.harness);
  cortex.shard.effects(harness);
  return shape.object(harness, steer.echo);
}

function input(turns, tune = "balanced", tools = {}, config = {}) {
  return { turns, tune, tools, config };
}

specimen.describe("Hallucination", () => {

  specimen.describe("conditioning", () => {

    specimen.it("string becomes system turn", () => {
      const hallucination = new Hallucination(populatedCortex(), {});
      hallucination.add("You are a tutor.");

      specimen.expect(hallucination.turns).toHaveLength(1);
      specimen.expect(hallucination.turns[0].role).toBe("system");
      specimen.expect(hallucination.turns[0].parts[0].text).toBe("You are a tutor.");
    });

    specimen.it("turn object passes through, array spreads, falsy skips", () => {
      const userTurn      = { role: "user",      parts: [{ type: "text", text: "hello" }] };
      const assistantTurn = { role: "assistant",  parts: [{ type: "text", text: "hi"    }] };

      const hallucination = new Hallucination(populatedCortex(), {});
      hallucination.add(null, "system prompt", [userTurn, assistantTurn], undefined, "another system");

      specimen.expect(hallucination.turns).toHaveLength(4);
      specimen.expect(hallucination.turns[0].role).toBe("system");
      specimen.expect(hallucination.turns[0].parts[0].text).toBe("system prompt");
      specimen.expect(hallucination.turns[1]).toBe(userTurn);
      specimen.expect(hallucination.turns[2]).toBe(assistantTurn);
      specimen.expect(hallucination.turns[3].parts[0].text).toBe("another system");
    });

    specimen.it("tool + tune + configure chain fluently", () => {
      const handler      = async (input) => ({ result: input.query });
      const hallucination = new Hallucination(populatedCortex(), {});
      hallucination.tool("lookup", handler).tune("capable").configure({ temperature: 0.7 });

      specimen.expect(hallucination.tools.lookup.execute).toBe(handler);
      specimen.expect(hallucination.tuning).toBe("capable");
      specimen.expect(hallucination.config.temperature).toBe(0.7);
    });

    specimen.it("tool wraps bare function, passes spec object through", () => {
      const bare = async () => ({});
      const spec = { execute: async () => ({}), valence: "looks up words" };

      const hallucination = new Hallucination(populatedCortex(), {});
      hallucination.tool("bare", bare).tool("spec", spec);

      specimen.expect(hallucination.tools.bare.execute).toBe(bare);
      specimen.expect(hallucination.tools.spec).toBe(spec);
    });
  });

  specimen.describe("render", () => {

    specimen.it("single-shot returns sealed turn from faculty", async () => {
      const harness = makeHarness(populatedCortex());
      const turn = await harness.dialogue.render(input(
        [{ role: "user", parts: [{ type: "text", text: "hello" }] }],
        "balanced",
      ));

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toBe("[sonnet] hello");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("tool loop: executes tool, re-invokes faculty, returns final turn", async () => {
      const harness = makeHarness(populatedCortex());
      const turn = await harness.dialogue.render(input(
        [{ role: "user", parts: [{ type: "text", text: "what is casa" }] }],
        "unleashed",
        { lookup: async (i) => ({ definition: `${i.query} means house` }) },
      ));

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toContain("casa");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("tune selects faculty: unleashed → opus, balanced → sonnet", async () => {
      const cortex = populatedCortex();
      const harness = makeHarness(cortex);

      const opus   = await harness.dialogue.render(input([{ role: "user", parts: [{ type: "text", text: "test" }] }], "unleashed"));
      const sonnet = await harness.dialogue.render(input([{ role: "user", parts: [{ type: "text", text: "test" }] }], "balanced"));

      specimen.expect(opus.parts[0].text).toContain("[opus]");
      specimen.expect(sonnet.parts[0].text).toContain("[sonnet]");
    });

    specimen.it("unknown tool returns error in tool_result and completes", async () => {
      const cortex = new Cortex();
      let capturedTurns = null;
      cortex.extend([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: {
          render: async (turns) => {
            capturedTurns = turns;
            if (turns.at(-1)?.parts?.some((part) => part.type === "tool_result")) {
              return { role: "assistant", parts: [{ type: "text", text: "done" }], meta: { stop: "end_turn" } };
            }
            return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "ghost", input: "{}" }], meta: { stop: "tool_use" } };
          },
        },
      }]);

      const harness = makeHarness(cortex);
      const turn = await harness.dialogue.render(input([{ role: "user", parts: [{ type: "text", text: "test" }] }]));

      specimen.expect(turn.parts[0].text).toBe("done");
      const toolResultTurn = capturedTurns.find((t) => t.parts?.some((p) => p.type === "tool_result"));
      specimen.expect(toolResultTurn.parts[0].output.error).toContain("ghost");
    });
  });

  specimen.describe("stream", () => {

    specimen.it("single-shot: yields packets that accumulate to correct turn", async () => {
      const harness   = makeHarness(populatedCortex());
      const collected = [];
      let turn        = null;

      for await (const packet of await harness.dialogue.stream(input(
        [{ role: "user", parts: [{ type: "text", text: "hello" }] }],
        "balanced",
      ))) {
        turn = soma.pour(turn, packet);
        collected.push(packet);
      }

      specimen.expect(collected[0].event).toBe("/turn/open");
      specimen.expect(collected.at(-1).event).toBe("/turn/close");
      specimen.expect(turn.parts[0].text).toBe("[sonnet] hello");
    });

    specimen.it("tool loop: yields 3 turns — tool_use, tool_result, final", async () => {
      const harness = makeHarness(populatedCortex());
      let turnCloseCount = 0;
      let turnOpenCount  = 0;

      for await (const packet of await harness.dialogue.stream(input(
        [{ role: "user", parts: [{ type: "text", text: "what is casa" }] }],
        "unleashed",
        { lookup: async (i) => ({ definition: `${i.query} means house` }) },
      ))) {
        if (packet.event === "/turn/open")  turnOpenCount++;
        if (packet.event === "/turn/close") turnCloseCount++;
      }

      specimen.expect(turnOpenCount).toBe(3);
      specimen.expect(turnCloseCount).toBe(3);
    });

    specimen.it("tool loop stream: final turn has correct content", async () => {
      const harness = makeHarness(populatedCortex());
      let turn = null;

      for await (const packet of await harness.dialogue.stream(input(
        [{ role: "user", parts: [{ type: "text", text: "what is casa" }] }],
        "unleashed",
        { lookup: async (i) => ({ definition: `${i.query} means house` }) },
      ))) {
        if (packet.event === "/turn/open") turn = null;
        turn = soma.pour(turn, packet);
      }

      specimen.expect(turn.parts[0].text).toContain("[opus]");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });
  });

});
