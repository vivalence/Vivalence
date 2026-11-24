import { specimen, Controller, Vector, Span, NotFound, belt, steer, trace, v } from "@vivalence/typology";

const { state, deliver, dispatch, respond, render, signalOf, nameOf } = belt.hallucinate;
const { Packet, Response } = v.primitives.hallucination;

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

specimen.describe("belt.hallucinate", () => {
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
      const controller = new Controller({ stdout: new Span("/test") });
      const settled = await dispatch({ tools, controller }, [{ type: "tool_use", id: "u1", name: "lookup", input: { query: "casa" } }] );
      specimen.expect(settled).toHaveLength(1);
      specimen.expect(settled[0].result.product.message).toBe("casa means house");
      specimen.expect(settled[0].result.condition).toBe("NOMINAL");
    });

    specimen.it("an unknown tool becomes an error result, not a throw", async () => {
      const tools = new Vector();
      const controller = new Controller({ stdout: new Span("/test") });
      const settled = await dispatch({ tools, controller }, [{ type: "tool_use", id: "u1", name: "ghost", input: {} }] );
      specimen.expect(settled[0].result.condition).toBe("ERROR");
      specimen.expect(settled[0].result.product.message).toContain("unknown tool: ghost");
    });

    specimen.it("runs tool calls one at a time, in the model's order — the second sees what the first wrote", async () => {
      const written = [];
      const tools = new Vector();
      tools.open({ nature: "a" }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        written.push("A");
        return "A";
      });
      tools.open({ nature: "b" }, async () => written.join(",") || "nothing yet");
      const controller = new Controller({ stdout: new Span("/test") });
      const settled = await dispatch(
        { tools, controller },
        [
          { type: "tool_use", id: "u1", name: "a", input: {} },
          { type: "tool_use", id: "u2", name: "b", input: {} },
        ],
      );
      specimen.expect(settled.map((entry) => entry.result.product.message)).toEqual(["A", "A"]);
    });

    specimen.it("marks a span branch per tool", async () => {
      const tools = toolVector("lookup", async () => "ok");
      const controller = new Controller({ stdout: new Span("/test") });
      await dispatch({ tools, controller }, [{ type: "tool_use", id: "u1", name: "lookup", input: { q: 1 } }]);
      const branch = controller.stdout.history.filter((record) => trace.key(record.path) === trace.key([...controller.stdout.absolute, "lookup/u1"]));
      specimen.expect(branch.map((record) => record.track)).toEqual(["status", "start", "log", "log", "stop", "status"]);
      specimen.expect(branch[2].data.input).toEqual({ q: 1 });
    });
  });

  specimen.describe("respond", () => {
    specimen.it("emits open→close for a complete render, exactly one /response/close", async () => {
      const { faculty } = scriptedFaculty([sealed("hello")]);
      const events = [];
      for await (const event of respond(faculty, "render", { turns: [userTurn("hi")] }, { rounds: 5, backoff: [], tools: new Vector(), controller: new Controller() }))
        events.push(event);
      const closes = events.filter((event) => event.event === "/response/close");
      specimen.expect(closes).toHaveLength(1);
      specimen.expect(closes[0].response.meta.state).toBe("complete");
      specimen.expect(closes[0].response.meta.rounds).toBe(1);
      for (const event of events) specimen.expect(event).matches(Packet.Response);
    });

    specimen.it("runs a tool round: its results ride /turn/full once, then closes complete", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "lookup", { query: "casa" }),
        sealed("casa means house"),
      ]);
      const tools = toolVector("lookup", async () => ({ message: "house" }));
      const events = [];
      for await (const event of respond(faculty, "render", { turns: [userTurn("what is casa")] }, { rounds: 5, backoff: [], tools, controller: new Controller() }))
        events.push(event);
      for (const event of events) specimen.expect(event).matches(Packet.Response);
      const full = events.filter((event) => event.event === "/turn/full");
      specimen.expect(full).toHaveLength(1);
      specimen.expect(full[0].turn.parts).toEqual([
        { type: "tool_result", id: "u1", condition: "NOMINAL", product: { message: "house" } },
      ]);
      specimen.expect(events.at(-1).event).toBe("/response/close");
    });

    specimen.it("closes length when the loop never settles", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "loop", {}),
        toolTurn("u2", "loop", {}),
        toolTurn("u3", "loop", {}),
      ]);
      const tools = toolVector("loop", async () => "again");
      let close = null;
      for await (const event of respond(faculty, "render", { turns: [userTurn("go")] }, { rounds: 2, backoff: [], tools, controller: new Controller() }))
        if (event.event === "/response/close") close = event;
      specimen.expect(close.response.meta.state).toBe("length");
      specimen.expect(close.response.meta.rounds).toBe(2);
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
      for await (const event of respond(faculty, "render", { turns: [userTurn("hi")] }, { rounds: 3, backoff: [], tools: new Vector(), controller: new Controller() }))
        if (event.event === "/response/close") close = event;
      specimen.expect(close.response.meta.state).toBe("error");
    });
  });

  specimen.describe("render", () => {
    specimen.it("folds the response into a Response: condition · product · turns · meta, no open", async () => {
      const { faculty } = scriptedFaculty([
        toolTurn("u1", "lookup", { query: "casa" }),
        sealed("casa means house"),
      ]);
      const tools = toolVector("lookup", async () => ({ message: "house", buffer: [{ id: "b1" }] }));
      const folded = await render(faculty, { turns: [userTurn("what is casa")] }, { rounds: 5, backoff: [], tools, controller: new Controller() });
      specimen.expect(folded).matches(Response);
      specimen.expect(Object.keys(folded).sort()).toEqual(["condition", "meta", "product", "turns"]);
      specimen.expect(folded.meta.state).toBe("complete");
      specimen.expect(folded.product.message).toBe("casa means house");
      specimen.expect(folded.product.buffer).toHaveLength(1);
      specimen.expect(folded.turns.length).toBe(3);
    });

    specimen.it("throws when the response closes non-complete", async () => {
      const faculty = { type: "dialogue", via: { render: async () => { throw new Error("down"); } } };
      let thrown = null;
      try {
        await render(faculty, { turns: [userTurn("hi")] }, { rounds: 2, backoff: [], tools: new Vector(), controller: new Controller() });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown.message).toContain("closed error");
    });

    specimen.it("the thrown message carries the provider fault — the reason a 500 was minted is never dropped", async () => {
      const refused = {
        type: "dialogue",
        via: {
          render: async () => {
            throw { kind: "request", retryable: false, provider: { status: 401, message: "Could not resolve authentication method" } };
          },
        },
      };
      let thrown = null;
      try {
        await render(refused, { turns: [userTurn("hi")] }, { rounds: 2, backoff: [], tools: new Vector(), controller: new Controller() });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown.message).toContain("closed error after 1 rounds");
      specimen.expect(thrown.message).toContain("Could not resolve authentication method");

      const plain = { type: "dialogue", via: { render: async () => { throw new Error("down"); } } };
      thrown = null;
      try {
        await render(plain, { turns: [userTurn("hi")] }, { rounds: 2, backoff: [], tools: new Vector(), controller: new Controller() });
      } catch (error) {
        thrown = error;
      }
      specimen.expect(thrown.message).toContain("down");
    });
  });

  specimen.describe("the meter — every faculty writes what it used onto its span's usage track", () => {
    const { transcribe, converse, synthesize, vocalize, depict, choose } = belt.hallucinate;
    const { Usage } = v.primitives.track;

    const tenth = btoa(String.fromCharCode(...new Uint8Array(3200)));
    const pcm = () => ({ event: "/audio/packet", audio: { data: tenth, rate: 16000, codec: "pcm_16000" } });
    const tokens = (input, output) => [
      { name: "input", unit: "tokens", amount: input },
      { name: "output", unit: "tokens", amount: output },
    ];
    const bench = (type, via) => ({ type, provider: "bench", id: `bench/${type}`, via });
    const hallucination = () => new Controller({ stdout: new Span("hallucination") });
    const used = (controller) => controller.stdout.history.filter((record) => record.track === "usage").map((record) => record.data);
    const counted = (record) =>
      record.measures
        .filter((measure) => measure.unit !== "ms")
        .map((measure) => [measure.name, measure.unit, measure.channel, measure.by, measure.amount].filter((key) => key !== undefined).join(" "));

    async function* said(texts, usage) {
      yield { event: "/turn/open", turn: { role: "assistant" } };
      yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
      for (const text of texts) yield { event: "/part/delta", index: 0, part: { text } };
      yield { event: "/part/close", index: 0 };
      yield { event: "/turn/close", turn: { meta: { state: "complete", ...(usage ? { usage } : {}) } } };
    }

    async function* called() {
      yield { event: "/turn/open", turn: { role: "assistant" } };
      yield { event: "/part/open", index: 0, part: { type: "tool_use", id: "u1", name: "lookup", input: {} } };
      yield { event: "/part/delta", index: 0, part: { input: { query: "casa" } } };
      yield { event: "/part/close", index: 0 };
      yield { event: "/turn/close", turn: { meta: { state: "tools", usage: tokens(40, 5) } } };
    }

    async function* microphone(packets) {
      yield* packets;
    }

    const drained = async (packets) => {
      for await (const _packet of packets);
    };

    specimen.it("a dialogue stream: a running record per closed part, a closed one per provider call, the provider's tokens stamped with its name", async () => {
      const script = [called, () => said(["casa means ", "house"], [...tokens(60, 7), { name: "cost", unit: "usd", amount: 0.002 }])];
      const faculty = bench("dialogue", { stream: () => script.shift()() });
      const controller = hallucination();
      const tools = toolVector("lookup", async () => ({ message: "house" }));
      await drained(respond(faculty, "stream", { turns: [userTurn("what is casa")] }, { rounds: 5, backoff: [], tools, controller }));

      const records = used(controller);
      for (const record of records) specimen.expect(record).matches(Usage);
      specimen.expect(records.map((record) => record.state)).toEqual([undefined, "tools", undefined, "complete"]);
      specimen.expect(records.map((record) => record.subject.round)).toEqual([1, 1, 2, 2]);
      specimen.expect(records[1].subject).toEqual({ faculty: "dialogue", provider: "bench", id: "bench/dialogue", via: "stream", round: 1 });
      specimen.expect(counted(records[0])).toEqual(["output chars tool_use cortex 16"]);
      specimen.expect(counted(records[1])).toEqual(["output chars tool_use cortex 16", "input tokens bench 40", "output tokens bench 5"]);
      specimen.expect(counted(records[3])).toEqual([
        "output chars text cortex 16",
        "input tokens bench 60",
        "output tokens bench 7",
        "cost usd bench 0.002",
      ]);
      specimen.expect(records[3].measures.slice(0, 2).map((measure) => `${measure.name} ${measure.unit} ${measure.by}`)).toEqual([
        "elapsed ms cortex",
        "first ms cortex",
      ]);
      specimen.expect(records[3].measures[0].amount).toBeGreaterThanOrEqual(records[3].measures[1].amount);
    });

    specimen.it("a part that is neither text nor tool input is left uncounted; the call closes complete", async () => {
      const faculty = bench("object", {
        render: async () => ({ role: "assistant", parts: [{ type: "object", data: { word: "casa" } }], meta: { state: "complete" } }),
      });
      const controller = hallucination();
      let close = null;
      for await (const packet of respond(faculty, "render", { turns: [userTurn("hi")] }, { rounds: 2, backoff: [], tools: new Vector(), controller }))
        if (packet.event === "/response/close") close = packet;
      specimen.expect(close.response.meta.state).toBe("complete");
      const closed = used(controller).at(-1);
      specimen.expect(closed.state).toBe("complete");
      specimen.expect(counted(closed)).toEqual([]);
    });

    specimen.it("an ear: seconds of pcm heard, chars written; audio that is not pcm is left uncounted and breaks nothing", async () => {
      const faculty = bench("verbatim", {
        stream: async function* ({ source }) {
          await drained(source);
          yield* said(["ciao"]);
        },
      });
      const controller = hallucination();
      const source = microphone([pcm(), pcm(), { event: "/audio/packet", audio: { data: "not base64!", rate: 16000 } }]);
      let heard = "";
      for await (const packet of transcribe(faculty, { source }, { controller }))
        if (packet.event === "/part/delta") heard += packet.part.text;
      const closed = used(controller).at(-1);
      specimen.expect(closed).matches(Usage);
      specimen.expect(closed.state).toBe("complete");
      specimen.expect(closed.subject).toEqual({ faculty: "verbatim", provider: "bench", id: "bench/verbatim", via: "stream", round: 1 });
      specimen.expect(heard.trim()).toBe("ciao");
      specimen.expect(counted(closed)).toEqual(["input seconds audio cortex 0.2", `output chars text cortex ${heard.length}`]);
    });

    specimen.it("a mouth, streamed: chars read, seconds spoken; a listener who leaves early closes it abort", async () => {
      const faculty = bench("speech", {
        stream: async function* () {
          yield pcm();
          yield pcm();
          yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
        },
      });
      const whole = hallucination();
      await drained(synthesize(faculty, { source: "ciao a tutti" }, { controller: whole }));
      specimen.expect(used(whole).at(-1).state).toBe("complete");
      specimen.expect(counted(used(whole).at(-1))).toEqual(["input chars text cortex 12", "output seconds audio cortex 0.2"]);

      const left = hallucination();
      for await (const _packet of synthesize(faculty, { source: "ciao a tutti" }, { controller: left })) break;
      specimen.expect(used(left).at(-1).state).toBe("abort");
      specimen.expect(counted(used(left).at(-1))).toEqual(["input chars text cortex 12", "output seconds audio cortex 0.1"]);
    });

    specimen.it("a mouth, rendered: chars read, bytes returned; a fault still writes its record, closed error", async () => {
      const controller = hallucination();
      await vocalize(bench("speech", { render: async () => new Uint8Array(9000) }), { source: "ciao a tutti" }, { controller });
      specimen.expect(used(controller)).toHaveLength(1);
      specimen.expect(used(controller)[0].subject.via).toBe("render");
      specimen.expect(counted(used(controller)[0])).toEqual(["input chars text cortex 12", "output bytes audio cortex 9000"]);

      const failing = hallucination();
      const down = bench("speech", {
        render: async () => {
          throw new Error("provider down");
        },
      });
      await specimen.expect(vocalize(down, { source: "ciao" }, { controller: failing })).rejects.toThrow("provider down");
      specimen.expect(used(failing)).toHaveLength(1);
      specimen.expect(used(failing)[0].state).toBe("error");
      specimen.expect(counted(used(failing)[0])).toEqual(["input chars text cortex 4"]);
    });

    specimen.it("a painter: the prompt's chars, pictures in and out, the provider's cost", async () => {
      const faculty = bench("picture", {
        render: async () => ({
          images: [{ type: "image", mime: "image/png", data: "iVBOR" }],
          meta: { usage: [{ name: "cost", unit: "usd", amount: 0.04 }] },
        }),
      });
      const controller = hallucination();
      await depict(faculty, { prompt: "a red fox", images: [] }, { controller });
      const closed = used(controller).at(-1);
      specimen.expect(closed).matches(Usage);
      specimen.expect(closed.state).toBe("complete");
      specimen.expect(counted(closed)).toEqual([
        "input chars text cortex 9",
        "cost usd bench 0.04",
        "input images image cortex 0",
        "output images image cortex 1",
      ]);
    });

    specimen.it("a chooser: the questions it was asked", async () => {
      const controller = hallucination();
      const round = { system: {}, questions: { same: { type: "noul", ask: "same?" }, ok: { type: "noul", ask: "ok?" } } };
      await choose(bench("choice", { render: async () => ({ same: 0.9, ok: 0.1 }) }), round, { controller });
      specimen.expect(used(controller)).toHaveLength(1);
      specimen.expect(used(controller)[0].state).toBe("complete");
      specimen.expect(counted(used(controller)[0])).toEqual(["input questions cortex 2"]);
    });

    specimen.it("a call: audio both ways, the words it said, the provider's tokens, in one record", async () => {
      const faculty = bench("call", {
        stream: async function* ({ source }) {
          await drained(source);
          yield* said(["ciao"], tokens(9, 2));
          yield pcm();
          yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
        },
      });
      const controller = hallucination();
      await drained(converse(faculty, { source: microphone([pcm()]), turns: [] }, { controller, tools: new Vector() }));
      const closed = used(controller).at(-1);
      specimen.expect(closed).matches(Usage);
      specimen.expect(closed.state).toBe("complete");
      specimen.expect(counted(closed)).toEqual([
        "input seconds audio cortex 0.1",
        "output seconds audio cortex 0.1",
        "output chars text cortex 4",
        "input tokens bench 9",
        "output tokens bench 2",
      ]);
    });
  });
});
