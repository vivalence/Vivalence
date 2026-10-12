import { specimen, steer, Vector } from "@vivalence/typology";
import { house } from "../../scenarios/cats/index.js";

specimen.describe("steer.trie.at", () => {
  specimen.it("walks literal segments to the node and answers its trajectory", () => {
    const { vector } = house();
    const stalk = steer.trie.at(vector, ["hunt", "stalk"]);
    specimen.expect(stalk).toBeInstanceOf(Vector);
    specimen.expect(typeof stalk.effect).toBe("function");
    specimen.expect(stalk.ancestor).toBe(steer.trie.at(vector, ["hunt"]));
  });

  specimen.it("an absent edge answers null, at any depth", () => {
    const { vector } = house();
    specimen.expect(steer.trie.at(vector, ["swim"])).toBe(null);
    specimen.expect(steer.trie.at(vector, ["hunt", "swim"])).toBe(null);
    specimen.expect(steer.trie.at(vector, ["hunt", "swim", "deeper"])).toBe(null);
  });

  specimen.it("an empty path is the vector itself", () => {
    const { vector } = house();
    specimen.expect(steer.trie.at(vector, [])).toBe(vector);
  });

  specimen.it("a node's children are what the leader lists", () => {
    const { vector } = house();
    const hunt = steer.trie.at(vector, ["hunt"]);
    specimen.expect(hunt.patterns.map((pattern) => pattern.nature)).toEqual(["stalk", "pounce", "retreat"]);
    specimen.expect(hunt.effect).toBe(null);
  });
});
