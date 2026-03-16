import { specimen, middleware } from "@vivalence/typology";

const { compose, chain, forward } = middleware;

specimen.describe("carry", () => {
  specimen.describe("compose", () => {
    specimen.it("executes middleware in order", async () => {
      const trace = [];
      const composed = compose([
        async (_, next) => {
          trace.push("a");
          await next();
          trace.push("a'");
        },
        async (_, next) => {
          trace.push("b");
          await next();
          trace.push("b'");
        },
      ]);

      await composed({}, async () => trace.push("terminal"));
      specimen.expect(trace).toEqual(["a", "b", "terminal", "b'", "a'"]);
    });

    specimen.it("shares context across middleware", async () => {
      const composed = compose([
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
      await composed(ctx, async () => {});
      specimen.expect(ctx).toEqual({ x: 1, y: 2 });
    });

    specimen.it("empty array calls next directly", async () => {
      const trace = [];
      await compose([])({}, async () => trace.push("next"));
      specimen.expect(trace).toEqual(["next"]);
    });
  });

  specimen.describe("chain", () => {
    specimen.it("composes two middleware functions", async () => {
      const trace = [];
      const first = async (_, next) => {
        trace.push("first");
        await next();
      };
      const second = async (_, next) => {
        trace.push("second");
        await next();
      };

      await chain(first, second)({}, async () => trace.push("end"));
      specimen.expect(trace).toEqual(["first", "second", "end"]);
    });
  });
});
