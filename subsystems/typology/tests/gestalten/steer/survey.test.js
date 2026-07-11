import { specimen, steer, is } from "@vivalence/typology";
import { house } from "../../scenarios/cats/index.js";

const { survey } = steer.trie;

specimen.describe("survey", () => {
  specimen.describe("default identity visitor", () => {
    specimen.it("returns the root node with its effect and trajectories", () => {
      const { vector } = house();
      const result = survey(vector);
      specimen.expect(result.effect).toBe(undefined);
      specimen.expect(result.trajectories.length).toBe(3);
    });

    specimen.it("leaves carry their effect and no trajectories", () => {
      const { vector } = house();
      const purr = survey(vector).trajectories.find((n) => n.signature.nature === "purr");
      specimen.expect(is.fn(purr.effect)).toBeTruthy();
      specimen.expect(purr.trajectories.length).toBe(0);
    });

    specimen.it("branches carry trajectories and no effect", () => {
      const { vector } = house();
      const hunt = survey(vector).trajectories.find((n) => n.signature.nature === "hunt");
      specimen.expect(hunt.effect).toBe(undefined);
      specimen.expect(hunt.trajectories.length).toBe(3);
    });

    specimen.it("preserves signatures on patterns", () => {
      const { vector } = house();
      const result = survey(vector);
      const purr = result.trajectories.find((n) => n.signature.nature === "purr");
      const hunt = result.trajectories.find((n) => n.signature.nature === "hunt");
      specimen.expect(purr.signature.keyed.command).toBe("p");
      specimen.expect(hunt.signature.directed.collapsed).toBe(true);
    });
  });

  specimen.describe("custom visitor", () => {
    specimen.it("transforms each node with already-folded children", () => {
      const { vector } = house();
      const result = survey(vector, (node) => ({
        name: node.signature ? node.signature.nature : "root",
        kids: node.trajectories,
      }));
      specimen.expect(result.name).toBe("root");
      const hunt = result.kids.find((k) => k.name === "hunt");
      specimen.expect(hunt.kids.length).toBe(3);
      specimen.expect(hunt.kids[0].name).toBe("stalk");
    });

    specimen.it("visits leaves with an effect, branches without", () => {
      const { vector } = house();
      const leaves = [];
      const branches = [];
      survey(vector, (node) => {
        if (!node.signature) return node;
        if (node.effect !== undefined) leaves.push(node.signature.nature);
        else branches.push(node.signature.nature);
        return node;
      });
      specimen.expect(leaves.sort()).toEqual(["nap", "pounce", "purr", "retreat", "stalk"]);
      specimen.expect(branches).toEqual(["hunt"]);
    });
  });
});
