import { specimen, Vector, shape } from "@vivalence/typology";

// shape.strip = the contract serializer: a Vector trie → {effect?, branches} JSON,
// the faithful cata of the Vector's own {effect, trajectories}. Load-bearing —
// feeds /metadata aperture+emitter endpoints, the conversation handshake, and
// shape.connection.wire. Each node carries its OWN effect (metadata); a leaf is a
// branch whose node has an effect and no sub-branches.
specimen.describe("shape.strip — the {effect, branches} contract", () => {
  specimen.it("serializes each node's effect (with input/output) + nested branches", () => {
    const vector = new Vector()
      .open({ nature: "ask", input: "IN" }, () => {})
      .open({ nature: "tell", output: "OUT" }, () => {})
      .open("/sub/leaf", () => {});
    specimen.expect(shape.strip(vector)).toEqual({
      branches: {
        ask: { effect: { input: "IN" }, branches: {} },
        tell: { effect: { output: "OUT" }, branches: {} },
        sub: { branches: { leaf: { effect: {}, branches: {} } } },
      },
    });
  });

  specimen.it("root affect() rides the top node's effect", () => {
    const vector = new Vector().affect(() => {}).open("/child", () => {});
    specimen.expect(shape.strip(vector)).toEqual({
      effect: {},
      branches: { child: { effect: {}, branches: {} } },
    });
  });

  specimen.it("empty vector → empty contract", () => {
    specimen.expect(shape.strip(new Vector())).toEqual({ branches: {} });
  });

  specimen.it("deep nesting recurses", () => {
    const vector = new Vector().open("/a/b/c", () => {});
    specimen.expect(shape.strip(vector)).toEqual({
      branches: { a: { branches: { b: { branches: { c: { effect: {}, branches: {} } } } } } },
    });
  });
});

specimen.describe("shape.strip — defaulted input", () => {
  specimen.it("no argument → empty contract (total on undefined)", () => {
    specimen.expect(shape.strip()).toEqual({ branches: {} });
  });
});

specimen.describe("shape.strip — custom pluck (the second optional input)", () => {
  specimen.it("a custom effect-builder reshapes the node's effect metadata", () => {
    const vector = new Vector().open({ nature: "x", input: "IN" }, () => {});
    const tagged = shape.strip(vector, (pattern) => ({ hasInput: pattern?.input !== undefined }));
    specimen.expect(tagged).toEqual({ branches: { x: { effect: { hasInput: true }, branches: {} } } });
  });
});
