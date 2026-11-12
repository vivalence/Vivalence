import { specimen, fromm, is, Yield } from "@vivalence/typology";

specimen.describe("fromm.params", () => {
  specimen.it("a remainder reassembles into the whole tail", () => {
    specimen.expect(fromm.params({ 0: "words", 1: "a.adposition.mp3" }).path.absolute) //
      .toBe("/words/a.adposition.mp3");
    specimen.expect(fromm.params({ 0: "index.js" }).path.absolute).toBe("/index.js");
    specimen.expect(fromm.params({ 0: "a", 1: "b", 2: "c", 3: "d.txt" }).path.absolute) //
      .toBe("/a/b/c/d.txt");
    specimen.expect(fromm.params({}).path.absolute).toBe("/");
  });

  specimen.it("named captures ride alongside without joining the tail", () => {
    specimen.expect(fromm.params({ type: "game", 0: "words", 1: "e.mp3" }).path.absolute) //
      .toBe("/words/e.mp3");
  });

  specimen.it("the tail is a Path, traced to its root", () => {
    const path = fromm.params({ 0: "words", 1: "e.mp3" }).path;
    specimen.expect(is.path(path)).toBeTruthy();
    specimen.expect(path.nature).toBe("/e.mp3");
    specimen.expect(path.root.absolute).toBe("/words");
  });

  specimen.it("reading never mutates the source", () => {
    const params = { 0: "words", 1: "a.adposition.mp3" };
    const snapshot = JSON.stringify(params);
    const read = fromm.params(params);
    specimen.expect(read.path.absolute).toBe(read.path.absolute);
    specimen.expect(JSON.stringify(params)).toBe(snapshot);
  });
});

Deno.test("fromm.yield", async (t) => {
  await t.step("emission — sniffed from condition + product", () => {
    const buffers = [{ id: "b1" }, { id: "b2" }];
    const emission = Yield.NOMINAL(buffers);
    const read = fromm.yield(emission);
    specimen.expect(read.kind).toBe("emission");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.product.buffer).toHaveLength(2);
    specimen.expect(read.product.message).toBe(undefined);
    specimen.expect(read.product.object).toBe(undefined);
  });

  await t.step("emission — exhausted", () => {
    const read = fromm.yield(Yield.EXHAUSTED());
    specimen.expect(read.kind).toBe("emission");
    specimen.expect(read.condition).toBe("EXHAUSTED");
    specimen.expect(read.product.buffer).toHaveLength(0);
  });

  await t.step("turn — message joins text parts, the object part is the object's one home", () => {
    const turn = {
      role: "assistant",
      parts: [
        { type: "text", text: "two words." },
        { type: "tool_use", id: "t1", name: "lookup", input: {} },
        { type: "text", text: "then more." },
        { type: "object", data: { answer: 42 } },
      ],
      meta: { state: "complete" },
    };
    const read = fromm.yield(turn);
    specimen.expect(read.kind).toBe("turn");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.product.message).toBe("two words. then more.");
    specimen.expect(read.product.object.answer).toBe(42);
  });

  await t.step("turn — an object part alone, abort is ERROR", () => {
    const turn = {
      role: "assistant",
      parts: [{ type: "object", data: { answer: 7 } }],
      meta: { state: "abort" },
    };
    const read = fromm.yield(turn);
    specimen.expect(read.condition).toBe("ERROR");
    specimen.expect(read.product.object.answer).toBe(7);
    specimen.expect(read.product.message).toBe(undefined);
  });

  await t.step("result — the part carries the whole bag", () => {
    const result = {
      type: "tool_result",
      id: "t1",
      product: { message: "Drill started: 3 exercises.", buffer: [{ id: "b1" }] },
    };
    const read = fromm.yield(result);
    specimen.expect(read.kind).toBe("result");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.product.message).toBe("Drill started: 3 exercises.");
    specimen.expect(read.product.buffer).toHaveLength(1);
  });

  await t.step("result — an error message is ERROR", () => {
    const read = fromm.yield({
      type: "tool_result",
      id: "t2",
      condition: "ERROR",
      product: { message: "unknown tool: x" },
    });
    specimen.expect(read.condition).toBe("ERROR");
  });

  await t.step("utterance — a bare string rides product.message, model-visible", () => {
    const read = fromm.yield("casa means house");
    specimen.expect(read.kind).toBe("utterance");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.product.message).toBe("casa means house");
    specimen.expect(read.product.object).toBe(undefined);
  });

  await t.step("spoken — a flat payload folds message and entity keys into the bag", () => {
    const read = fromm.yield({ message: "12 on screen.", buffer: [{ id: "b1" }] });
    specimen.expect(read.kind).toBe("spoken");
    specimen.expect(read.condition).toBe("NOMINAL");
    specimen.expect(read.product.message).toBe("12 on screen.");
    specimen.expect(read.product.buffer).toHaveLength(1);
  });

  await t.step("spoken — an explicit product passes through whole", () => {
    const read = fromm.yield({ product: { buffer: [{ id: "b1" }] } });
    specimen.expect(read.kind).toBe("spoken");
    specimen.expect(read.product.buffer).toHaveLength(1);
    specimen.expect(read.product.message).toBe(undefined);
  });

  await t.step("opaque — anything else lands in product.object", () => {
    const read = fromm.yield({ slug: "casa", known: "house" });
    specimen.expect(read.kind).toBe("opaque");
    specimen.expect(read.product.object.slug).toBe("casa");
    specimen.expect(read.product.message).toBe(undefined);
    specimen.expect(fromm.yield(null).product).toEqual({});
  });

  await t.step("reading never mutates the source", () => {
    const emission = Yield.NOMINAL([{ id: "b1" }]);
    const snapshot = JSON.stringify(emission);
    const read = fromm.yield(emission);
    read.kind, read.condition, read.product;
    specimen.expect(JSON.stringify(emission)).toBe(snapshot);
  });
});
