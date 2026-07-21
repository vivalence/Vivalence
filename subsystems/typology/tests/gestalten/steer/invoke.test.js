import { specimen, steer, Vector } from "@vivalence/typology";

specimen.describe("invoke", () => {
  specimen.it("a signal invokes its matched effect", async () => {
    const greeter = new Vector();
    greeter.open("greet", () => "hello");
    specimen.expect(await steer.dispatch.invoke(greeter, "greet")()).toBe("hello");

    const echoer = new Vector();
    echoer.open("echo", (ctx) => ctx.input);
    specimen.expect(await steer.dispatch.invoke(echoer, "echo")("ping")).toBe("ping");

    const parameterized = new Vector();
    parameterized.open("/users/:id", (ctx) => ctx.params.id);
    specimen.expect(await steer.dispatch.invoke(parameterized, "/users/42")()).toBe("42");

    specimen.expect(() => steer.dispatch.invoke(new Vector(), "nope")).toThrow();
  });

  specimen.it("a middleware runs before the effect", async () => {
    const trace = [];
    const vector = new Vector();
    vector.use(async (ctx, next) => {
      trace.push("mw");
      await next();
    });
    vector.open("action", () => {
      trace.push("effect");
      return "done";
    });
    await steer.dispatch.invoke(vector, "action")();
    specimen.expect(trace).toEqual(["mw", "effect"]);
  });

  specimen.it("a custom strategy shapes the call", async () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");
    const custom = (carry, effect, steps, signal) => async () => {
      const ctx = { custom: true };
      await carry(ctx, async (carried) => {
        carried.output = await effect(carried);
      });
      return { value: ctx.output, custom: ctx.custom };
    };
    const result = await steer.dispatch.invoke(vector, "ping", custom)();
    specimen.expect(result.value).toBe("pong");
    specimen.expect(result.custom).toBe(true);
  });
});
