import { specimen, Cortex, Hallucination, Vector } from "@vivalence/typology";

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

function userTurn(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

function textPackets(text, meta = { state: "complete" }) {
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
    { event: "/turn/close", meta: { state: "tools" } },
  ];
}

function stream(packets) {
  return (async function* () {
    for (const packet of packets) yield packet;
  })();
}

function populatedCortex() {
  return new Cortex().register([
    {
      type: "dialogue",
      tune: [0.9, 1.0, 0.3],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async ({ turns, tools }) => {
          const text = lastUserText(turns);
          if (tools && !hasToolResult(turns))
            return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: tools[0].name, input: { query: text } }], meta: { state: "tools" } };
          return { role: "assistant", parts: [{ type: "text", text: `[opus] ${text}` }], meta: { state: "complete" } };
        },
        stream: async ({ turns, tools }) => {
          const text = lastUserText(turns);
          if (tools && !hasToolResult(turns)) return stream(toolUsePackets("t1", tools[0].name, { query: text }));
          return stream(textPackets(`[opus] ${text}`));
        },
      },
    },
    {
      type: "dialogue",
      tune: [0.4, 0.6, 0.6],
      channels: { in: ["text"], out: ["text"] },
      via: {
        render: async ({ turns }) => ({ role: "assistant", parts: [{ type: "text", text: `[sonnet] ${lastUserText(turns)}` }], meta: { state: "complete" } }),
        stream: async ({ turns }) => stream(textPackets(`[sonnet] ${lastUserText(turns)}`)),
      },
    },
    {
      type: "speech",
      tune: [0.3, 0.8, 0.7],
      channels: { in: ["text"], out: ["audio"] },
      via: {
        render: async ({ turns }) => ({ role: "assistant", parts: [{ type: "audio", data: btoa(lastUserText(turns)), media: "audio/mp3" }], meta: { state: "complete" } }),
      },
    },
    {
      type: "object",
      tune: [0.3, 0.7, 0.8],
      channels: { in: ["text"], out: ["object"] },
      via: {
        render: async ({ turns, output }) => ({ role: "assistant", parts: [{ type: "object", data: { echo: lastUserText(turns) }, schema: output?.object }], meta: { state: "complete" }, object: { echo: lastUserText(turns) } }),
      },
    },
  ]);
}

