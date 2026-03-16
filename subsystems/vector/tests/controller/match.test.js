import { specimen } from "@vivalence/typology";
import { Signal } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { scope, greedy, resolve } from "@vivalence/vector/controller";

specimen.describe("match", () => {
  specimen.describe("scope", () => {
    specimen.it("finds trajectory matches", () => {
      const vector = new Vector();
      vector.branch("users");
      const signal = new Signal("users");
      const matches = scope(vector, signal);
      specimen.expect(matches.length).toBe(1);
      specimen.expect(matches[0][1]).toBeTruthy();
      specimen.expect(matches[0][2]).toBe(null);
    });

    specimen.it("finds effect matches", () => {
      const vector = new Vector();
      vector.open("greet", () => "hi");
      const signal = new Signal("greet");
      const matches = scope(vector, signal);
      specimen.expect(matches.length).toBe(1);
      specimen.expect(matches[0][1]).toBe(null);
      specimen.expect(matches[0][2]).toBeTruthy();
    });

    specimen.it("returns both when pattern appears in effects and trajectories", () => {
      const vector = new Vector();
      vector.branch("api");
      vector.open("api", () => "direct");
      const signal = new Signal("api");
      const matches = scope(vector, signal);
      specimen.expect(matches.length).toBe(2);
    });

    specimen.it("returns empty on no match", () => {
      const vector = new Vector();
      vector.open("greet", () => "hi");
      const matches = scope(vector, new Signal("nope"));
      specimen.expect(matches.length).toBe(0);
    });
  });

  specimen.describe("greedy", () => {
    specimen.it("returns first effect match", () => {
      const vector = new Vector();
      vector.open("a", () => "first");
      vector.open("a", () => "second");
      const matches = greedy(vector, new Signal("a"));
      specimen.expect(matches.length).toBe(1);
    });

    specimen.it("prefers effects over trajectories", () => {
      const vector = new Vector();
      vector.open("x", () => "effect");
      vector.branch("x");
      const [[, trajectory, effect]] = greedy(vector, new Signal("x"));
      specimen.expect(effect).toBeTruthy();
      specimen.expect(trajectory).toBe(null);
    });

    specimen.it("returns empty on no match", () => {
      const matches = greedy(new Vector(), new Signal("nope"));
      specimen.expect(matches.length).toBe(0);
    });
  });

  specimen.describe("resolve", () => {
    specimen.it("returns single match", () => {
      const triple = [{ nature: "x" }, null, () => {}];
      const [match] = resolve([triple], new Signal("x"));
      specimen.expect(match.nature).toBe("x");
    });

    specimen.it("throws on empty matches", () => {
      specimen.expect(() => resolve([], new Signal("x"))).toThrow();
    });

    specimen.it("prefers trajectory when signal has heir", () => {
      const signal = new Signal("users/123");
      const traj = [signal, { trajectoryMarker: true }, null];
      const eff = [signal, null, () => {}];
      const [, trajectory] = resolve([traj, eff], signal);
      specimen.expect(trajectory).toBeTruthy();
      specimen.expect(trajectory.trajectoryMarker).toBe(true);
    });

    specimen.it("prefers effect when signal exhausted", () => {
      const signal = new Signal("users");
      const traj = [signal, { trajectoryMarker: true }, null];
      const eff = [signal, null, () => "result"];
      const [, , effect] = resolve([traj, eff], signal);
      specimen.expect(effect).toBeTruthy();
    });
  });
});
