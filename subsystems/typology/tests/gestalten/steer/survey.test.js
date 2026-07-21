import { specimen, steer, is } from "@vivalence/typology";
import { house } from "../../scenarios/cats/index.js";

specimen.describe("survey", () => {
  specimen.it("an identity visitor mirrors the trie", () => {
    const { vector } = house();
    const result = steer.trie.survey(vector);
    specimen.expect(result.effect).toBe(undefined);
    specimen.expect(result.trajectories.length).toBe(3);

    const purr = result.trajectories.find((node) => node.signature.nature === "purr");
    specimen.expect(is.fn(purr.effect)).toBeTruthy();
    specimen.expect(purr.trajectories.length).toBe(0);
    specimen.expect(purr.signature.keyed.command).toBe("p");

    const hunt = result.trajectories.find((node) => node.signature.nature === "hunt");
    specimen.expect(hunt.effect).toBe(undefined);
    specimen.expect(hunt.trajectories.length).toBe(3);
    specimen.expect(hunt.signature.directed.collapsed).toBe(true);
  });

  specimen.it("a custom visitor refolds every node", () => {
    const { vector } = house();
    const renamed = steer.trie.survey(vector, (node) => ({
      name: node.signature ? node.signature.nature : "root",
      kids: node.trajectories,
    }));
    specimen.expect(renamed.name).toBe("root");
    const hunt = renamed.kids.find((kid) => kid.name === "hunt");
    specimen.expect(hunt.kids.length).toBe(3);
    specimen.expect(hunt.kids[0].name).toBe("stalk");

    const { vector: sorted } = house();
    const leaves = [];
    const branches = [];
    steer.trie.survey(sorted, (node) => {
      if (!node.signature) return node;
      if (node.effect !== undefined) leaves.push(node.signature.nature);
      else branches.push(node.signature.nature);
      return node;
    });
    specimen.expect(leaves.sort()).toEqual(["nap", "pounce", "purr", "retreat", "stalk"]);
    specimen.expect(branches).toEqual(["hunt"]);
  });
});
