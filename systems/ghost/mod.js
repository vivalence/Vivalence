import paladin from "@vivalence/paladin";
import { Vector, Span, steer } from "@vivalence/typology";
import { ShellSignal, ShellContext } from "./typology/index.js";

// await paladin.ikiro;

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => (ctx.effect = await effect(ctx)));
  return context.effect;
};
import trajectories from "./trajectories/index.js";

const trajectory = new Vector();
trajectory
  .use(async (ctx, next) => {
    ctx.span = new Span("ghost.invoke").to(paladin.system.logs.pipe).begin();
    ctx.span.track.subject({ schema: "signal", id: ctx.signal.absolute.join(" ") });
    await next();
    if (ctx.error) ctx.span.track.fault().raise(ctx.error.message, ctx.error.code);
    ctx.span.drain();
  })
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.error = error;
    }
  })
  .use(async (ctx, next) => {
    ctx.call = async (args) => {
      const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
      const [apply, effect] = steer.traverse(trajectory, signal); // @beef validate
      const context = new ShellContext({ signal });
      await apply(context, async (_ctx) => {
        const result = await effect(_ctx);
        if (!_ctx.effect && result) _ctx.effect = result;
      });
      return context.effect;
    };

    await next();
  });

trajectories(trajectory);

if (!Deno.args.length) {
  // console.log("usage: viva <command> [args...] [--flags]");
  // console.log("commands:");
  // console.log("  instance/clone <slug> <target>");
  // console.log("  instance/run   <slug|path>      (attached)");
  // console.log("  instance/start <slug|path>      (detached)");
  // console.log("  instance/stop  <slug|path>");
  // console.log("  sheets/text-select");
  Deno.exit(0);
}

const signal = new ShellSignal(Deno.args);
const context = new ShellContext({ signal });

try {
  await steer.invoke(trajectory, signal, strategy)(context);
  // console.log(context);
  if (context.error) console.error(context.error);
} catch (error) {
  if (error.code === "NOT_FOUND") {
    console.error("ghost: no handler for", signal.absolute.join(" "));
    Deno.exit(127);
  }
  console.error(error);
  Deno.exit(1);
}
