import { specimen, Vector, Span, NotFound, shard, steer } from "@vivalence/typology";

const { state, deliver, dispatch, respond, render, signalOf, nameOf } = shard.hallucinate;

function userTurn(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

function sealed(text) {
  return { role: "assistant", parts: [{ type: "text", text }], meta: { state: "complete" } };
}

function toolTurn(id, name, input) {
  return { role: "assistant", parts: [{ type: "tool_use", id, name, input }], meta: { state: "tools" } };
}

function scriptedFaculty(script) {
  let cursor = 0;
  const seen = [];
  return {
    faculty: {
      type: "dialogue",
      via: {
        render: async (request) => {
          seen.push(request);
          const step = script[cursor++];
          if (typeof step === "function") return step(request);
          return step;
        },
      },
    },
    seen,
  };
}

function toolVector(name, effect, edge = {}) {
  const tools = new Vector();
  tools.open({ nature: name, ...edge }, effect);
  return tools;
}

specimen.describe("shard.hallucinate", () => {
  specimen.describe("the wire↔signal codec", () => {
    specimen.it("nameOf and signalOf are inverse across the underscore boundary", () => {
      const steps = [{ nature: "drill" }, { nature: "pick" }];
      specimen.expect(nameOf(steps)).toBe("drill_pick");
      specimen.expect(signalOf("drill_pick").pathname).toBe("/drill/pick");
      specimen.expect(signalOf("lookup").pathname).toBe("/lookup");
    });
  });

  specimen.describe("state", () => {
    specimen.it("reads tool_use parts, falls back to meta.state", () => {
      specimen.expect(state(toolTurn("t1", "x", {}))).toBe("tools");
      specimen.expect(state(sealed("done"))).toBe("complete");
      specimen.expect(state({ parts: [], meta: { state: "length" } })).toBe("length");
      specimen.expect(state({ parts: [] })).toBe("complete");
    });
  });

  specimen.describe("deliver", () => {
    specimen.it("retries a pre-flow retryable fault, honouring backoff order", async () => {
      let attempts = 0;
      const span = new Span("/test");
      const pump = () => {
        attempts += 1;
        if (attempts < 3) {
          const fault = new Error("overloaded");
          fault.retryable = true;
          throw fault;
        }
        return (async function* () {
          yield { event: "/turn/open", turn: { role: "assistant" } };
        })();
      };
      const packets = [];
      for await (const packet of deliver(pump, [0, 0, 0], span)) packets.push(packet);
      specimen.expect(attempts).toBe(3);
      specimen.expect(packets).toHaveLength(1);
    });

    specimen.it("never retries a non-retryable fault", async () => {
      let attempts = 0;
      const span = new Span("/test");
      const pump = () => {
        attempts += 1;
        throw new Error("boom");
      };
      let thrown = null;
      try {
        for await (const _ of deliver(pump, [0, 0], span)) void _;
      } catch (error) {
        thrown = error;
      }
      specimen.expect(attempts).toBe(1);
      specimen.expect(thrown.message).toBe("boom");
    });

    specimen.it("never retries once packets have flowed — no double billing", async () => {
      let attempts = 0;
      const span = new Span("/test");
      const pump = () => {
        attempts += 1;
        return (async function* () {
          yield { event: "/turn/open", turn: { role: "assistant" } };
          const fault = new Error("mid-stream");
          fault.retryable = true;
          throw fault;
        })();
      };
      let thrown = null;
      const packets = [];
      try {
        for await (const packet of deliver(pump, [0, 0], span)) packets.push(packet);
      } catch (error) {
        thrown = error;
      }
      specimen.expect(attempts).toBe(1);
      specimen.expect(packets).toHaveLength(1);
      specimen.expect(thrown.message).toBe("mid-stream");
    });

    specimen.it("exhausts backoff then rethrows", async () => {
      let attempts = 0;
      const span = new Span("/test");
      const pump = () => {
        attempts += 1;
        const fault = new Error("always");
        fault.retryable = true;
        throw fault;
      };
      let thrown = null;
      try {
        for await (const _ of deliver(pump, [0], span)) void _;
      } catch (error) {
        thrown = error;
      }
      specimen.expect(attempts).toBe(2);
      specimen.expect(thrown.message).toBe("always");
    });
  });

  specimen.describe("dispatch", () => {
    specimen.it("routes a signal to its tool, packs the yield channels", async () => {
      const tools = toolVector("lookup", async (ctx) => ({ message: `${ctx.input.query} means house` }));
      const span = new Span("/test");
      const settled = await dispatch(tools, [{ type: "tool_use", id: "u1", name: "lookup", input: { query: "casa" } }], span);
      specimen.expect(settled).toHaveLength(1);
      specimen.expect(settled[0].result.output.message).toBe("casa means house");
      specimen.expect(settled[0].result.condition).toBe("NOMINAL");
    });

    specimen.it("an unknown tool becomes an error result, not a throw", async () => {
      const tools = new Vector();
      const span = new Span("/test");
      const settled = await dispatch(tools, [{ type: "tool_use", id: "u1", name: "ghost", input: {} }], span);
      specimen.expect(settled[0].result.condition).toBe("ERROR");
      specimen.expect(settled[0].result.output.message.error).toContain("ghost");
    });

    specimen.it("runs parallel tool calls", async () => {
      const tools = new Vector();
      tools.open({ nature: "a" }, async () => "A");
      tools.open({ nature: "b" }, async () => "B");
      const span = new Span("/test");
      const settled = await dispatch(
        tools,
        [
          { type: "tool_use", id: "u1", name: "a", input: {} },
          { type: "tool_use", id: "u2", name: "b", input: {} },
        ],
        span,
      );
      specimen.expect(settled.map((entry) => entry.result.output.message)).toEqual(["A", "B"]);
    });

    specimen.it("marks a span branch per tool", async () => {
      const tools = toolVector("lookup", async () => "ok");
      const span = new Span("/test");
      await dispatch(tools, [{ type: "tool_use", id: "u1", name: "lookup", input: { q: 1 } }], span);
      const opened = span.records.find((record) => record.verb === "open" && record.path.endsWith("/lookup"));
      specimen.expect(opened).toBeDefined();
      specimen.expect(opened.data.input).toEqual({ q: 1 });
    });
  });

  specimen.describe("respond", () => {
    specimen.it("emits open→close for a complete render, exactly one /response/close", async () => {
      const { faculty } = scriptedFaculty([sealed("hello")]);
      const events = [];
      for await (const event of respond(faculty, "render", { turns: [userTurn("hi")] }, { rounds: 5, backoff: [], tools: new Vector() }))
        events.push(event);
      const closes = events.filter((event) => event.event === "/response/close");
      specimen.expect(closes).toHaveLength(1);
      specimen.expect(closes[0].meta.state).toBe("complete");
      specimen.expect(closes[0].meta.rounds).toBe(1);
    });

    specimen.it("runs a tool round: call→yield→turn/full then closes complete", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "lookup", { query: "casa" }),
        sealed("casa means house"),
      ]);
      const tools = toolVector("lookup", async () => ({ message: "house" }));
      const events = [];
      for await (const event of respond(faculty, "render", { turns: [userTurn("what is casa")] }, { rounds: 5, backoff: [], tools }))
        events.push(event.event);
      specimen.expect(events).toContain("/tool/call");
      specimen.expect(events).toContain("/tool/yield");
      specimen.expect(events).toContain("/turn/full");
      specimen.expect(events.at(-1)).toBe("/response/close");
    });

    specimen.it("closes length when the loop never settles", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "loop", {}),
        toolTurn("u2", "loop", {}),
        toolTurn("u3", "loop", {}),
      ]);
      const tools = toolVector("loop", async () => "again");
      let close = null;
      for await (const event of respond(faculty, "render", { turns: [userTurn("go")] }, { rounds: 2, backoff: [], tools }))
        if (event.event === "/response/close") close = event;
      specimen.expect(close.meta.state).toBe("length");
      specimen.expect(close.meta.rounds).toBe(2);
    });

    specimen.it("closes error when the faculty faults unrecoverably", async () => {
      const faculty = {
        type: "dialogue",
        via: {
          render: async () => {
            throw new Error("provider down");
          },
        },
      };
      let close = null;
      for await (const event of respond(faculty, "render", { turns: [userTurn("hi")] }, { rounds: 3, backoff: [], tools: new Vector() }))
        if (event.event === "/response/close") close = event;
      specimen.expect(close.meta.state).toBe("error");
    });
  });

  specimen.describe("render", () => {
    specimen.it("folds the response into a yield object", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "lookup", { query: "casa" }),
        sealed("casa means house"),
      ]);
      const tools = toolVector("lookup", async () => ({ message: "house", buffer: [{ id: "b1" }] }));
      const folded = await render(faculty, { turns: [userTurn("what is casa")] }, { rounds: 5, backoff: [], tools });
      specimen.expect(folded.meta.state).toBe("complete");
      specimen.expect(folded.output.message).toBe("casa means house");
      specimen.expect(folded.output.buffer).toHaveLength(1);
      specimen.expect(folded.turns.length).toBe(3);
    });

    specimen.it("throws when the response closes non-complete", async () => {
      const faculty = { type: "dialogue", via: { render: async () => { throw new Error("down"); } } };
      let thrown = null;
      try {
        await render(faculty, { turns: [userTurn("hi")] }, { rounds: 2, backoff: [], tools: new Vector() });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown.message).toContain("closed error");
    });
  });
});
