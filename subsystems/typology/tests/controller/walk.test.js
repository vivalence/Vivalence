import { specimen } from "@vivalence/typology";
import { Signal } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";
import { walk } from "@vivalence/typology/controller";

const signals = (...paths) => {
  let i = 0;
  return () => Promise.resolve(i < paths.length ? new Signal(paths[i++]) : []);
};

specimen.describe("walk", () => {
  specimen.it("finds effect in single step", async () => {
    const vector = new Vector();
    const f = () => "found";
    vector.open("/users/:id", f);

    const [effect, , steps] = await walk(vector, signals("/users/123"));
    specimen.expect(effect).toBe(f);
    specimen.expect(steps.length).toBe(2);
  });

  specimen.it("finds effect with no heir", async () => {
    const vector = new Vector();
    const f = () => "flat";
    vector.open("test", f);

    const [effect] = await walk(vector, signals("test"));
    specimen.expect(effect).toBe(f);
  });

  specimen.it("carries middleware from traversal", async () => {
    const trace = [];
    const vector = new Vector();

    vector
      .use(async (_, next) => { trace.push("mw"); await next(); })
      .branch("api")
      .open("test", () => "result");

    const [, carry] = await walk(vector, signals("/api/test"));
    await carry({}, async () => trace.push("terminal"));
    specimen.expect(trace).toEqual(["mw", "terminal"]);
  });
});
