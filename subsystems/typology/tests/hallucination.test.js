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

function toolVector(nature, execute) {
  return new Vector().open({ nature }, execute);
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
        render: async (source) => new TextEncoder().encode(source),
      },
    },
    {
      type: "object",
      tune: [0.3, 0.7, 0.8],
      channels: { in: ["text"], out: ["object"] },
      via: {
        render: async ({ turns, output }) => ({ role: "assistant", parts: [{ type: "object", data: { echo: lastUserText(turns) }, schema: output?.schema }], meta: { state: "complete" }, object: { echo: lastUserText(turns) } }),
      },
    },
  ]);
}

specimen.describe("Hallucination", () => {
  specimen.describe("the request record — WHAT rides the invocation", () => {
    specimen.it("system sections cross keyed and ordered; turns carry no system turn", async () => {
      let seen = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async (request) => ((seen = request), { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { state: "complete" } }) },
      }]);
      await Hallucination(cortex).dialogue.render({
        system: { persona: "base persona", language: "pt-BR" },
        turns: [userTurn("hi")],
      });

      specimen.expect(Object.keys(seen.system)).toEqual(["persona", "language"]);
      specimen.expect(seen.system.persona).toBe("base persona");
      specimen.expect(seen.turns[0].role).toBe("user");
      specimen.expect(seen.cache).toEqual({ marks: ["context"] });
    });

    specimen.it("an explicit cache.marks wins over the derived marks", async () => {
      let seen = null;
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text"] },
        via: { render: async (request) => ((seen = request), { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { state: "complete" } }) },
      }]);
      await Hallucination(cortex).dialogue.render({
        system: { persona: "stable", state: "volatile" },
        turns: [userTurn("hi")],
        cache: { marks: ["persona"] },
      });
      specimen.expect(seen.cache).toEqual({ marks: ["persona"] });
    });
  });

  specimen.describe("policy — WHO and HOW LONG, validated per invocation", () => {
    specimen.it("an invalid policy throws at the call; scalars cast", async () => {
      let error = null;
      try {
        await Hallucination(populatedCortex()).dialogue.render({ policy: { rounds: 0 }, turns: [userTurn("hi")] });
      } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid policy");
      await Hallucination(populatedCortex()).dialogue.render({ policy: { rounds: "3", tune: "balanced" }, turns: [userTurn("hi")] });
    });

    specimen.it("cortex.hallucinate is the ONE typed-fetch surface, built lazily", () => {
      const cortex = populatedCortex();
      specimen.expect(cortex.hallucinate.dialogue).toBeDefined();
      specimen.expect(cortex.hallucinate).toBe(cortex.hallucinate);
    });
  });

  specimen.describe("render → the response yield", () => {
    specimen.it("single-shot returns a complete yield carrying the message", async () => {
      const folded = await Hallucination(populatedCortex())
        .dialogue.render({ policy: { tune: "balanced" }, turns: [userTurn("hello")] });
      specimen.expect(folded.meta.state).toBe("complete");
      specimen.expect(folded.output.message).toBe("[sonnet] hello");
      specimen.expect(folded.turns).toHaveLength(1);
    });

    specimen.it("tune selects the faculty: unleashed → opus, balanced → sonnet", async () => {
      const hal = populatedCortex().hallucinate;
      const turns = [userTurn("test")];
      specimen.expect((await hal.dialogue.render({ policy: { tune: "unleashed" }, turns })).output.message).toContain("[opus]");
      specimen.expect((await hal.dialogue.render({ policy: { tune: "balanced" }, turns })).output.message).toContain("[sonnet]");
    });

    specimen.it("a tools Vector on the request is LOWERED to the wire catalog and dispatched", async () => {
      let received = null;
      const folded = await Hallucination(populatedCortex()).dialogue.render({
        policy: { tune: "unleashed" },
        turns: [userTurn("what is casa")],
        tools: toolVector("lookup", async (ctx) => ((received = ctx.input), { message: `${ctx.input.query} means house` })),
      });
      specimen.expect(received.query).toBe("what is casa");
      specimen.expect(folded.meta.state).toBe("complete");
      specimen.expect(folded.turns).toHaveLength(3);
    });

    specimen.it("a slurped mode tool vector arms the request", async () => {
      const modeTools = new Vector();
      let ran = false;
      modeTools.open({ nature: "lookup" }, async () => ((ran = true), { message: "house" }));
      const armed = new Vector().slurp(modeTools);
      await Hallucination(populatedCortex())
        .dialogue.render({ policy: { tune: "unleashed" }, turns: [userTurn("casa")], tools: armed });
      specimen.expect(ran).toBe(true);
    });

    specimen.it("an unknown tool becomes an error result and the response still completes", async () => {
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
      const folded = await Hallucination(cortex).dialogue.render({ turns: [userTurn("test")] });
      specimen.expect(folded.output.message).toBe("done");
      specimen.expect(toolResultTurn.parts[0].output.message.error).toContain("ghost");
    });

    specimen.it("rounds ceiling closes length and render throws", async () => {
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["text", "tool_use"] },
        via: { render: async () => ({ role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "loop", input: {} }], meta: { state: "tools" } }) },
      }]);
      let error = null;
      try {
        await Hallucination(cortex).dialogue.render({
          policy: { rounds: 2 },
          turns: [userTurn("go")],
          tools: toolVector("loop", async () => "again"),
        });
      } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("closed length");
    });
  });

  specimen.describe("stream → response records", () => {
    specimen.it("streams packets across a tool round and closes the response", async () => {
      const source = await Hallucination(populatedCortex()).dialogue.stream({
        policy: { tune: "unleashed" },
        turns: [userTurn("what is casa")],
        tools: toolVector("lookup", async (ctx) => ({ message: `${ctx.input.query} means house`, buffer: [{ id: "b1" }] })),
      });
      const collected = [];
      for await (const packet of source) collected.push(packet);
      const events = collected.map((packet) => packet.event);
      specimen.expect(events).toContain("/tool/call");
      specimen.expect(events).toContain("/tool/yield");
      specimen.expect(events.at(-1)).toBe("/response/close");
    });
  });

  specimen.describe("speech render → vocalize", () => {
    specimen.it("returns the faculty's finished bytes for a source text", async () => {
      const bytes = await Hallucination(populatedCortex()).speech.render({ source: "ciao" });
      specimen.expect(bytes instanceof Uint8Array).toBe(true);
      specimen.expect(new TextDecoder().decode(bytes)).toBe("ciao");
    });

    specimen.it("throws when no speech faculty carries a render avenue", async () => {
      const cortex = new Cortex().register([{
        type: "speech", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["audio"] },
        via: { stream: async function* () {} },
      }]);
      let failure = null;
      await Hallucination(cortex).speech.render({ source: "ciao" }).catch((error) => (failure = error));
      specimen.expect(failure?.message).toContain("no 'speech' faculty resolves a 'render' avenue");
    });
  });

  specimen.describe("object derivation", () => {
    specimen.it("a real object faculty renders straight to the object channel", async () => {
      const folded = await Hallucination(populatedCortex())
        .object.render({ policy: { tune: "balanced" }, turns: [userTurn("hello")] });
      specimen.expect(folded.output.object.echo).toBe("hello");
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
      const folded = await Hallucination(cortex).object.render({
        turns: [userTurn("casa")],
        output: { schema: { type: "object" } },
      });
      specimen.expect(folded.output.object.verdict).toBe("casa");
    });

    specimen.it("output.schema reaches the provider on request.output", async () => {
      let seenSchema = null;
      const schema = { marker: "OUT" };
      const cortex = new Cortex().register([{
        type: "dialogue", tune: [0.5, 0.5, 0.5],
        channels: { in: ["text"], out: ["object"] },
        via: {
          render: async (request) => {
            seenSchema = request.output?.schema;
            return { role: "assistant", parts: [{ type: "object", data: request.output.schema }], meta: { state: "complete" }, object: request.output.schema };
          },
        },
      }]);
      const folded = await Hallucination(cortex).object.render({
        turns: [userTurn("hi")],
        output: { schema },
      });
      specimen.expect(seenSchema).toEqual(schema);
      specimen.expect(folded.output.object).toEqual(schema);
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
            const data = { reply: result.output.message };
            return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
          },
        },
      }]);
      const folded = await Hallucination(cortex).object.render({
        turns: [userTurn("start a drill")],
        tools: toolVector("drill", async () => ({ message: "Drill started: 1 exercise.", buffer: [{ id: "b1" }] })),
        output: { schema: { type: "object" } },
      });
      specimen.expect(folded.output.object.reply).toBe("Drill started: 1 exercise.");
      specimen.expect(folded.output.buffer).toHaveLength(1);
    });
  });
});
