import { specimen, Signal, fromm } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { traverse } from "@vivalence/vector/controller";

specimen.describe("traverse", () => {
  specimen.it("finds effect", () => {
    const vector = new Vector();
    const f = () => "test";
    vector.open("/users/:id", f);

    const [effect, , steps] = traverse(vector, new Signal("/users/123"));
    specimen.expect(effect).toBe(f);
    specimen.expect(steps.length).toBe(2);
  });

  specimen.it("walks nested descendants", () => {
    const vector = new Vector();
    const f = () => "profile";
    vector.branch("/api").branch("/users").open("/:id/profile", f);

    const [effect, , steps] = traverse(vector, new Signal("/api/users/123/profile"));
    specimen.expect(effect).toBe(f);
    specimen.expect(steps.length).toBe(4);
  });

  specimen.it("accumulates carry", async () => {
    const trace = [];
    const vector = new Vector();

    vector
      .use(async (_, next) => { trace.push("root"); await next(); trace.push("root'"); })
      .branch("/api")
      .use(async (_, next) => { trace.push("branch"); await next(); trace.push("branch'"); })
      .open("/test", () => "result");

    const [effect, carry] = traverse(vector, new Signal("/api/test"));
    await carry({}, async () => trace.push("terminal"));
    specimen.expect(trace).toEqual(["root", "branch", "terminal", "branch'", "root'"]);
  });

  specimen.it("throws on no match", () => {
    const vector = new Vector();
    specimen.expect(() => traverse(vector, new Signal("/nope"))).toThrow();
  });

  specimen.it("remainder consumes all segments and captures params", () => {
    const vector = new Vector();
    const f = () => "caught";
    vector.open("(.*)", f);

    const [effect, , steps] = traverse(vector, new Signal("/any/deep/path"));
    specimen.expect(effect).toBe(f);
    specimen.expect(steps.length).toBe(3);

    const params = fromm.match(steps).parameters;
    specimen.expect(params[0]).toBe("any");
    specimen.expect(params[1]).toBe("deep");
    specimen.expect(params[2]).toBe("path");
  });

  specimen.it("remainder after literal branch captures remaining", () => {
    const vector = new Vector();
    const f = () => "caught";
    vector.branch("api").open("(.*)", f);

    const [effect, , steps] = traverse(vector, new Signal("/api/anything/here"));
    specimen.expect(effect).toBe(f);

    const params = fromm.match(steps).parameters;
    specimen.expect(params[0]).toBe("anything");
    specimen.expect(params[1]).toBe("here");
  });

  specimen.it("remainder + named params coexist", () => {
    const vector = new Vector();
    const f = () => "caught";
    vector.branch(":tenant").open("(.*)", f);

    const [effect, , steps] = traverse(vector, new Signal("/acme/any/path"));
    specimen.expect(effect).toBe(f);

    const params = fromm.match(steps).parameters;
    specimen.expect(params.tenant).toBe("acme");
    specimen.expect(params[0]).toBe("any");
    specimen.expect(params[1]).toBe("path");
  });

  specimen.it("returns null effect when only trajectory matched", () => {
    const vector = new Vector();
    vector.branch("api");

    const [effect] = traverse(vector, new Signal("api"));
    specimen.expect(effect).toBe(null);
  });
});
