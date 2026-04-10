import { specimen, steer } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";

const { invoke } = steer;

specimen.describe("invoke", () => {
  specimen.it("invokes matched effect", async () => {
    const vector = new Vector();
    vector.open("greet", () => "hello");

    const result = await invoke(vector, "greet")();
    specimen.expect(result).toBe("hello");
  });

  specimen.it("passes input to effect", async () => {
    const vector = new Vector();
    vector.open("echo", (ctx) => ctx.input);

    const result = await invoke(vector, "echo")("ping");
    specimen.expect(result).toBe("ping");
  });

  specimen.it("runs middleware before effect", async () => {
    const trace = [];
    const vector = new Vector();

    vector.use(async (_, next) => {
      trace.push("mw");
      await next();
    });
    vector.open("action", () => {
      trace.push("effect");
      return "done";
    });

    await invoke(vector, "action")();
    specimen.expect(trace).toEqual(["mw", "effect"]);
  });

  specimen.it("extracts params from signal", async () => {
    const vector = new Vector();
    vector.open("/users/:id", (ctx) => ctx.params.id);

    const result = await invoke(vector, "/users/42")();
    specimen.expect(result).toBe("42");
  });

  specimen.it("throws on no match", () => {
    const vector = new Vector();
    specimen.expect(() => invoke(vector, "nope")).toThrow();
  });

  specimen.it("custom strategy", async () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");

    const custom = (carry, effect, steps, signal) => async () => {
      const ctx = { custom: true };
      await carry(ctx, async (c) => {
        c.output = await effect(c);
      });
      return { value: ctx.output, custom: ctx.custom };
    };

    const result = await invoke(vector, "ping", custom)();
    specimen.expect(result.value).toBe("pong");
    specimen.expect(result.custom).toBe(true);
  });
});
