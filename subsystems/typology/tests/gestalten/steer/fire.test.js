import { specimen, steer, shape, Vector, Aperture } from "@vivalence/typology";

specimen.describe("fire", () => {
  specimen.it("an effect fires by its arity", () => {
    specimen.expect(steer.strategy.fire(() => "zero", { input: "ignored" })).toBe("zero");
    specimen.expect(steer.strategy.fire((ctx) => ctx.input, { input: "one" })).toBe("one");

    const paired = (input, ctx) => ({ input, daemon: ctx.daemon });
    specimen.expect(steer.strategy.fire(paired, { input: "body", daemon: "d" })).toEqual({ input: "body", daemon: "d" });
  });

  specimen.it("every arity survives object compilation", async () => {
    const vector = new Vector();
    vector.open("echo", (input, ctx) => ({ got: input }));
    vector.open("ping", () => "pong");
    vector.open("zero", () => 0);
    vector.open("one", (ctx) => ctx.input);
    vector.open("two", (input, ctx) => input);

    const compiled = shape.object(vector);
    specimen.expect(await compiled.echo("hello")).toEqual({ got: "hello" });
    specimen.expect(await compiled.ping()).toBe("pong");
    specimen.expect(await compiled.zero()).toBe(0);
    specimen.expect(await compiled.one(42)).toBe(42);
    specimen.expect(await compiled.two("x")).toBe("x");
  });

  specimen.it("an aperture preserves arity over http and object", async () => {
    const httpApp = new Aperture();
    httpApp.post("echo", (input, ctx) => ({ got: input }));
    const handler = shape.http(httpApp);
    const response = await handler(new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: true }),
    }));
    const body = await response.json();
    specimen.expect(body.got.data).toBe(true);

    const objectApp = new Aperture();
    objectApp.use(async (ctx, next) => {
      ctx.daemon = "test-daemon";
      await next();
    });
    objectApp.open("/pick", (input, ctx) => ({ input, daemon: ctx.daemon }));
    const compiled = shape.object(objectApp);
    const picked = await compiled.pick({ limit: 5 });
    specimen.expect(picked.input).toEqual({ limit: 5 });
    specimen.expect(picked.daemon).toBe("test-daemon");
  });
});
