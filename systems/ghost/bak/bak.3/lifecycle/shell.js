import paladin, { lifecycle } from "@vivalence/paladin";
import { createInterface } from "node:readline";
import { Path, Queue, Vector, fn, fromm, is, object, shard, steer } from "@vivalence/typology";
import { outline } from "@vivalence/sheets/plain";
import * as dotenv from "@std/dotenv";
import { resolve } from "@std/path";
import * as lifecycles from "./index.js";
import * as belt from "../gestalten/belt/index.js";
import * as commands from "../commands/index.js";
import * as dominion from "../commands/paladin/index.js";
import { Client } from "../prototypes/client.js";
import * as schematics from "../schematics/index.js";

const PANES = ["signin", "crown", "dock", "frame", "navigation"];

const PROMPT = "<< ";

export const instance = async (ctx, next) => {
  const cwd = belt.path.cwd();
  const recipe = await Deno.stat(new Path(cwd).branch("instance.viva.json").absolute).catch(() => null);
  if (recipe?.isFile) {
    paladin.env.set("VIVA_INSTANCE_MOUNT", cwd, "cwd");
    ctx.instance = await lifecycle.mount(paladin.instance);
  }
  await next();
};

const declared = (ctx, name) => {
  const natures = ctx.steps.map((step) => step.nature);
  const { schema } = steer.trie.at(ctx.shell, natures.slice(0, -1)).trie.get(natures[natures.length - 1]).pattern;
  return schema !== undefined && Object.hasOwn(schema.properties, name);
};

