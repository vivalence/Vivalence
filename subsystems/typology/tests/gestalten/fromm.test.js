import { specimen, fromm, Yield } from "@vivalence/typology";

Deno.test("fromm.yield", async (t) => {
  await t.step("emission — sniffed from condition + buffers", () => {
    const buffers = [{ id: "b1" }, { id: "b2" }];
    const emission = Yield.NOMINAL(buffers);
    const read = fromm.yield(emission);
    specimen.expect(read.kind).toBe("emission");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.entities.buffer).toHaveLength(2);
    specimen.expect(read.message).toBe(null);
    specimen.expect(read.object).toBe(null);
  });

  await t.step("emission — exhausted", () => {
    const read = fromm.yield(Yield.EXHAUSTED());
    specimen.expect(read.kind).toBe("emission");
    specimen.expect(read.condition).toBe("EXHAUSTED");
    specimen.expect(read.entities.buffer).toHaveLength(0);
  });

  await t.step("turn — message joins text parts, object passes through", () => {
    const turn = {
      role: "assistant",
      parts: [
        { type: "text", text: "two words." },
        { type: "tool_use", id: "t1", name: "lookup", input: {} },
        { type: "text", text: "then more." },
      ],
      meta: { stop: "end_turn" },
      object: { answer: 42 },
    };
    const read = fromm.yield(turn);
    specimen.expect(read.kind).toBe("turn");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.message).toBe("two words. then more.");
    specimen.expect(read.object.answer).toBe(42);
    specimen.expect(read.entities).toEqual({});
  });

  await t.step("turn — object falls back to the object part, abort is ERROR", () => {
    const turn = {
      role: "assistant",
      parts: [{ type: "object", data: { answer: 7 } }],
      meta: { stop: "abort" },
    };
    const read = fromm.yield(turn);
    specimen.expect(read.condition).toBe("ERROR");
    specimen.expect(read.object.answer).toBe(7);
    specimen.expect(read.message).toBe(null);
  });

  await t.step("result — output is the message, entities keyed by name", () => {
    const result = {
      type: "tool_result",
      id: "t1",
      output: "Drill started: 3 exercises.",
      entities: { buffer: [{ id: "b1" }] },
    };
    const read = fromm.yield(result);
    specimen.expect(read.kind).toBe("result");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.message).toBe("Drill started: 3 exercises.");
    specimen.expect(read.entities.buffer).toHaveLength(1);
  });

  await t.step("result — error output is ERROR", () => {
    const read = fromm.yield({ type: "tool_result", id: "t2", output: { error: "unknown tool: x" } });
    specimen.expect(read.condition).toBe("ERROR");
  });

  await t.step("opaque — anything else lands in object", () => {
    const read = fromm.yield({ slug: "casa", known: "house" });
    specimen.expect(read.kind).toBe("opaque");
    specimen.expect(read.object.slug).toBe("casa");
    specimen.expect(read.message).toBe(null);
    specimen.expect(fromm.yield(null).object).toBe(null);
  });

  await t.step("declared kind forces perspective over the sniff", () => {
    const ambiguous = { kind: "opaque", condition: "NOMINAL", entities: { buffer: [{ id: "b1" }] } };
    const read = fromm.yield(ambiguous);
    specimen.expect(read.kind).toBe("opaque");
    specimen.expect(read.object.entities.buffer).toHaveLength(1);
    specimen.expect(read.entities).toEqual({});
  });

  await t.step("reading never mutates the source", () => {
    const emission = Yield.NOMINAL([{ id: "b1" }]);
    const snapshot = JSON.stringify(emission);
    const read = fromm.yield(emission);
    read.kind, read.condition, read.message, read.entities, read.object;
    specimen.expect(JSON.stringify(emission)).toBe(snapshot);
  });
});
