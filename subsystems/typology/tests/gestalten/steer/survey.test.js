import { specimen, steer, is } from "@vivalence/typology";
import { house } from "../../scenarios/cats/index.js";

const { survey } = steer;

specimen.describe("survey", () => {
  specimen.describe("default identity visitor", () => {
    specimen.it("returns effects and trajectories at root", () => {
      const { vector } = house();
      const result = survey(vector);
      specimen.expect(result.effects.length).toBe(2);
      specimen.expect(result.trajectories.length).toBe(1);
    });

    specimen.it("effects are { signature, effect } pairs", () => {
      const { vector } = house();
      const purr = survey(vector).effects[0];
      specimen.expect(purr.signature.nature).toBe("purr");
      specimen.expect(is.fn(purr.effect)).toBeTruthy();
    });

    specimen.it("trajectories carry { signature, effects, trajectories }", () => {
      const { vector } = house();
      const hunt = survey(vector).trajectories[0];
      specimen.expect(hunt.signature.nature).toBe("hunt");
      specimen.expect(hunt.effects.length).toBe(3);
      specimen.expect(hunt.trajectories.length).toBe(0);
    });

    specimen.it("preserves signatures on patterns", () => {
      const { vector } = house();
      const result = survey(vector);
      specimen.expect(result.effects[0].signature.keyed.command).toBe("p");
      specimen.expect(result.trajectories[0].signature.directed.collapsed).toBe(true);
    });
  });

  specimen.describe("custom visitor", () => {
    specimen.it("transforms leaves", () => {
      const { vector } = house();
      const result = survey(vector, ({ signature }) => signature.nature);
      specimen.expect(result.effects[0]).toBe("purr");
      specimen.expect(result.effects[1]).toBe("nap");
    });

    specimen.it("transforms branches with already-folded children", () => {
      const { vector } = house();
      const result = survey(vector, ({ signature, effect, effects, trajectories }) => ({
        name: signature.nature,
        ...(effects ? { effects, trajectories } : {}),
      }));
      const hunt = result.trajectories[0];
      specimen.expect(hunt.name).toBe("hunt");
      specimen.expect(hunt.effects[0].name).toBe("stalk");
    });

    specimen.it("leaves receive effect, branches do not", () => {
      const { vector } = house();
      const leaves = [];
      const branches = [];
      survey(vector, (node) => {
        if (node.effect) leaves.push(node.signature.nature);
        if (node.effects) branches.push(node.signature.nature);
        return node;
      });
      specimen.expect(leaves).toEqual(["purr", "nap", "stalk", "pounce", "retreat"]);
      specimen.expect(branches).toEqual(["hunt"]);
    });
  });
});
