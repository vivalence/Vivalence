import paladin from "@vivalence/paladin";
import { is, object, Vector, Span, Path, steer, shard } from "@vivalence/typology";
import { view, JsonTree, Effect } from "@vivalence/sheets";
import * as dotenv from "@std/dotenv";
import { resolve } from "@std/path";
import { ShellSignal, ShellContext } from "./typology.js";
import { config, path } from "./belt/index.js";

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
    // pipe.tap(span=> paladin.ledger.pipe[...probably paladin.ledger.log()])

    ctx.span = new Span("ghost");
    // ctx.span.to(paladin.instance.logs);

    ctx.span.open();
    ctx.span.mark("subject", { schema: "signal", id: ctx.signal.absolute.join(" ") });

    try {
      await next();
    } finally {
      if (ctx.error) ctx.span.fault(ctx.error);
      ctx.span.close();
    }
  })

  // .use(async (ctx, next) => {ctx.span = new Span("ghost.invoke").to(paladin.ledger.pipe).begin(); ctx.span.track.subject({ schema: "signal", id: ctx.signal.absolute.join(" ") }); await next(); if (ctx.error) ctx.span.track.fault().raise(ctx.error.message, ctx.error.code); ctx.span.drain();})
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
    // collapsed onto steer.dispatch.invoke — the same combinator the entrypoint uses at the bottom of this file.
    // ctx.call = async (args) => {
    //   const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
    //   const [apply, effect] = steer.dispatch.traverse(trajectory, signal); // @beef validate
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
      const inner = new ShellContext({ signal });
      inner.rendered = true;
      return steer.dispatch.invoke(trajectory, signal, strategy)(inner);
    };

    await next();
  })
  .use(async (ctx, next) => {
    // shell cwd — deno task rewrites Deno.cwd() to repo root; INIT_CWD preserves user shell cwd
    const cwd = path.cwd();
    const modules = await paladin.find.type(new Path(cwd), "instance", 0);
    if (modules.length) {
      paladin.env.set("VIVA_INSTANCE_MOUNT", cwd, "cwd");
      ctx.instance = await paladin.instance.mount();
    }
    await next();
  })
  // view surface dispatch :: --buffer hijacks scroll into a Chrome shell.
  // post-body :: --json dumps effect; --tree walks effect interactively.
  .use(async (ctx, next) => {
    const flags = ctx.signal.flags ?? {};
    let shell = null;

    // one ruling on whether this shell can prompt at all — pickers and wizards read it, never re-derive it.
    ctx.interactive = !flags.json && Deno.stdin.isTerminal() && Deno.stdout.isTerminal();

    const marking = (verb) => (...args) => {
      ctx.rendered = true;
      return view.scroll[verb](...args);
    };

    if (flags.buffer) {
      shell = view.buffer.shell();
      ctx.view = view.hijack(shell);
      ctx.rendered = true;
    } else {
      const emit = flags.json ? async () => (ctx.rendered = true) : marking("emit");
      ctx.view = { ...view, scroll: { ...view.scroll, emit, render: marking("render") } };
    }

    try {
      await next();
      if (shell) await shell.untilExit(); // hold alt-screen until user presses esc/return
    } finally {
      if (shell) shell.release();
      if (flags.json) {
        console.log(JSON.stringify(ctx.effect, null, 2));
      } else if (!ctx.rendered && ctx.effect != null && !ctx.error) {
        await view.scroll.emit({ data: ctx.effect }, null, Effect);
      }
    }
  });

trajectories(trajectory);

const argv = Deno.args.length ? [...Deno.args] : ["help"];
if (argv[0] === "--help") argv[0] = "help";

let signal = new ShellSignal(argv);
if (signal.flags?.help) {
  const nature = signal.array.map((segment) => segment.nature).join("/");
  const carried = Object.entries(signal.flags)
    .filter(([key]) => key !== "help")
    .map(([key, value]) => (value === true ? `--${key}` : `--${key}=${value}`));
  signal = new ShellSignal(["help", ...(nature ? [nature] : []), ...carried]);
}
const context = new ShellContext({ signal });

for (const mount of config.MOUNTS) {
  const reference = signal.flags?.[mount];
  if (!is.string(reference)) continue;
  // MOUNT MEANS PATH — --instance may name a slug on the shelf, the env var never holds one.
  const pinned = mount === "instance" ? path.instance(reference) : path.pin(reference);
  paladin.env.set(`VIVA_${mount.toUpperCase()}_MOUNT`, pinned, "flag");
}

if (signal.flags?.env === true) throw new Error("--env needs a value: --env=<path>");
if (is.string(signal.flags?.env)) {
  const vars = await dotenv.load({ envPath: resolve(path.cwd(), signal.flags.env) });
  const keys = {
    public: (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"),
    secret: (key) => key.startsWith("SECRET_VIVA_"),
  };
  const held = object.filter(vars, keys.public);
  const secrets = object.filter(vars, keys.secret);
  if (!Object.keys(held).length && !Object.keys(secrets).length)
    throw new Error(`--env ${signal.flags.env}: no VIVA_* knowledge in it`);
  paladin.env.assign(held, ".env");
  paladin.secret.assign(secrets, ".env");
}

try {
  await steer.dispatch.invoke(trajectory, signal, strategy)(context);
  if (context.error) console.error(context.error);
} catch (error) {
  if (error.code === "NOT_FOUND") {
    console.error("ghost: no handler for", signal.absolute.join(" "));
    console.error("try: viva help");
    Deno.exit(127);
  }
  console.error(error);
  Deno.exit(1);
}
