import { specimen, steer, Signal, Vector } from "@vivalence/typology";

const signals = (...paths) => {
  let cursor = 0;
  return () => Promise.resolve(cursor < paths.length ? new Signal(paths[cursor++]) : []);
};

specimen.describe("walk", () => {
  specimen.it("a walk steps signal by signal to its effect", async () => {
    const parameterized = new Vector();
    const identify = () => "found";
    parameterized.open("/users/:id", identify);
    const [identityEffect, , identitySteps] = await steer.dispatch.walk(parameterized, signals("/users/123"));
    specimen.expect(identityEffect).toBe(identify);
    specimen.expect(identitySteps.length).toBe(2);

    const flat = new Vector();
    const grounded = () => "flat";
    flat.open("test", grounded);
    const [flatEffect] = await steer.dispatch.walk(flat, signals("test"));
    specimen.expect(flatEffect).toBe(grounded);
  });

  specimen.it("a carry rides along the walk", async () => {
    const trace = [];
    const vector = new Vector();
    vector
      .use(async (ctx, next) => { trace.push("mw"); await next(); })
      .branch("api")
      .open("test", () => "result");

    const [, carry] = await steer.dispatch.walk(vector, signals("/api/test"));
    await carry({}, async () => trace.push("terminal"));
    specimen.expect(trace).toEqual(["mw", "terminal"]);
  });
});
