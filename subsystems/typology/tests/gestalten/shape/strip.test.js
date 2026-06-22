import { specimen, Vector, shape } from "@vivalence/typology";

// shape.strip = the contract serializer: a Vector trie → {leaves, branches} JSON.
// Load-bearing — feeds /metadata aperture+emitter endpoints, the conversation
// handshake, and shape.connection.wire. This pins the EXACT effect contract so a
// fold-based rewrite is proven identical (effect over model).
specimen.describe("shape.strip — the {leaves, branches} contract", () => {
  specimen.it("serializes effects (with input/output) + nested branches", () => {
    const vector = new Vector()
      .open({ nature: "ask", input: "IN" }, () => {})
      .open({ nature: "tell", output: "OUT" }, () => {})
      .open("/sub/leaf", () => {});
    specimen.expect(shape.strip(vector)).toEqual({
      leaves: [
        { nature: "ask", input: "IN" },
        { nature: "tell", output: "OUT" },
      ],
      branches: {
        sub: { leaves: [{ nature: "leaf" }], branches: {} },
      },
    });
  });

  specimen.it("empty vector → empty contract", () => {
    specimen.expect(shape.strip(new Vector())).toEqual({ leaves: [], branches: {} });
  });

  specimen.it("deep nesting recurses", () => {
    const vector = new Vector().open("/a/b/c", () => {});
    specimen.expect(shape.strip(vector)).toEqual({
      leaves: [],
      branches: { a: { leaves: [], branches: { b: { leaves: [{ nature: "c" }], branches: {} } } } },
    });
  });
});

specimen.describe("shape.strip — defaulted input", () => {
  specimen.it("no argument → empty contract (total on undefined)", () => {
    specimen.expect(shape.strip()).toEqual({ leaves: [], branches: {} });
  });
});

specimen.describe("shape.strip — custom pluck (the second optional input)", () => {
  specimen.it("a custom leaf-builder reshapes the leaf contract", () => {
    const vector = new Vector().open({ nature: "x", input: "IN" }, () => {});
    const tagged = shape.strip(vector, (pattern) => ({ n: pattern.nature, hasInput: pattern.input !== undefined }));
    specimen.expect(tagged).toEqual({ leaves: [{ n: "x", hasInput: true }], branches: {} });
  });
});