export const flags = async (ctx, next) => {
  for (const [name, held] of Object.entries(belt.config.mounts)) {
    const token = ctx.signal.flags[name];
    if (token === true && !declared(ctx, name)) throw new Error(`--${name} needs a value: --${name}=${held.shape}`);
    if (!is.string(token)) continue;
    const pinned = name === "instance" ? (await paladin.ledger.instances.resolve(token)).mount : belt.path.pin(token);
    paladin.env.set(held.key, pinned, "flag");
  }
  if (is.string(ctx.signal.flags.env)) {
    const vars = await dotenv.load({ envPath: resolve(belt.path.cwd(), ctx.signal.flags.env) });
    const held = object.filter(vars, (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"));
    const secrets = object.filter(vars, (key) => key.startsWith("SECRET_VIVA_"));
    if (!Object.keys(held).length && !Object.keys(secrets).length) throw new Error(`--env ${ctx.signal.flags.env}: no VIVA_* knowledge in it`);
    paladin.env.assign(held, ".env");
    paladin.secret.assign(secrets, ".env");
  }
  ctx.flags = [...belt.help.flagged(schematics.FLAGS), ...Object.entries(belt.config.mounts).map(([name, held]) => `--${name}=${held.shape}`)];
  await next();
};

export const view = async (ctx, next) => {
  const json = ctx.signal.flags.json === true;
  ctx.view = belt.view(belt.plain, { json });
  try {
    await next();
    if (json) console.log(JSON.stringify(ctx.output, null, 2));
    else if (!ctx.view.painted && ctx.output != null) await ctx.view.emit("report", { blocks: outline(ctx.output) });
  } finally {
    await belt.close();
  }
};

export const call = async (ctx, next) => {
  ctx.call = (argv) => {
    const signal = new ctx.signal.constructor(argv);
    return steer.dispatch.invoke(ctx.shell, signal, (carry, effect, steps) => async () => {
      const inner = { ...ctx, signal, steps, params: fromm.match(steps).parameters, output: undefined, view: { ...ctx.view, painted: true } };
      await carry(inner, steer.strategy.resolve(effect));
      return inner.output;
    })();
  };
  await next();
};

const mask = (instance) => {
  const row = instance.clients.find((client) => client.manifest.slug === "ghost") ?? { traits: [], trait: {} };
  return { manifest: { type: "client", slug: "ghost" }, statics: { remote: instance.runtime.statics.remote }, traits: row.traits, trait: row.trait };
};

const carrier = async () => {
  const { credentials } = await import("../chrome/credentials.js");
  return credentials(paladin.scope.ledger.branch("credentials.json").absolute);
};

const lines = (input) => {
  const queue = new Queue();
  const listen = () => {
    const reader = createInterface({ input, crlfDelay: Infinity });
    const closing = () => queue.close();
    reader.on("line", (line) => queue.enqueue(line));
    reader.once("close", closing);
    return { reader, closing };
  };
  let held = listen();
  return {
    drain: () => queue.drain(),
    silence: () => {
      held.reader.off("close", held.closing);
      held.reader.close();
    },
    listen: () => {
      held = listen();
    },
    stop: () => held.reader.close(),
  };
};

const pipes = (view, credentials, lines) => {
  const writer = Deno.stdout.writable.getWriter();
  const encoder = new TextEncoder();
  const prompt = () => (Deno.stdout.isTerminal() ? writer.write(encoder.encode(PROMPT)) : Promise.resolve());
  return {
    name: "pipes",
    interactive: false,
    viewport: () => ({ width: view.width(), height: 40 }),
    credentials,
    accept: ["application/json"],
    keys: (async function* () {
      await prompt();
      for await (const line of lines.drain()) {
        if (line.trim() !== "") yield line;
        await prompt();
      }
    })(),
    emit: (kind, props) => writer.write(encoder.encode(JSON.stringify({ [kind]: props }) + "\n")),
    hold: (kind) => Promise.reject(new Error(`${kind}: nothing to hold under a pipe — pass its inputs as parameters`)),
    mount: Object.fromEntries(PANES.map((pane) => [pane, () => ({ place: () => undefined, destroy: () => undefined })])),
  };
};

const typed = (view, credentials, lines) => ({
  ...pipes(view, credentials, lines),
  name: "typed",
  interactive: true,
  emit: (kind, props) => (kind === "output" ? view.emit("report", { blocks: outline(props) }) : view.emit(kind, props)),
  hold: async (kind, props) => {
    lines.silence();
    try {
      return await belt.plain.hold(kind, props);
    } finally {
      await belt.close();
      lines.listen();
    }
  },
});

export const upgrading = async (ctx, next) => {
  let runtime = belt.instance.standing;
  let holder = null;
  const ground = fn.memo(async () => {
    if (!ctx.instance) ctx.instance = await lifecycle.mount(paladin.instance);
    runtime = await belt.instance.boot("logged");
  });
  ctx.upgrade = {
    repl: async () => {
      await ground();
      const client = new Client(mask(ctx.instance), ctx.controller);
      const reading = lines(ctx.view.stdin);
      const surface = (ctx.view.interactive ? typed : pipes)(ctx.view, await carrier(), reading);
      client.repl.use(shard.context.bind("call", ctx.call));
      if (ctx.view.interactive) client.repl.use(shard.context.bind("upgrade", ctx.upgrade)).graft(commands.chrome);
      holder = { controller: client.controller, mask: client.mask, surface, client };
      holder.execution = steer.dispatch.execute(lifecycles.client.execution, holder).finally(() => reading.stop());
    },
    chrome: async () => {
      await ground();
      const client = new Client(mask(ctx.instance), ctx.controller);
      try {
        if (holder !== null) {
          holder.controller.kill("SIGTERM", "chrome");
          await holder.execution;
        }
        const sheets = await import("@vivalence/sheets");
        const { tty } = await import("../chrome/surface.js");
        const { createCliRenderer } = await sheets.opentui();
        const renderer = await createCliRenderer({ exitOnCtrlC: false, stdin: ctx.view.stdin });
        holder = { controller: client.controller, mask: client.mask, surface: tty(renderer, { credentials: await carrier() }), client };
        holder.execution = steer.dispatch.execute(lifecycles.client.execution, holder).finally(() => renderer.destroy());
      } catch (error) {
        client.controller.stdout.fault(error);
      }
    },
  };
  try {
    await next();
    for (const child of ctx.controller.children) {
      await child.settled;
      const { code, error } = child.status.reflection;
      if (code !== "STOPPED") throw new Error(`${child.stdout.absolute} ${code}: ${error ? error.message : "no error"}`);
    }
  } finally {
    await runtime.disintegrate();
  }
};

export const helping = async (ctx, next) => {
  if (ctx.signal.flags.help !== true) return next();
  const commands = belt.help.named(belt.help.census(execution), ctx.signal.pathname.slice(1));
  await ctx.view.emit("listing", belt.help.listing(commands, ctx.flags));
  ctx.output = { commands, flags: ctx.flags };
};

export const execution = new Vector()
  .use(shard.controller.settle)
  .use(instance)
  .use(flags)
  .use(view)
  .use(helping)
  .use(call)
  .use(upgrading)
  .graft(dominion.paladin, commands.upgrade, commands.missing)
  .do((ctx) => ctx.upgrade.repl());
