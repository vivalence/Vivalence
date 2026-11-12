import { specimen, soma, v } from "@vivalence/typology";

const { Packet } = v.primitives.hallucination;

function packets(role, parts, meta = { state: "complete" }) {
  const emitted = [{ event: "/turn/open", turn: { role } }];
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const shell = { ...part };
    if (part.type === "text" || part.type === "thinking") shell.text = "";
    if (part.type === "tool_use") shell.input = {};
    if (part.type === "audio") shell.data = "";
    emitted.push({ event: "/part/open", index, part: shell });
    if (part.type === "text" || part.type === "thinking") {
      for (const character of part.text) {
        emitted.push({ event: "/part/delta", index, part: { text: character } });
      }
    } else if (part.type === "tool_use") {
      emitted.push({ event: "/part/delta", index, part: { input: part.input } });
    } else if (part.type === "audio") {
      emitted.push({ event: "/part/delta", index, part: { data: part.data } });
    }
    emitted.push({ event: "/part/close", index });
  }
  emitted.push({ event: "/turn/close", turn: { meta } });
  return emitted;
}

async function* asStream(packetArray) {
  for (const packet of packetArray) yield packet;
}

specimen.describe("soma", () => {
  specimen.it("a stream pours into a turn across every channel", () => {
    const textual = packets("assistant", [
      { type: "text", text: "hello world" },
    ], { state: "complete", usage: { input: 5, output: 11 } });
    for (const packet of textual) specimen.expect(packet).matches(Packet.Response);
    let turn = null;
    for (const packet of textual) turn = soma.pour(turn, packet);
    specimen.expect(turn.role).toBe("assistant");
    specimen.expect(turn.parts).toHaveLength(1);
    specimen.expect(turn.parts[0].type).toBe("text");
    specimen.expect(turn.parts[0].text).toBe("hello world");
    specimen.expect(turn.meta.state).toBe("complete");
    specimen.expect(turn.meta.usage.input).toBe(5);

    const layered = packets("assistant", [
      { type: "text", text: "analyzing..." },
      { type: "tool_use", id: "t1", name: "lookup", input: { q: "casa" } },
      { type: "thinking", text: "the user asked about casa" },
    ], { state: "tools" });
    turn = null;
    for (const packet of layered) turn = soma.pour(turn, packet);
    specimen.expect(turn.parts).toHaveLength(3);
    specimen.expect(turn.parts[0].text).toBe("analyzing...");
    specimen.expect(turn.parts[1].type).toBe("tool_use");
    specimen.expect(turn.parts[1].input).toEqual({ q: "casa" });
    specimen.expect(turn.parts[1].name).toBe("lookup");
    specimen.expect(turn.parts[2].type).toBe("thinking");
    specimen.expect(turn.parts[2].text).toBe("the user asked about casa");
    specimen.expect(turn.meta.state).toBe("tools");
  });

  specimen.it("a tool opens valid with input {}, its delta carries the parsed input; an object delta replaces", () => {
    const filled = packets("assistant", [
      { type: "tool_use", id: "t1", name: "lookup", input: { query: "casa" } },
    ], { state: "tools" });
    for (const packet of filled) specimen.expect(packet).matches(Packet.Response);
    let turn = null;
    for (const packet of filled) turn = soma.pour(turn, packet);
    specimen.expect(turn.parts[0].input).toEqual({ query: "casa" });

    const opened = [
      { event: "/turn/open", turn: { role: "assistant" } },
      { event: "/part/open", index: 0, part: { type: "tool_use", id: "t2", name: "ping", input: {} } },
      { event: "/part/close", index: 0 },
      { event: "/turn/close", turn: { meta: { state: "tools" } } },
    ];
    turn = null;
    for (const packet of opened) turn = soma.pour(turn, packet);
    specimen.expect(turn.parts[0].input).toEqual({});

    const objectDeltas = [
      { event: "/turn/open", turn: { role: "assistant" } },
      { event: "/part/open", index: 0, part: { type: "object", data: null } },
      { event: "/part/delta", index: 0, part: { data: { first: true } } },
      { event: "/part/delta", index: 0, part: { data: { second: true } } },
      { event: "/part/close", index: 0 },
      { event: "/turn/close", turn: { meta: {} } },
    ];
    turn = null;
    for (const packet of objectDeltas) turn = soma.pour(turn, packet);
    specimen.expect(turn.parts[0].data).toEqual({ second: true });
  });

  specimen.it("a turn drains into packets and pours back whole", () => {
    const turn = {
      role: "assistant",
      parts: [
        { type: "text", text: "hello" },
        { type: "tool_use", id: "t1", name: "lookup", input: { q: "test" } },
      ],
      meta: { state: "tools" },
    };
    const drained = [...soma.drain(turn)];
    for (const packet of drained) specimen.expect(packet).matches(Packet.Response);
    specimen.expect(drained[0]).toEqual({ event: "/turn/open", turn: { role: "assistant" } });
    specimen.expect(drained[1].event).toBe("/part/open");
    specimen.expect(drained[1].part).toEqual({ type: "text", text: "" });
    specimen.expect(drained[2].event).toBe("/part/delta");
    specimen.expect(drained[2].part).toEqual({ text: "hello" });
    specimen.expect(drained[3].event).toBe("/part/close");
    specimen.expect(drained[4].event).toBe("/part/open");
    specimen.expect(drained[4].part).toEqual({ type: "tool_use", id: "", name: "", input: {} });
    specimen.expect(drained[5].event).toBe("/part/delta");
    specimen.expect(drained[5].part).toEqual({ id: "t1", name: "lookup", input: { q: "test" } });
    specimen.expect(drained[6].event).toBe("/part/close");
    specimen.expect(drained[7]).toEqual({ event: "/turn/close", turn: { meta: { state: "tools" } } });

    const original = {
      role: "user",
      parts: [
        { type: "text", text: "what is casa" },
        { type: "image", data: "base64abc", media: "image/png" },
      ],
      meta: { provider: { custom: "value" } },
    };
    let reconstructed = null;
    for (const packet of soma.drain(original)) {
      reconstructed = soma.pour(reconstructed, packet);
    }
    specimen.expect(reconstructed.role).toBe("user");
    specimen.expect(reconstructed.parts).toHaveLength(2);
    specimen.expect(reconstructed.parts[0].text).toBe("what is casa");
    specimen.expect(reconstructed.parts[1].data).toBe("base64abc");
    specimen.expect(reconstructed.parts[1].media).toBe("image/png");
    specimen.expect(reconstructed.meta.provider.custom).toBe("value");

    const hylomorphic = {
      role: "assistant",
      parts: [
        { type: "text", text: "hello world" },
        { type: "tool", name: "search", args: { q: "x" } },
      ],
      meta: { state: "complete" },
    };
    const rebuilt = [...soma.drain(hylomorphic)].reduce(soma.pour, null);
    specimen.expect(rebuilt).toEqual(hylomorphic);
  });

  specimen.it("transcript folds response records into the yield fixpoint", () => {
    const records = [
      { event: "/turn/open", turn: { role: "assistant" } },
      { event: "/part/open", index: 0, part: { type: "tool_use", id: "u1", name: "lookup", input: {} } },
      { event: "/part/close", index: 0 },
      { event: "/turn/close", turn: { meta: { state: "tools" } } },
      {
        event: "/turn/full",
        turn: {
          role: "user",
          parts: [
            { type: "tool_result", id: "u1", condition: "NOMINAL", product: { message: "house", buffer: [{ id: "b1" }] } },
          ],
        },
      },
      { event: "/turn/open", turn: { role: "assistant" } },
      { event: "/part/open", index: 0, part: { type: "text", text: "" } },
      { event: "/part/delta", index: 0, part: { text: "casa means house" } },
      { event: "/part/close", index: 0 },
      { event: "/turn/close", turn: { meta: { state: "complete" } } },
      { event: "/response/close", response: { meta: { state: "complete", rounds: 2 } } },
    ];
    for (const record of records) specimen.expect(record).matches(Packet.Response);
    const snapshot = JSON.stringify(records);
    const folded = records.reduce(soma.transcript, null);

    specimen.expect(JSON.stringify(records)).toBe(snapshot);
    specimen.expect(folded.condition).toBe("NOMINAL");
    specimen.expect(folded.meta.state).toBe("complete");
    specimen.expect(folded.meta.rounds).toBe(2);
    specimen.expect(folded.turns).toHaveLength(3);
    specimen.expect(folded.product.message).toBe("casa means house");
    specimen.expect(folded.product.buffer).toHaveLength(1);
  });

  specimen.it("transcript merges a round's tool entity keys and keeps the last object", () => {
    const answered = {
      role: "user",
      parts: [
        { type: "tool_result", id: "u1", product: { buffer: [{ id: "b1" }], object: { first: true } } },
        { type: "tool_result", id: "u2", product: { buffer: [{ id: "b2" }], memory: [{ id: "m1" }], object: { second: true } } },
      ],
    };
    const folded = [{ event: "/turn/full", turn: answered }].reduce(soma.transcript, null);
    specimen.expect(folded.turns).toEqual([answered]);
    specimen.expect(folded.product.buffer.map((buffer) => buffer.id)).toEqual(["b1", "b2"]);
    specimen.expect(folded.product.memory).toHaveLength(1);
    specimen.expect(folded.product.object).toEqual({ second: true });
  });

  specimen.it("a tap attends the stream without touching it", async () => {
    let sealed = null;
    const source = asStream(packets("assistant", [{ type: "text", text: "tap me" }]));
    const tapped = soma.attend(source, (turn) => { sealed = turn; });
    const collected = [];
    for await (const packet of tapped) collected.push(packet);
    specimen.expect(collected[0].event).toBe("/turn/open");
    specimen.expect(collected.at(-1).event).toBe("/turn/close");
    specimen.expect(sealed).toBeDefined();
    specimen.expect(sealed.parts[0].text).toBe("tap me");

    const original = packets("assistant", [{ type: "text", text: "abc" }]);
    const passthrough = soma.attend(asStream(original), () => {});
    const passed = [];
    for await (const packet of passthrough) passed.push(packet);
    specimen.expect(passed).toHaveLength(original.length);
    for (let index = 0; index < original.length; index++) {
      specimen.expect(passed[index].event).toBe(original[index].event);
    }
  });

  specimen.it("a bridge drinks the stream down to a sealed turn", async () => {
    const single = await soma.bridge(asStream(packets("assistant", [
      { type: "text", text: "bridge me" },
    ], { state: "complete", usage: { input: 3, output: 9 } })));
    specimen.expect(single.role).toBe("assistant");
    specimen.expect(single.parts[0].text).toBe("bridge me");
    specimen.expect(single.meta.state).toBe("complete");
    specimen.expect(single.meta.usage.input).toBe(3);

    const layered = await soma.bridge(asStream(packets("assistant", [
      { type: "text", text: "first" },
      { type: "audio", data: "YXVkaW8=", media: "audio/mp3" },
    ])));
    specimen.expect(layered.parts).toHaveLength(2);
    specimen.expect(layered.parts[0].text).toBe("first");
    specimen.expect(layered.parts[1].type).toBe("audio");
    specimen.expect(layered.parts[1].data).toBe("YXVkaW8=");
  });
});
