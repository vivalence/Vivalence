import { specimen, steer, shape, Vector, Aperture } from "@vivalence/typology";

const { dispatch } = steer;

specimen.describe("dispatch", () => {
  specimen.it("arity 0 — calls with no args", () => {
    const effect = () => "zero";
    specimen.expect(dispatch(effect, { input: "ignored" })).toBe("zero");
  });

  specimen.it("arity 1 — passes ctx", () => {
    const effect = (ctx) => ctx.input;
    specimen.expect(dispatch(effect, { input: "one" })).toBe("one");
  });

  specimen.it("arity 2 — passes (input, ctx)", () => {
    const effect = (input, ctx) => ({ input, daemon: ctx.daemon });
    const ctx = { input: "body", daemon: "d" };
    const result = dispatch(effect, ctx);
    specimen.expect(result).toEqual({ input: "body", daemon: "d" });
  });
});

specimen.describe("dispatch through shape.object", () => {
  specimen.it("arity 2 handler works via object compilation", async () => {
    const vector = new Vector();
    vector.open("echo", (input, ctx) => ({ got: input }));

    const obj = shape.object(vector);
    const result = await obj.echo("hello");
    specimen.expect(result).toEqual({ got: "hello" });
  });

  specimen.it("arity 0 handler works via object compilation", async () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");

    const obj = shape.object(vector);
    specimen.expect(await obj.ping()).toBe("pong");
  });

  specimen.it("mixed arities on same vector", async () => {
    const vector = new Vector();
    vector.open("zero", () => 0);
    vector.open("one", (ctx) => ctx.input);
    vector.open("two", (input, ctx) => input);

    const obj = shape.object(vector);
    specimen.expect(await obj.zero()).toBe(0);
    specimen.expect(await obj.one(42)).toBe(42);
    specimen.expect(await obj.two("x")).toBe("x");
  });
});

specimen.describe("dispatch through aperture methods", () => {
  specimen.it("arity 2 handler works via aperture HTTP method dispatch", async () => {
    const app = new Aperture();
    app.post("echo", (input, ctx) => ({ got: input }));

    const handler = shape.http(app);
    const res = await handler(new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: true }),
    }));
    const body = await res.json();
    specimen.expect(body.got.data).toBe(true);
  });

  specimen.it("aperture compiled to object preserves arity 2 handlers", async () => {
    const app = new Aperture();
    app.use(async (ctx, next) => {
      ctx.daemon = "test-daemon";
      await next();
    });
    app.open("/pick", (input, ctx) => ({ input, daemon: ctx.daemon }));

    const obj = shape.object(app);
    const result = await obj.pick({ limit: 5 });
    specimen.expect(result.input).toEqual({ limit: 5 });
    specimen.expect(result.daemon).toBe("test-daemon");
  });
});
