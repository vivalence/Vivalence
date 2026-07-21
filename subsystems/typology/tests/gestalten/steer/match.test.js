import { specimen, steer, Signal, Vector } from "@vivalence/typology";

specimen.describe("match", () => {
  specimen.it("a scope gathers branches, leaves and both-nodes", () => {
    const branched = new Vector();
    branched.branch("users");
    const branchMatches = steer.match.scope(branched, new Signal("users"));
    specimen.expect(branchMatches.length).toBe(1);
    specimen.expect(branchMatches[0][1]).toBeTruthy();
    specimen.expect(branchMatches[0][2]).toBe(null);

    const leafed = new Vector();
    leafed.open("greet", () => "hi");
    const leafMatches = steer.match.scope(leafed, new Signal("greet"));
    specimen.expect(leafMatches.length).toBe(1);
    specimen.expect(leafMatches[0][1]).toBeTruthy();
    specimen.expect(leafMatches[0][2]).toBeTruthy();

    const doubled = new Vector();
    doubled.branch("api");
    doubled.open("api", () => "direct");
    const bothMatches = steer.match.scope(doubled, new Signal("api"));
    specimen.expect(bothMatches.length).toBe(1);
    specimen.expect(bothMatches[0][1]).toBeTruthy();
    specimen.expect(bothMatches[0][2]).toBeTruthy();

    specimen.expect(steer.match.scope(leafed, new Signal("nope")).length).toBe(0);
  });

  specimen.it("a greedy match takes the first and carries the effect", () => {
    const single = new Vector();
    single.open("a", () => "first");
    specimen.expect(steer.match.greedy(single, new Signal("a")).length).toBe(1);

    const carrying = new Vector();
    carrying.open("x", () => "effect");
    const [[, trajectory, effect]] = steer.match.greedy(carrying, new Signal("x"));
    specimen.expect(trajectory).toBeTruthy();
    specimen.expect(effect).toBeTruthy();

    specimen.expect(steer.match.greedy(new Vector(), new Signal("nope")).length).toBe(0);
  });

  specimen.it("a feed settles competing matches", () => {
    const triple = [{ nature: "x" }, null, () => {}];
    const [single] = steer.match.feed([triple], new Signal("x"));
    specimen.expect(single.nature).toBe("x");

    specimen.expect(() => steer.match.feed([], new Signal("x"))).toThrow();

    const heired = new Signal("users/123");
    const trajectoryCandidate = [heired, { trajectoryMarker: true }, null];
    const effectCandidate = [heired, null, () => {}];
    const [, trajectory] = steer.match.feed([trajectoryCandidate, effectCandidate], heired);
    specimen.expect(trajectory.trajectoryMarker).toBe(true);

    const exhausted = new Signal("users");
    const exhaustedTrajectory = [exhausted, { trajectoryMarker: true }, null];
    const exhaustedEffect = [exhausted, null, () => "result"];
    const [, , effect] = steer.match.feed([exhaustedTrajectory, exhaustedEffect], exhausted);
    specimen.expect(effect).toBeTruthy();
  });
});
