import paladin from "@vivalence/paladin";
import { Vector, Span, Path, steer } from "@vivalence/typology";
import { shard } from "@vivalence/sheets";
import { ShellSignal, ShellContext } from "./typology.js";

import trajectories from "./trajectories/index.js";

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => (ctx.effect = await effect(ctx)));
  return context.effect;
};

const trajectory = new Vector();

trajectory
  .use(async (ctx, next) => {
    ctx.span = new Span("ghost.invoke").to(paladin.system.pipe).begin();
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
  })
  .use(async (ctx, next) => {
    // @beef issue: when mounting i collapse the environemnt variables and pass nulls to Url and Path constructors.
    // console.log("Deno.cwd(), new Path(Deno.cwd())", Deno.cwd(), new Path(Deno.cwd()));
    const cakes = await paladin.find.type(new Path(Deno.cwd()), "variant", 0);
    // console.log("cakes", cakes);
    if (cakes.length) {
      paladin.scopes([["variant", () => true, () => new Path(Deno.cwd())]]);
      // paladin.env.set("VIVA_VARIANT_MOUNT", Deno.cwd());
      ctx.variant = await paladin.variant.mount();
      // console.log("ctx.variant", ctx.variant);
    }
    await next();
    // console.log("Deno.cwd(), new Path(Deno.cwd())", Deno.cwd(), new Path(Deno.cwd()));
    // console.log("cakes", cakes);
    // console.log("ctx.variant", ctx.variant);
  })
  .use(shard.view());

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

await paladin.system.mount();

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
