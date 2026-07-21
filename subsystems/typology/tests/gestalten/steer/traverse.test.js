import { specimen, Signal, fromm, steer, Vector } from "@vivalence/typology";

specimen.describe("traverse", () => {
  specimen.it("a signal traverses to its effect or comes back empty", () => {
    const parameterized = new Vector();
    const identify = () => "test";
    parameterized.open("/users/:id", identify);
    const [identityEffect, , identitySteps] = steer.dispatch.traverse(parameterized, new Signal("/users/123"));
    specimen.expect(identityEffect).toBe(identify);
    specimen.expect(identitySteps.length).toBe(2);

    const nested = new Vector();
    const profile = () => "profile";
    nested.branch("/api").branch("/users").open("/:id/profile", profile);
    const [profileEffect, , profileSteps] = steer.dispatch.traverse(nested, new Signal("/api/users/123/profile"));
    specimen.expect(profileEffect).toBe(profile);
    specimen.expect(profileSteps.length).toBe(4);

    const [missingEffect, , missingSteps] = steer.dispatch.traverse(new Vector(), new Signal("/nope"));
    specimen.expect(missingEffect).toBe(null);
    specimen.expect(missingSteps).toEqual([]);

    const branchOnly = new Vector();
    branchOnly.branch("api");
    const [branchEffect] = steer.dispatch.traverse(branchOnly, new Signal("api"));
    specimen.expect(branchEffect).toBe(null);
  });

  specimen.it("a carry accumulates middleware down the path", async () => {
    const trace = [];
    const vector = new Vector();
    vector
      .use(async (ctx, next) => { trace.push("root"); await next(); trace.push("root'"); })
      .branch("/api")
      .use(async (ctx, next) => { trace.push("branch"); await next(); trace.push("branch'"); })
      .open("/test", () => "result");

    const [effect, carry] = steer.dispatch.traverse(vector, new Signal("/api/test"));
    await carry({}, async () => trace.push("terminal"));
    specimen.expect(trace).toEqual(["root", "branch", "terminal", "branch'", "root'"]);
  });

  specimen.it("a remainder swallows the tail and keeps its params", () => {
    const catchAll = new Vector();
    const caught = () => "caught";
    catchAll.open("(.*)", caught);
    const [allEffect, , allSteps] = steer.dispatch.traverse(catchAll, new Signal("/any/deep/path"));
    specimen.expect(allEffect).toBe(caught);
    specimen.expect(allSteps.length).toBe(3);
    const allParams = fromm.match(allSteps).parameters;
    specimen.expect(allParams[0]).toBe("any");
    specimen.expect(allParams[1]).toBe("deep");
    specimen.expect(allParams[2]).toBe("path");

    const branched = new Vector();
    const trailing = () => "caught";
    branched.branch("api").open("(.*)", trailing);
    const [trailingEffect, , trailingSteps] = steer.dispatch.traverse(branched, new Signal("/api/anything/here"));
    specimen.expect(trailingEffect).toBe(trailing);
    const trailingParams = fromm.match(trailingSteps).parameters;
    specimen.expect(trailingParams[0]).toBe("anything");
    specimen.expect(trailingParams[1]).toBe("here");

    const tenanted = new Vector();
    const scoped = () => "caught";
    tenanted.branch(":tenant").open("(.*)", scoped);
    const [scopedEffect, , scopedSteps] = steer.dispatch.traverse(tenanted, new Signal("/acme/any/path"));
    specimen.expect(scopedEffect).toBe(scoped);
    const scopedParams = fromm.match(scopedSteps).parameters;
    specimen.expect(scopedParams.tenant).toBe("acme");
    specimen.expect(scopedParams[0]).toBe("any");
    specimen.expect(scopedParams[1]).toBe("path");
  });
});
