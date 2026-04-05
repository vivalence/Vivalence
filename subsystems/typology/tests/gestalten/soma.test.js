import { specimen, soma } from "@vivalence/typology";

function packets(role, parts, meta = { stop: "end_turn" }) {
  const out = [{ event: "turn.open", turn: { role } }];
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const shell = { ...part };
    if (part.type === "text" || part.type === "thinking") shell.text = "";
    if (part.type === "tool_use") shell.input = "";
    if (part.type === "audio") shell.data = "";
    out.push({ event: "part.open", index, part: shell });
    if (part.type === "text" || part.type === "thinking") {
      for (const character of part.text) {
        out.push({ event: "part.delta", index, delta: { text: character } });
      }
    } else if (part.type === "tool_use") {
      out.push({ event: "part.delta", index, delta: { input: part.input } });
    } else if (part.type === "audio") {
      out.push({ event: "part.delta", index, delta: { data: part.data } });
    }
    out.push({ event: "part.close", index });
  }
  out.push({ event: "turn.close", meta });
  return out;
}

async function* asStream(packetArray) {
  for (const packet of packetArray) yield packet;
}

specimen.describe("soma", () => {

  specimen.describe("pour", () => {

    specimen.it("text stream accumulates by character concatenation", () => {
      const source = packets("assistant", [
        { type: "text", text: "hello world" },
      ], { stop: "end_turn", usage: { input: 5, output: 11 } });

      let turn = null;
      for (const packet of source) turn = soma.pour(turn, packet);

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts).toHaveLength(1);
      specimen.expect(turn.parts[0].type).toBe("text");
      specimen.expect(turn.parts[0].text).toBe("hello world");
      specimen.expect(turn.meta.stop).toBe("end_turn");
      specimen.expect(turn.meta.usage.input).toBe(5);
    });

    specimen.it("multi-part multi-channel: text + tool_use + thinking", () => {
      const source = packets("assistant", [
        { type: "text", text: "analyzing..." },
        { type: "tool_use", id: "t1", name: "lookup", input: '{"q":"casa"}' },
        { type: "thinking", text: "the user asked about casa" },
      ], { stop: "tool_use" });

      let turn = null;
      for (const packet of source) turn = soma.pour(turn, packet);

      specimen.expect(turn.parts).toHaveLength(3);
      specimen.expect(turn.parts[0].text).toBe("analyzing...");
      specimen.expect(turn.parts[1].type).toBe("tool_use");
      specimen.expect(turn.parts[1].input).toBe('{"q":"casa"}');
      specimen.expect(turn.parts[1].name).toBe("lookup");
      specimen.expect(turn.parts[2].type).toBe("thinking");
      specimen.expect(turn.parts[2].text).toBe("the user asked about casa");
      specimen.expect(turn.meta.stop).toBe("tool_use");
    });

    specimen.it("non-string delta replaces instead of concatenating", () => {
      const source = [
        { event: "turn.open", turn: { role: "assistant" } },
        { event: "part.open", index: 0, part: { type: "object", data: null } },
        { event: "part.delta", index: 0, delta: { data: { first: true } } },
        { event: "part.delta", index: 0, delta: { data: { second: true } } },
        { event: "part.close", index: 0 },
        { event: "turn.close", meta: {} },
      ];

      let turn = null;
      for (const packet of source) turn = soma.pour(turn, packet);

      specimen.expect(turn.parts[0].data).toEqual({ second: true });
    });
  });

  specimen.describe("drain", () => {

    specimen.it("decomposes turn into open → delta → close per part", () => {
      const turn = {
        role: "assistant",
        parts: [
          { type: "text", text: "hello" },
          { type: "tool_use", id: "t1", name: "lookup", input: '{"q":"test"}' },
        ],
        meta: { stop: "tool_use" },
      };

      const drained = [...soma.drain(turn)];

      specimen.expect(drained[0]).toEqual({ event: "turn.open", turn: { role: "assistant" } });

      specimen.expect(drained[1].event).toBe("part.open");
      specimen.expect(drained[1].part).toEqual({ type: "text", text: "" });
      specimen.expect(drained[2].event).toBe("part.delta");
      specimen.expect(drained[2].delta).toEqual({ text: "hello" });
      specimen.expect(drained[3].event).toBe("part.close");

      specimen.expect(drained[4].event).toBe("part.open");
      specimen.expect(drained[4].part).toEqual({ type: "tool_use", id: "", name: "", input: "" });
      specimen.expect(drained[5].event).toBe("part.delta");
      specimen.expect(drained[5].delta).toEqual({ id: "t1", name: "lookup", input: '{"q":"test"}' });
      specimen.expect(drained[6].event).toBe("part.close");

      specimen.expect(drained[7]).toEqual({ event: "turn.close", meta: { stop: "tool_use" } });
    });

    specimen.it("roundtrip: drain → pour reconstructs the turn", () => {
      const original = {
        role: "user",
        parts: [
          { type: "text", text: "what is casa" },
          { type: "image", data: "base64abc", media: "image/png" },
        ],
        meta: { custom: "value" },
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
      specimen.expect(reconstructed.meta.custom).toBe("value");
    });
  });

  specimen.describe("attend", () => {

    specimen.it("taps stream and fires callback with sealed turn on completion", async () => {
      let sealed = null;
      const source = asStream(packets("assistant", [{ type: "text", text: "tap me" }]));
      const tapped = soma.attend(source, (turn) => { sealed = turn; });

      const collected = [];
      for await (const packet of tapped) collected.push(packet);

      specimen.expect(collected[0].event).toBe("turn.open");
      specimen.expect(collected.at(-1).event).toBe("turn.close");
      specimen.expect(sealed).toBeDefined();
      specimen.expect(sealed.parts[0].text).toBe("tap me");
    });

    specimen.it("all packets pass through unmodified", async () => {
      const original = packets("assistant", [{ type: "text", text: "abc" }]);
      const tapped = soma.attend(asStream(original), () => {});

      const collected = [];
      for await (const packet of tapped) collected.push(packet);

      specimen.expect(collected).toHaveLength(original.length);
      for (let index = 0; index < original.length; index++) {
        specimen.expect(collected[index].event).toBe(original[index].event);
      }
    });
  });

  specimen.describe("bridge", () => {

    specimen.it("consumes stream fully, returns sealed turn", async () => {
      const source = asStream(packets("assistant", [
        { type: "text", text: "bridge me" },
      ], { stop: "end_turn", usage: { input: 3, output: 9 } }));

      const turn = await soma.bridge(source);

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toBe("bridge me");
      specimen.expect(turn.meta.stop).toBe("end_turn");
      specimen.expect(turn.meta.usage.input).toBe(3);
    });

    specimen.it("multi-part stream bridges correctly", async () => {
      const source = asStream(packets("assistant", [
        { type: "text", text: "first" },
        { type: "audio", data: "YXVkaW8=", media: "audio/mp3" },
      ]));

      const turn = await soma.bridge(source);

      specimen.expect(turn.parts).toHaveLength(2);
      specimen.expect(turn.parts[0].text).toBe("first");
      specimen.expect(turn.parts[1].type).toBe("audio");
      specimen.expect(turn.parts[1].data).toBe("YXVkaW8=");
    });
  });
});
