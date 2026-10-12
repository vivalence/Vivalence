import { Vector, fromm, specimen, steer, v } from "@vivalence/typology";
import { Argv } from "../prototypes/argv.js";
import { call } from "../lifecycle/shell.js";

const { describe, it, expect } = specimen;

const shell = new Vector()
  .use(call)
  .graft(
    new Vector().open({ nature: "/outer", schema: v.object({ token: v.string().optional() }) }, (ctx) => ctx.call(["inner", "anima", "--logged"])),
    new Vector().open({ nature: "/inner", schema: v.object({ process: v.string().optional() }) }, (ctx) => ({ body: ctx.signal.body, flags: ctx.signal.flags })),
  );

const invoke = (argv) => {
  const signal = new Argv(argv);
  const ctx = { shell, signal, view: { painted: false }, output: undefined };
  return steer.dispatch.invoke(shell, signal, (carry, effect, steps) => async () => {
    Object.assign(ctx, { steps, params: fromm.match(steps).parameters });
    await carry(ctx, steer.strategy.resolve(effect));
    return ctx.output;
  })();
};

describe("ctx.call — a chained verb reads its own line, never its caller's", () => {
  it("instance/use localhost up anima: the inner verb sees anima, not localhost", async () => {
    expect(await invoke(["outer", "localhost", "up", "anima"])).toEqual({ body: ["anima"], flags: { logged: true } });
  });
});