specimen.describe("Hallucination", () => {
  specimen.describe("context + transcript compilation", () => {
    specimen.it("hoists system text ahead of the conversation, ordered by extend", async () => {
      let seen = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async ({ turns }) => ((seen = turns), { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { state: "complete" } }) },
      }]);
      const hallucination = Hallucination(cortex);
      hallucination.context.system("base persona").context.extend({ language: "pt-BR", learner: { level: "a1" } });
      hallucination.entities.turn.append(userTurn("hi"));
      await hallucination.dialogue.render();

      specimen.expect(seen[0].role).toBe("system");
      const system = seen[0].parts[0].text;
      specimen.expect(system.startsWith("base persona")).toBe(true);
      specimen.expect(system).toContain("language:\npt-BR");
      specimen.expect(system.indexOf("language:")).toBeLessThan(system.indexOf("learner:"));
      specimen.expect(seen[1].role).toBe("user");
    });

    specimen.it("append is order-preserving; replace swaps the transcript", () => {
      const repeated = userTurn("hello");
      const assistant = { role: "assistant", parts: [{ type: "text", text: "hi" }] };
      const appended = Hallucination(populatedCortex());
      appended.entities.turn.append(null, repeated, [assistant, repeated], undefined);
      specimen.expect(appended.entities.turn.all()).toEqual([repeated, assistant, repeated]);

      const replaced = Hallucination(populatedCortex());
      replaced.entities.turn.append(userTurn("old"));
      replaced.entities.turn.replace([userTurn("summary"), userTurn("fresh")]);
      specimen.expect(replaced.entities.turn.all().map((turn) => turn.parts[0].text)).toEqual(["summary", "fresh"]);
    });
  });

  specimen.describe("config", () => {
    specimen.it("configure is chainable and validates", () => {
      const fluent = Hallucination(populatedCortex());
      specimen.expect(fluent.configure({ tune: "capable" }).context.system("persona")).toBe(fluent);

      let error = null;
      try { Hallucination(populatedCortex()).configure({ rounds: 0 }); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid config");
      Hallucination(populatedCortex()).configure({ rounds: "3" });
    });

    specimen.it("cortex.hallucination seeds config eagerly", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.hallucination({ tune: "unleashed" }).configure).toBeDefined();
      let error = null;
      try { cortex.hallucination({ rounds: 0 }); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid config");
    });

    specimen.it("the json getter exposes config, context, tool names, and a turns copy", () => {
      const hallucination = Hallucination(populatedCortex(), { tune: "balanced" });
      hallucination.context.system("persona");
      hallucination.tools.open({ nature: "lookup" }, () => ({}));
      hallucination.entities.turn.append(userTurn("hi"));
      specimen.expect(hallucination.json.tools).toEqual([{ name: "lookup" }]);
      specimen.expect(hallucination.json.tune).toBe("balanced");
      specimen.expect(hallucination.json.turns).toHaveLength(1);
      specimen.expect(hallucination.json.turns).not.toBe(hallucination.entities.turn.all());
    });
  });

  specimen.describe("render → the session yield", () => {
    specimen.it("single-shot returns a complete yield carrying the message", async () => {
      const hallucination = Hallucination(populatedCortex(), { tune: "balanced" });
      hallucination.entities.turn.append(userTurn("hello"));
      const folded = await hallucination.dialogue.render();
      specimen.expect(folded.state).toBe("complete");
      specimen.expect(folded.message).toBe("[sonnet] hello");
      specimen.expect(folded.turns).toHaveLength(1);
    });

    specimen.it("tune selects the faculty: unleashed → opus, balanced → sonnet", async () => {
      const cortex = populatedCortex();
      const opus = Hallucination(cortex, { tune: "unleashed" });
      opus.entities.turn.append(userTurn("test"));
      const sonnet = Hallucination(cortex, { tune: "balanced" });
      sonnet.entities.turn.append(userTurn("test"));
      specimen.expect((await opus.dialogue.render()).message).toContain("[opus]");
      specimen.expect((await sonnet.dialogue.render()).message).toContain("[sonnet]");
    });

    specimen.it("a tool loop runs at the leaf: the tool sees ctx.input, the yield folds the rounds", async () => {
      const hallucination = Hallucination(populatedCortex(), { tune: "unleashed" });
      let received = null;
      hallucination.tools.open({ nature: "lookup" }, async (ctx) => ((received = ctx.input), { message: `${ctx.input.query} means house` }));
      hallucination.entities.turn.append(userTurn("what is casa"));
      const folded = await hallucination.dialogue.render();
      specimen.expect(received.query).toBe("what is casa");
      specimen.expect(folded.state).toBe("complete");
      specimen.expect(folded.turns).toHaveLength(3);
    });

    specimen.it("a slurped mode tool vector arms the hallucination", async () => {
      const modeTools = new Vector();
      let ran = false;
      modeTools.open({ nature: "lookup" }, async () => ((ran = true), { message: "house" }));
      const hallucination = Hallucination(populatedCortex(), { tune: "unleashed" });
      hallucination.tools.slurp(modeTools);
      hallucination.entities.turn.append(userTurn("casa"));
      await hallucination.dialogue.render();
      specimen.expect(ran).toBe(true);
    });

    specimen.it("an unknown tool becomes an error result and the session still completes", async () => {
      let toolResultTurn = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: {
          render: async ({ turns }) => {
            if (hasToolResult(turns)) {
              toolResultTurn = turns.find((turn) => turn.parts?.some((part) => part.type === "tool_result"));
              return { role: "assistant", parts: [{ type: "text", text: "done" }], meta: { state: "complete" } };
            }
            return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "ghost", input: {} }], meta: { state: "tools" } };
          },
        },
      }]);
      const hallucination = Hallucination(cortex);
      hallucination.entities.turn.append(userTurn("test"));
      const folded = await hallucination.dialogue.render();
      specimen.expect(folded.message).toBe("done");
      specimen.expect(toolResultTurn.parts[0].output.error).toContain("ghost");
    });

    specimen.it("rounds ceiling closes length and render throws", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text", "tool_use"] },
        via: { render: async () => ({ role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "loop", input: {} }], meta: { state: "tools" } }) },
      }]);
      const hallucination = Hallucination(cortex, { rounds: 2 });
      hallucination.tools.open({ nature: "loop" }, async () => "again");
      hallucination.entities.turn.append(userTurn("go"));
      let error = null;
      try { await hallucination.dialogue.render(); } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("closed length");
    });
  });

  specimen.describe("stream → session records", () => {
    specimen.it("streams packets across a tool round and closes the session", async () => {
      const hallucination = Hallucination(populatedCortex(), { tune: "unleashed" });
      hallucination.tools.open({ nature: "lookup" }, async (ctx) => ({ message: `${ctx.input.query} means house`, entities: { buffer: [{ id: "b1" }] } }));
      hallucination.entities.turn.append(userTurn("what is casa"));
      const collected = [];
      for await (const packet of await hallucination.dialogue.stream()) collected.push(packet);
      const events = collected.map((packet) => packet.event);
      specimen.expect(events).toContain("/tool/call");
      specimen.expect(events).toContain("/tool/yield");
      specimen.expect(events.at(-1)).toBe("/session/close");
    });
  });

  specimen.describe("object derivation", () => {
    specimen.it("a real object faculty renders straight to the object channel", async () => {
      const hallucination = Hallucination(populatedCortex(), { tune: "balanced" });
      hallucination.entities.turn.append(userTurn("hello"));
      const folded = await hallucination.object.render();
      specimen.expect(folded.object.echo).toBe("hello");
    });

    specimen.it("the object avenue resolves the dialogue faculty and folds its structured turn", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["object"] },
        via: {
          render: async (request) => {
            const data = { verdict: lastUserText(request.turns) };
            return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
          },
        },
      }]);
      specimen.expect(cortex.find({ type: "object" })).toHaveLength(0);
      const hallucination = Hallucination(cortex, { output: { object: { type: "object" } } });
      hallucination.entities.turn.append(userTurn("casa"));
      const folded = await hallucination.object.render();
      specimen.expect(folded.object.verdict).toBe("casa");
    });

    specimen.it("output.object schema reaches the provider on request.output", async () => {
      let seenSchema = null;
      const schema = { marker: "OUT" };
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["object"] },
        via: {
          render: async (request) => {
            seenSchema = request.output?.object;
            return { role: "assistant", parts: [{ type: "object", data: request.output.object }], meta: { state: "complete" }, object: request.output.object };
          },
        },
      }]);
      const hallucination = Hallucination(cortex);
      specimen.expect(hallucination.output.object(schema)).toBe(hallucination);
      hallucination.entities.turn.append(userTurn("hi"));
      const folded = await hallucination.object.render();
      specimen.expect(seenSchema).toEqual(schema);
      specimen.expect(folded.object).toEqual(schema);
    });

    specimen.it("object synthesis runs real tools before the structured turn, lexicon-native", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text", "tool_result"], out: ["text", "tool_use", "object"] },
        via: {
          render: async (request) => {
            if (!hasToolResult(request.turns))
              return { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "drill", input: { count: 1 } }], meta: { state: "tools" } };
            const result = request.turns.at(-1).parts.find((part) => part.type === "tool_result");
            const data = { reply: result.output };
            return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
          },
        },
      }]);
      const hallucination = Hallucination(cortex, { output: { object: { type: "object" } } });
      hallucination.tools.open({ nature: "drill" }, async () => ({ message: "Drill started: 1 exercise.", entities: { buffer: [{ id: "b1" }] } }));
      hallucination.entities.turn.append(userTurn("start a drill"));
      const folded = await hallucination.object.render();
      specimen.expect(folded.object.reply).toBe("Drill started: 1 exercise.");
      specimen.expect(folded.entities.buffer).toHaveLength(1);
    });
  });
});
