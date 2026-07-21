import { specimen, middleware } from "@vivalence/typology";

specimen.describe("middleware", () => {
  specimen.it("a stack winds and unwinds around the terminal", async () => {
    const trace = [];
    const composed = middleware.compose([
      async (ctx, next) => {
        trace.push("a");
        await next();
        trace.push("a'");
      },
      async (ctx, next) => {
        trace.push("b");
        await next();
        trace.push("b'");
      },
    ]);
    await composed({}, async () => trace.push("terminal"));
    specimen.expect(trace).toEqual(["a", "b", "terminal", "b'", "a'"]);

    const sharing = middleware.compose([
      async (ctx, next) => {
        ctx.x = 1;
        await next();
      },
      async (ctx, next) => {
        ctx.y = ctx.x + 1;
        await next();
      },
    ]);
    const ctx = {};
    await sharing(ctx, async () => {});
    specimen.expect(ctx).toEqual({ x: 1, y: 2 });

    const bare = [];
    await middleware.compose([])({}, async () => bare.push("next"));
    specimen.expect(bare).toEqual(["next"]);
  });

  specimen.it("a chain links two middleware into one", async () => {
    const trace = [];
    const first = async (ctx, next) => {
      trace.push("first");
      await next();
    };
    const second = async (ctx, next) => {
      trace.push("second");
      await next();
    };
    await middleware.chain(first, second)({}, async () => trace.push("end"));
    specimen.expect(trace).toEqual(["first", "second", "end"]);
  });

  specimen.it("a next called twice rejects", async () => {
    let caught;
    await middleware.compose([async (ctx, next) => { await next(); await next(); }])({}, async () => {})
      .catch((error) => { caught = error; });
    specimen.expect(caught?.message).toMatch(/multiple times/);
  });
});
