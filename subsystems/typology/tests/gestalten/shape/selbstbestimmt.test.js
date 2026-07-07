import { specimen, shape, steer, Vector } from "@vivalence/typology";

specimen.describe("shape.selbstbestimmt", () => {

  specimen.describe("example 1 — string normalizer (bare)", () => {
    specimen.it("compiles a config-driven pipeline to a plain async function", async () => {
      const trace = [];
      const vector = new Vector()
        .use(async (ctx, next) => { ctx.input = ctx.input.trim(); await next(); })
        .use(async (ctx, next) => {
          trace.push(`in:  ${ctx.input}`);
          await next();
          trace.push(`out: ${ctx.output}`);
        })
        .affect((ctx) => ctx.input.toUpperCase());

      const normalize = shape.selbstbestimmt(vector);

      specimen.expect(await normalize("  hello  ")).toBe("HELLO");
      specimen.expect(await normalize("  world  ")).toBe("WORLD");
      specimen.expect(trace).toEqual([
        "in:  hello", "out: HELLO",
        "in:  world", "out: WORLD",
      ]);
    });
  });

  specimen.describe("example 2 — sub-pipeline on a pre-built context (direct)", () => {
    specimen.it("participates in an execution envelope the caller owns", async () => {
      const sub = new Vector()
        .use(async (ctx, next) => { ctx.enriched = true; await next(); })
        .affect((ctx) => ({ value: ctx.input * 2, enriched: ctx.enriched }));

      const run = shape.selbstbestimmt(sub, steer.strategy.direct);

      const context = { input: 21, output: undefined };
      const output = await run(context);

      specimen.expect(output).toEqual({ value: 42, enriched: true });
      specimen.expect(context.enriched).toBe(true);
      specimen.expect(context.output).toEqual({ value: 42, enriched: true });
    });
  });

  specimen.describe("compile", () => {
    specimen.it("compiles a vector with affect() and no middleware", async () => {
      const vector = new Vector().affect((ctx) => ctx.input);
      const run = shape.selbstbestimmt(vector);
      specimen.expect(await run({ hi: 1 })).toEqual({ hi: 1 });
    });

    specimen.it("compiles a vector whose only effect is keyed (no affect)", async () => {
      const vector = new Vector().open("ping", (ctx) => ({ pong: ctx.input }));
      const run = shape.selbstbestimmt(vector);
      specimen.expect(await run(42)).toEqual({ pong: 42 });
    });

    specimen.it("runs root carry before the effect, in order", async () => {
      const trace = [];
      const vector = new Vector()
        .use(async (_, next) => { trace.push("a"); await next(); })
        .use(async (_, next) => { trace.push("b"); await next(); })
        .affect(() => { trace.push("leaf"); });

      await shape.selbstbestimmt(vector)({});
      specimen.expect(trace).toEqual(["a", "b", "leaf"]);
    });
  });

  specimen.describe("greedy DFS", () => {
    specimen.it("picks the first effect at the root when one exists", async () => {
      const vector = new Vector();
      vector.affect(() => "root");
      vector.branch("child").open("leaf", () => "child");
      specimen.expect(await shape.selbstbestimmt(vector)({})).toBe("root");
    });

    specimen.it("descends into the first trajectory when root has no effect", async () => {
      const vector = new Vector();
      vector.branch("first").open("hit", () => "first");
      vector.branch("second").open("hit", () => "second");
      specimen.expect(await shape.selbstbestimmt(vector)({})).toBe("first");
    });

    specimen.it("accumulates middleware along the walked path", async () => {
      const trace = [];
      const vector = new Vector()
        .use(async (_, next) => { trace.push("root"); await next(); });
      vector.branch("inner")
        .use(async (_, next) => { trace.push("inner"); await next(); })
        .affect(() => { trace.push("leaf"); });

      await shape.selbstbestimmt(vector)({});
      specimen.expect(trace).toEqual(["root", "inner", "leaf"]);
    });

    specimen.it("does not leak middleware from fruitless sibling subtrees", async () => {
      const trace = [];
      const vector = new Vector();
      vector.branch("empty")
        .use(async (_, next) => { trace.push("empty"); await next(); });
      vector.branch("fruitful")
        .use(async (_, next) => { trace.push("fruitful"); await next(); })
        .affect(() => { trace.push("leaf"); });

      await shape.selbstbestimmt(vector)({});
      specimen.expect(trace).toEqual(["fruitful", "leaf"]);
    });
  });

  specimen.describe("error modes", () => {
    specimen.it("throws on a vector with no reachable effect", () => {
      const vector = new Vector();
      vector.branch("dead");
      let error;
      try { shape.selbstbestimmt(vector); }
      catch (e) { error = e; }
      specimen.expect(error?.message).toMatch(/no effect reachable/);
    });
  });

  specimen.describe("invariant — source vector is not mutated by compile", () => {
    specimen.it("carry, effects, and trajectories are identical before and after", () => {
      const vector = new Vector()
        .use(async (_, next) => await next())
        .affect((ctx) => ctx.input);

      const beforeCarryLen = vector.carry.length;
      const beforeEffectKeys = [...vector.effects.keys()];
      const beforeTrajectoryKeys = [...vector.trajectories.keys()];

      shape.selbstbestimmt(vector);

      specimen.expect(vector.carry.length).toBe(beforeCarryLen);
      specimen.expect([...vector.effects.keys()]).toEqual(beforeEffectKeys);
      specimen.expect([...vector.trajectories.keys()]).toEqual(beforeTrajectoryKeys);
    });
  });
});
