import { specimen, shape, steer, Vector } from "@vivalence/typology";

specimen.describe("shape.selbstbestimmt", () => {
  specimen.it("a config-driven pipeline compiles to a plain async function", async () => {
    const trace = [];
    const normalize = shape.selbstbestimmt(
      new Vector()
        .use(async (ctx, next) => { ctx.input = ctx.input.trim(); await next(); })
        .use(async (ctx, next) => {
          trace.push(`in:  ${ctx.input}`);
          await next();
          trace.push(`out: ${ctx.output}`);
        })
        .affect((ctx) => ctx.input.toUpperCase()),
    );
    specimen.expect(await normalize("  hello  ")).toBe("HELLO");
    specimen.expect(await normalize("  world  ")).toBe("WORLD");
    specimen.expect(trace).toEqual([
      "in:  hello", "out: HELLO",
      "in:  world", "out: WORLD",
    ]);

    specimen.expect(await shape.selbstbestimmt(new Vector().affect((ctx) => ctx.input))({ hi: 1 })).toEqual({ hi: 1 });
    specimen.expect(await shape.selbstbestimmt(new Vector().open("ping", (ctx) => ({ pong: ctx.input })))(42)).toEqual({ pong: 42 });

    const order = [];
    await shape.selbstbestimmt(
      new Vector()
        .use(async (_, next) => { order.push("a"); await next(); })
        .use(async (_, next) => { order.push("b"); await next(); })
        .affect(() => { order.push("leaf"); }),
    )({});
    specimen.expect(order).toEqual(["a", "b", "leaf"]);
  });

  specimen.it("a sub-pipeline runs inside an execution envelope the caller owns", async () => {
    const run = shape.selbstbestimmt(
      new Vector()
        .use(async (ctx, next) => { ctx.enriched = true; await next(); })
        .affect((ctx) => ({ value: ctx.input * 2, enriched: ctx.enriched })),
      steer.strategy.direct,
    );
    const context = { input: 21, output: undefined };
    const output = await run(context);
    specimen.expect(output).toEqual({ value: 42, enriched: true });
    specimen.expect(context.enriched).toBe(true);
    specimen.expect(context.output).toEqual({ value: 42, enriched: true });
  });

  specimen.it("a greedy DFS walks to the first reachable effect", async () => {
    const rootFirst = new Vector();
    rootFirst.affect(() => "root");
    rootFirst.branch("child").open("leaf", () => "child");
    specimen.expect(await shape.selbstbestimmt(rootFirst)({})).toBe("root");

    const descend = new Vector();
    descend.branch("first").open("hit", () => "first");
    descend.branch("second").open("hit", () => "second");
    specimen.expect(await shape.selbstbestimmt(descend)({})).toBe("first");

    const walked = [];
    const accumulate = new Vector()
      .use(async (_, next) => { walked.push("root"); await next(); });
    accumulate.branch("inner")
      .use(async (_, next) => { walked.push("inner"); await next(); })
      .affect(() => { walked.push("leaf"); });
    await shape.selbstbestimmt(accumulate)({});
    specimen.expect(walked).toEqual(["root", "inner", "leaf"]);

    const visited = [];
    const pruned = new Vector();
    pruned.branch("empty")
      .use(async (_, next) => { visited.push("empty"); await next(); });
    pruned.branch("fruitful")
      .use(async (_, next) => { visited.push("fruitful"); await next(); })
      .affect(() => { visited.push("leaf"); });
    await shape.selbstbestimmt(pruned)({});
    specimen.expect(visited).toEqual(["fruitful", "leaf"]);
  });

  specimen.it("compile refuses a dead vector and never mutates the source", () => {
    const dead = new Vector();
    dead.branch("dead");
    let error;
    try { shape.selbstbestimmt(dead); }
    catch (thrown) { error = thrown; }
    specimen.expect(error?.message).toMatch(/no effect reachable/);

    const source = new Vector()
      .use(async (_, next) => await next())
      .affect((ctx) => ctx.input);
    const beforeCarryLength = source.carry.length;
    const beforeEffect = source.effect;
    const beforeTrajectoryKeys = [...source.trajectories.keys()];

    shape.selbstbestimmt(source);

    specimen.expect(source.carry.length).toBe(beforeCarryLength);
    specimen.expect(source.effect).toBe(beforeEffect);
    specimen.expect([...source.trajectories.keys()]).toEqual(beforeTrajectoryKeys);
  });
});
