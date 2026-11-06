import { Aperture, specimen, steer, Vector } from "@vivalence/typology";

const house = () =>
  new Vector()
    .open({ nature: "keep", valence: "kept" }, () => "k")
    .open({ nature: "drop", rank: "void" }, () => "d")
    .open("deep/keep", () => "dk")
    .open({ nature: "deep/drop", rank: "void" }, () => "dd");

specimen.describe("leaves", () => {
  specimen.it("lists every leaf with its pattern, steps and raw effect", () => {
    const effect = () => "k";
    const vector = new Vector().open("a", effect).open("b/c", () => "c");
    const leaves = steer.trie.leaves(vector);
    specimen.expect(leaves.map((leaf) => leaf.steps.map((step) => step.nature).join("/")))
      .toEqual(["a", "b/c"]);
    specimen.expect(leaves[0].effect).toBe(effect);
    specimen.expect(leaves[0].pattern.nature).toBe("a");
  });

  specimen.it("an empty vector has no leaves", () => {
    specimen.expect(steer.trie.leaves(new Vector())).toEqual([]);
  });
});

specimen.describe("sieve", () => {
  specimen.it("keeps the edges the predicate keeps, at every depth", () => {
    const sieved = steer.trie.sieve(house(), (pattern) => pattern.rank !== "void");
    specimen.expect(steer.trie.leaves(sieved).map((leaf) => leaf.steps.map((step) => step.nature).join("/")))
      .toEqual(["keep", "deep/keep"]);
  });

  specimen.it("a kept leaf still dispatches", async () => {
    const sieved = steer.trie.sieve(house(), (pattern) => pattern.rank !== "void");
    const [keep] = steer.trie.rollup(sieved);
    specimen.expect(await keep.fn()).toBe("k");
  });

  specimen.it("the predicate reads the path", () => {
    const sieved = steer.trie.sieve(house(), (pattern, path) => path.length > 1 || pattern.nature === "deep");
    specimen.expect(steer.trie.leaves(sieved).map((leaf) => leaf.steps.map((step) => step.nature).join("/")))
      .toEqual(["deep/keep", "deep/drop"]);
  });

  specimen.it("carries the root's middleware and keeps the class", async () => {
    const aperture = new Aperture().use(async (ctx, next) => {
      ctx.tapped = true;
      await next();
    });
    aperture.open("a", (ctx) => ctx.tapped);
    const sieved = steer.trie.sieve(aperture, () => true);
    specimen.expect(sieved instanceof Aperture).toBe(true);
    const [a] = steer.trie.rollup(sieved);
    specimen.expect(await a.fn()).toBe(true);
  });

  specimen.it("source is not mutated", () => {
    const source = house();
    steer.trie.sieve(source, (pattern) => pattern.rank !== "void");
    specimen.expect(steer.trie.leaves(source).length).toBe(4);
  });
});
