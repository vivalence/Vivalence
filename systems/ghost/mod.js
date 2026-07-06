import paladin from "@vivalence/paladin";
import { Vector, Span, Path, steer, shard } from "@vivalence/typology";
import { view, JsonTree } from "@vivalence/sheets";
import { ShellSignal, ShellContext } from "./typology.js";

import trajectories from "./trajectories/index.js";

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => {
    const result = await effect(ctx);
    ctx.effect ??= result;
  });
  return context.effect;
};

const trajectory = new Vector();

trajectory
  .use(async (ctx, next) => {
    // const pipe = new Pipe()
    // pipe.tap(span=> paladin.system.pipe[...probably paladin.system.log()])

    ctx.span = new Span("ghost");
    // ctx.span.to(paladin.variant.logs);

    ctx.span.begin();
    ctx.span.track.subject({ schema: "signal", id: ctx.signal.absolute.join(" ") });

    try {
      await next();
    } finally {
      if (ctx.error) ctx.span.track.fault().raise(ctx.error.message, ctx.error.code);
      ctx.span.drain();
    }
  })

  // .use(async (ctx, next) => {ctx.span = new Span("ghost.invoke").to(paladin.system.pipe).begin(); ctx.span.track.subject({ schema: "signal", id: ctx.signal.absolute.join(" ") }); await next(); if (ctx.error) ctx.span.track.fault().raise(ctx.error.message, ctx.error.code); ctx.span.drain();})
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.error = error;
    }
  })
  .use(async (ctx, next) => {
    // was: hand-inlined strategy with a swapped `[apply, effect]` — traverse returns [effect, carry, …],
    // so the leaf ran as middleware and the fold ran as a leaf; span + error-catch never wrapped sub-calls.
    // collapsed onto steer.invoke — the same combinator the entrypoint uses at the bottom of this file.
    // ctx.call = async (args) => {
    //   const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
    //   const [apply, effect] = steer.traverse(trajectory, signal); // @beef validate
    //   const context = new ShellContext({ signal });
    //   await apply(context, async (_ctx) => {
    //     // @beef try catch pipe bubble!
    //     const result = await effect(_ctx);
    //     if (!_ctx.effect && result) _ctx.effect = result;
    //   });
    //   return context.effect;
    // };
    ctx.call = (args) => {
      const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
      return steer.invoke(trajectory, signal, strategy)(new ShellContext({ signal }));
    };

    await next();
  })
  .use(async (ctx, next) => {
    // shell cwd — deno task rewrites Deno.cwd() to repo root; INIT_CWD preserves user shell cwd
    const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
    const modules = await paladin.find.type(new Path(cwd), "variant", 0);
    if (modules.length) {
      paladin.scopes([["variant", () => true, () => new Path(cwd)]]);
      ctx.variant = await paladin.variant.mount();
    }
    await next();
  })
  // view surface dispatch :: --buffer hijacks scroll into a Chrome shell.
  // post-body :: --json dumps effect; --tree walks effect interactively.
  .use(async (ctx, next) => {
    const flags = ctx.signal.flags ?? {};
    // console.log({ ctx }, ctx.signal.flags);
    let shell = null;

    if (flags.buffer) {
      shell = view.buffer.shell();
      ctx.view = view.hijack(shell);
    } else {
      ctx.view = view;
    }

    try {
      await next();
      if (shell) await shell.untilExit(); // hold alt-screen until user presses esc/return
    } finally {
      if (shell) shell.release();
      if (flags.json) {
        console.log(JSON.stringify(ctx.effect, null, 2));
        // } else if (flags.tree) {
        // ctx.view = view.hijack(shell);
        //   await view.scroll.render({ data: ctx.effect }, null, JsonTree);
      }
    }
  });

trajectories(trajectory);

if (!Deno.args.length) Deno.exit(0);

const signal = new ShellSignal(Deno.args);
const context = new ShellContext({ signal });

await paladin.system.mount();

try {
  await steer.invoke(trajectory, signal, strategy)(context);
  if (context.error) console.error(context.error);
} catch (error) {
  if (error.code === "NOT_FOUND") {
    console.error("ghost: no handler for", signal.absolute.join(" "));
    Deno.exit(127);
  }
  console.error(error);
  Deno.exit(1);
}
