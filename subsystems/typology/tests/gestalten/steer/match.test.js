import { specimen, steer } from "@vivalence/typology";
import { Signal } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";

const { scope, greedy, feed } = steer.match;

specimen.describe("match", () => {
  specimen.describe("scope", () => {
    specimen.it("finds a branch match with no effect", () => {
      const vector = new Vector();
      vector.branch("users");
      const matches = scope(vector, new Signal("users"));
      specimen.expect(matches.length).toBe(1);
      specimen.expect(matches[0][1]).toBeTruthy();
      specimen.expect(matches[0][2]).toBe(null);
    });

    specimen.it("finds a leaf match carrying its effect", () => {
      const vector = new Vector();
      vector.open("greet", () => "hi");
      const matches = scope(vector, new Signal("greet"));
      specimen.expect(matches.length).toBe(1);
      specimen.expect(matches[0][1]).toBeTruthy();
      specimen.expect(matches[0][2]).toBeTruthy();
    });

    specimen.it("a both-node yields one match with node and effect", () => {
      const vector = new Vector();
      vector.branch("api");
      vector.open("api", () => "direct");
      const matches = scope(vector, new Signal("api"));
      specimen.expect(matches.length).toBe(1);
      specimen.expect(matches[0][1]).toBeTruthy();
      specimen.expect(matches[0][2]).toBeTruthy();
    });

    specimen.it("returns empty on no match", () => {
      const vector = new Vector();
      vector.open("greet", () => "hi");
      specimen.expect(scope(vector, new Signal("nope")).length).toBe(0);
    });
  });

  specimen.describe("greedy", () => {
    specimen.it("returns the first match", () => {
      const vector = new Vector();
      vector.open("a", () => "first");
      specimen.expect(greedy(vector, new Signal("a")).length).toBe(1);
    });

    specimen.it("carries the node and its effect", () => {
      const vector = new Vector();
      vector.open("x", () => "effect");
      const [[, trajectory, effect]] = greedy(vector, new Signal("x"));
      specimen.expect(trajectory).toBeTruthy();
      specimen.expect(effect).toBeTruthy();
    });

    specimen.it("returns empty on no match", () => {
      specimen.expect(greedy(new Vector(), new Signal("nope")).length).toBe(0);
    });
  });

  specimen.describe("feed", () => {
    specimen.it("returns single match", () => {
      const triple = [{ nature: "x" }, null, () => {}];
      const [match] = feed([triple], new Signal("x"));
      specimen.expect(match.nature).toBe("x");
    });

    specimen.it("throws on empty matches", () => {
      specimen.expect(() => feed([], new Signal("x"))).toThrow();
    });

    specimen.it("prefers the first match when signal has heir", () => {
      const signal = new Signal("users/123");
      const traj = [signal, { trajectoryMarker: true }, null];
      const eff = [signal, null, () => {}];
      const [, trajectory] = feed([traj, eff], signal);
      specimen.expect(trajectory.trajectoryMarker).toBe(true);
    });

    specimen.it("prefers a match with an effect when signal exhausted", () => {
      const signal = new Signal("users");
      const traj = [signal, { trajectoryMarker: true }, null];
      const eff = [signal, null, () => "result"];
      const [, , effect] = feed([traj, eff], signal);
      specimen.expect(effect).toBeTruthy();
    });
  });
});
