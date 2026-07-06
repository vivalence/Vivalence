import { specimen, soma, Cortex, Hallucination } from "@vivalence/typology";

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
  cortex.register([
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
        render: async (turns, config) => ({ role: "assistant", parts: [{ type: "object", data: { echo: lastUserText(turns) }, schema: config.output }], meta: { stop: "end_turn" } }),
      },
    },
  ]);
  return cortex;
}

function userTurn(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

specimen.describe("Hallucination", () => {

  specimen.describe("conditioning", () => {

    specimen.it("context.system lands as the leading system turn", async () => {
      let captured = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async (turns) => ((captured = turns), { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { stop: "end_turn" } }) },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.context.system("You are a tutor.");
      hallucination.entities.turn.chain(userTurn("hi"));
      await hallucination.dialogue.render();

      specimen.expect(captured[0].role).toBe("system");
      specimen.expect(captured[0].parts[0].text).toBe("You are a tutor.");
      specimen.expect(captured[1].role).toBe("user");
    });

    specimen.it("context.extend folds entries behind system in insertion order", async () => {
      let captured = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async (turns) => ((captured = turns), { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { stop: "end_turn" } }) },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.context.system("base persona");
      hallucination.context.extend({ language: "pt-BR", learner: { level: "a1" } });
      hallucination.entities.turn.chain(userTurn("hi"));
      await hallucination.dialogue.render();

      const system = captured[0].parts[0].text;
      specimen.expect(system.startsWith("base persona")).toBe(true);
      specimen.expect(system).toContain("language:\npt-BR");
      specimen.expect(system.indexOf("language:")).toBeLessThan(system.indexOf("learner:"));
    });

    specimen.it("turn.chain keeps order, spreads arrays, skips falsy, allows repeats", () => {
      const repeated = userTurn("hello");
      const assistant = { role: "assistant", parts: [{ type: "text", text: "hi" }] };

      const hallucination = Hallucination(populatedCortex());
      hallucination.entities.turn.chain(null, repeated, [assistant, repeated], undefined);

      const turns = hallucination.entities.turn.all();
      specimen.expect(turns).toHaveLength(3);
      specimen.expect(turns[0]).toBe(repeated);
      specimen.expect(turns[1]).toBe(assistant);
      specimen.expect(turns[2]).toBe(repeated);
    });

    specimen.it("turn.replace swaps the transcript wholesale", () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.entities.turn.chain(userTurn("old"));
      hallucination.entities.turn.replace([userTurn("summary"), userTurn("fresh")]);

      const turns = hallucination.entities.turn.all();
      specimen.expect(turns).toHaveLength(2);
      specimen.expect(turns[0].parts[0].text).toBe("summary");
    });

    specimen.it("configure + context + entities chain fluently", () => {
      const hallucination = Hallucination(populatedCortex());
      const chained = hallucination
        .configure({ tune: "capable", temperature: 0.7 })
        .context.system("persona")
        .entities.turn.chain(userTurn("hi"))
        .entities.tool.add("lookup", async () => ({}));

      specimen.expect(chained).toBe(hallucination);
    });

    specimen.it("configure fills defaults and rejects invalid config", () => {
      const hallucination = Hallucination(populatedCortex());

      let error = null;
      try { hallucination.configure({ rounds: 0 }); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid config");

      const coerced = Hallucination(populatedCortex());
      coerced.configure({ rounds: "3" }); // cast coerces before checking
    });

    specimen.it("cortex.hallucination(config) seeds via an eager configure", () => {
      const cortex = populatedCortex();
      const seeded = cortex.hallucination({ tune: "unleashed" });
      specimen.expect(seeded.configure).toBeDefined();

      let error = null;
      try { cortex.hallucination({ rounds: 0 }); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid config");
    });

    specimen.it("tool.add wraps a bare function, passes a spec through, accepts a map", async () => {
      let bareRan = false;
      let specRan = false;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: {
          render: async (turns) => {
            if (hasToolResult(turns)) return { role: "assistant", parts: [{ type: "text", text: "done" }], meta: { stop: "end_turn" } };
            return {
              role: "assistant",
              parts: [
                { type: "tool_use", id: "t1", name: "bare", input: "{}" },
                { type: "tool_use", id: "t2", name: "spec", input: "{}" },
              ],
              meta: { stop: "tool_use" },
            };
          },
        },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.entities.tool.add("bare", async () => ((bareRan = true), {}));
      hallucination.entities.tool.add({ spec: { execute: async () => ((specRan = true), {}), valence: "looks up" } });
      hallucination.entities.turn.chain(userTurn("go"));
      const turn = await hallucination.dialogue.render();

      specimen.expect(turn.parts[0].text).toBe("done");
      specimen.expect(bareRan).toBe(true);
      specimen.expect(specRan).toBe(true);
    });
  });

  specimen.describe("render", () => {

    specimen.it("single-shot returns sealed turn from faculty", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "balanced" });
      hallucination.entities.turn.chain(userTurn("hello"));
      const turn = await hallucination.dialogue.render();

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toBe("[sonnet] hello");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("tool loop: executes tool, re-invokes faculty, returns final turn", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "unleashed" });
      hallucination.entities.tool.add("lookup", async (input) => ({ definition: `${input.query} means house` }));
      hallucination.entities.turn.chain(userTurn("what is casa"));
      const turn = await hallucination.dialogue.render();

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toContain("casa");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("tune selects faculty: unleashed → opus, balanced → sonnet", async () => {
      const cortex = populatedCortex();

      const opusSide = Hallucination(cortex).configure({ tune: "unleashed" });
      opusSide.entities.turn.chain(userTurn("test"));
      const opus = await opusSide.dialogue.render();

      const sonnetSide = Hallucination(cortex).configure({ tune: "balanced" });
      sonnetSide.entities.turn.chain(userTurn("test"));
      const sonnet = await sonnetSide.dialogue.render();

      specimen.expect(opus.parts[0].text).toContain("[opus]");
      specimen.expect(sonnet.parts[0].text).toContain("[sonnet]");
    });

    specimen.it("unknown tool returns error in tool_result and completes", async () => {
      const cortex = new Cortex();
      let capturedTurns = null;
      cortex.register([{
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

      const hallucination = Hallucination(cortex);
      hallucination.entities.turn.chain(userTurn("test"));
      const turn = await hallucination.dialogue.render();

      specimen.expect(turn.parts[0].text).toBe("done");
      const toolResultTurn = capturedTurns.find((t) => t.parts?.some((p) => p.type === "tool_result"));
      specimen.expect(toolResultTurn.parts[0].output.error).toContain("ghost");
    });

    specimen.it("rounds ceiling comes from config", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text", "tool_use"] },
        via: {
          render: async () => ({
            role: "assistant",
            parts: [{ type: "tool_use", id: "t1", name: "loop", input: "{}" }],
            meta: { stop: "tool_use" },
          }),
        },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.configure({ rounds: 2 });
      hallucination.entities.tool.add("loop", async () => ({}));
      hallucination.entities.turn.chain(userTurn("spin"));

      let error = null;
      try { await hallucination.dialogue.render(); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("exceeded 2 rounds");
    });
  });

  specimen.describe("stream", () => {

    specimen.it("single-shot: yields packets that accumulate to correct turn", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "balanced" });
      hallucination.entities.turn.chain(userTurn("hello"));

      const collected = [];
      let turn = null;
      for await (const packet of await hallucination.dialogue.stream()) {
        turn = soma.pour(turn, packet);
        collected.push(packet);
      }

      specimen.expect(collected[0].event).toBe("/turn/open");
      specimen.expect(collected.at(-1).event).toBe("/turn/close");
      specimen.expect(turn.parts[0].text).toBe("[sonnet] hello");
    });

    specimen.it("tool loop: yields 3 turns — tool_use, tool_result, final", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "unleashed" });
      hallucination.entities.tool.add("lookup", async (input) => ({ definition: `${input.query} means house` }));
      hallucination.entities.turn.chain(userTurn("what is casa"));

      let turnOpenCount = 0;
      let turnCloseCount = 0;
      for await (const packet of await hallucination.dialogue.stream()) {
        if (packet.event === "/turn/open")  turnOpenCount++;
        if (packet.event === "/turn/close") turnCloseCount++;
      }

      specimen.expect(turnOpenCount).toBe(3);
      specimen.expect(turnCloseCount).toBe(3);
    });

    specimen.it("tool loop stream: final turn has correct content", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "unleashed" });
      hallucination.entities.tool.add("lookup", async (input) => ({ definition: `${input.query} means house` }));
      hallucination.entities.turn.chain(userTurn("what is casa"));

      let turn = null;
      for await (const packet of await hallucination.dialogue.stream()) {
        if (packet.event === "/turn/open") turn = null;
        turn = soma.pour(turn, packet);
      }

      specimen.expect(turn.parts[0].text).toContain("[opus]");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });
  });

  specimen.describe("object", () => {

    specimen.it("dedicated faculty renders structured data directly", async () => {
      const hallucination = Hallucination(populatedCortex());
      hallucination.configure({ tune: "balanced", output: { type: "object" } });
      hallucination.entities.turn.chain(userTurn("hello"));
      const turn = await hallucination.object.render();

      specimen.expect(turn.parts[0].type).toBe("object");
      specimen.expect(turn.parts[0].data.echo).toBe("hello");
      specimen.expect(turn.object.echo).toBe("hello");
    });

    specimen.it("synthesizes from dialogue + respond tool when no object faculty", async () => {
      const cortex = new Cortex();
      cortex.register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: {
          render: async (turns) => ({
            role: "assistant",
            parts: [{ type: "tool_use", id: "r1", name: "respond", input: JSON.stringify({ verdict: lastUserText(turns) }) }],
            meta: { stop: "tool_use" },
          }),
        },
      }]);

      specimen.expect(cortex.find({ type: "object" })).toHaveLength(0);
      specimen.expect(cortex.findOne({ type: "object" })).toBeDefined();

      const hallucination = Hallucination(cortex);
      hallucination.configure({ output: { type: "object" } });
      hallucination.entities.turn.chain(userTurn("casa"));
      const turn = await hallucination.object.render();

      specimen.expect(turn.parts[0].type).toBe("object");
      specimen.expect(turn.parts[0].data.verdict).toBe("casa");
      specimen.expect(turn.object.verdict).toBe("casa");
    });

    specimen.it("synthetic object runs real tools before responding", async () => {
      const cortex = new Cortex();
      cortex.register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: {
          render: async (turns) => {
            if (!hasToolResult(turns))
              return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "lookup", input: JSON.stringify({ query: "casa" }) }], meta: { stop: "tool_use" } };
            const result = turns.at(-1).parts.find((part) => part.type === "tool_result").output;
            return { role: "assistant", parts: [{ type: "tool_use", id: "r1", name: "respond", input: JSON.stringify({ definition: result.definition }) }], meta: { stop: "tool_use" } };
          },
        },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.configure({ output: { type: "object" } });
      hallucination.entities.tool.add("lookup", async (input) => ({ definition: `${input.query} means house` }));
      hallucination.entities.turn.chain(userTurn("casa"));
      const turn = await hallucination.object.render();

      specimen.expect(turn.parts[0].type).toBe("object");
      specimen.expect(turn.parts[0].data.definition).toBe("casa means house");
    });

    specimen.it("synthesized object path passes raw tool input (no thread injection)", async () => {
      const cortex = new Cortex();
      cortex.register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: {
          render: async (turns) => {
            if (!hasToolResult(turns))
              return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "lookup", input: JSON.stringify({ query: "casa" }) }], meta: { stop: "tool_use" } };
            return { role: "assistant", parts: [{ type: "tool_use", id: "r1", name: "respond", input: JSON.stringify({ done: true }) }], meta: { stop: "tool_use" } };
          },
        },
      }]);

      let received = null;
      const hallucination = Hallucination(cortex);
      hallucination.configure({ output: { type: "object" } });
      hallucination.entities.tool.add("lookup", async (input) => ((received = input), { found: true }));
      hallucination.entities.turn.chain(userTurn("casa"));
      await hallucination.object.render();

      specimen.expect(received.query).toBe("casa");
      specimen.expect(received.thread).toBe(undefined);
    });

    specimen.it("lexicon-native tool return: message rides output, entities stay app-side", async () => {
      const cortex = new Cortex();
      let result = null;
      cortex.register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
        via: {
          render: async (turns) => {
            if (!hasToolResult(turns))
              return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "drill", input: JSON.stringify({ count: 1 }) }], meta: { stop: "tool_use" } };
            result = turns.at(-1).parts.find((part) => part.type === "tool_result");
            return { role: "assistant", parts: [{ type: "tool_use", id: "r1", name: "respond", input: JSON.stringify({ reply: result.output }) }], meta: { stop: "tool_use" } };
          },
        },
      }]);

      const hallucination = Hallucination(cortex);
      hallucination.configure({ output: { type: "object" } });
      hallucination.entities.tool.add("drill", async () => ({
        message: "Drill started: 1 exercise.",
        entities: { buffer: [{ id: "b1" }] },
      }));
      hallucination.entities.turn.chain(userTurn("start a drill"));
      await hallucination.object.render();

      specimen.expect(result.output).toBe("Drill started: 1 exercise.");
      specimen.expect(result.entities.buffer).toHaveLength(1);
    });
  });

});
