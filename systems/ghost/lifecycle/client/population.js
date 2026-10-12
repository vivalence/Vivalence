import { computed } from "nanostores";
import { Connection, Path, Url, fromm, shard, steer } from "@vivalence/typology";
import { Lighthouse } from "../../prototypes/lighthouse.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { Daemon, DaemonDossier } from "../../prototypes/daemon.js";
import { ModeDossier } from "../../prototypes/mode.js";
import { LiteralDossier } from "../../prototypes/literal.js";
import { SymbolDossier } from "../../prototypes/symbol.js";
import { TerminalDossier } from "../../prototypes/terminal.js";
import { IntentDossier } from "../../prototypes/intent.js";
import { ThreadDossier } from "../../prototypes/thread/index.js";
import { BufferDossier } from "../../prototypes/buffer.js";
import { TurnDossier } from "../../prototypes/turn.js";
import { ActivityDossier } from "../../prototypes/activity.js";
import * as line from "../../gestalten/belt/line.js";
import { execution, painting } from "../repl.js";

const USERSPACE = ["intent", "thread", "buffer", "turn", "activity", "terminal"];

export const lighthouse = async (die, next) => {
  const { runtime } = die.client;
  const connection = new Connection(
    new Url(runtime.remote),
    shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }),
  ).use(shard.track.span((call) => call.request.url.pathname, die.controller.stdout.pipe));
  runtime.lighthouse = new Lighthouse(connection, {
    stdout: die.controller.stdout.branch("lighthouse"),
  });
  runtime.lighthouse.manifest = await runtime.lighthouse.runtime.call("/lighthouse/metadata");
  try {
    await next();
  } finally {
    runtime.lighthouse.multiplex.close();
  }
};

export const repl = async (die, next) => {
  const { client } = die;
  client.repl
    .use(shard.context.bind("client", client))
    .use(shard.context.bind("runtime", client.runtime))
    .use(shard.context.bind("controller", client.controller))
    .use(shard.context.bind("flags", []))
    .use(shard.track.span((ctx) => ctx.signal.pathname, client.controller.stdout.pipe))
    .use(painting(die.surface))
    .graft(execution);

  client.dispatch = (input) => {
    const terminal = client.terminals.active;
    const repl = terminal === null || terminal.repl === null ? client.repl : terminal.repl;
    const signal = line.read(repl, input);
    return steer.dispatch.invoke(repl, signal, (carry, effect, steps) => async () => {
      const ctx = {
        signal,
        steps,
        terminal,
        repl,
        params: fromm.match(steps).parameters,
        input: signal.body,
        output: undefined,
      };
      await carry(ctx, steer.strategy.resolve(effect));
      return ctx.output;
    })();
  };
  await next();
};

export const entities = async (die, next) => {
  const { client } = die;
  const { runtime } = client;
  const root = runtime.lighthouse.runtime;
  runtime.manifest = await root.call("/metadata/manifest");
  runtime.reference = new Path(`/runtime/${runtime.manifest.slug}`);
  runtime.connection = root.branch(runtime.reference.absolute);
  runtime.entities = new Dataspace({
    connection: runtime.connection,
    runtime: root,
    entities: [
      DaemonDossier,
      ModeDossier,
      LiteralDossier,
      SymbolDossier,
      TerminalDossier,
      IntentDossier,
      ThreadDossier,
      BufferDossier,
      TurnDossier,
      ActivityDossier,
    ],
    seed: (boot) =>
      boot.use(shard.context.bind("client", client)).use(shard.context.bind("runtime", runtime)),
  });
  await runtime.entities.init();
  runtime.daemon = Object.assign(new Daemon(), {
    id: runtime.manifest.slug,
    slug: runtime.manifest.slug,
    reference: runtime.reference,
    connection: runtime.connection,
    $status: runtime.$status,
    entities: {
      mode: runtime.entities.mode,
      literal: runtime.entities.literal,
      symbol: runtime.entities.symbol,
    },
    $modes: computed(runtime.entities.mode.$entities, (modes) =>
      modes.filter((mode) => mode.daemon === null),
    ),
  });
  await next();
};

export const daemons = async (die, next) => {
  await die.client.runtime.entities.daemon.find();
  await next();
};

export const modes = async (die, next) => {
  const { runtime } = die.client;
  await Promise.allSettled(
    [runtime.daemon, ...runtime.daemons].map((host) => host.entities.mode.find()),
  );
  await next();
};

export const userspace = async (die, next) => {
  const { entities } = die.client.runtime;
  await entities.populate(USERSPACE);
  const offs = USERSPACE.filter((name) => name !== "intent").map((name) =>
    entities[name].subscribe(),
  );
  try {
    await next();
  } finally {
    for (const off of offs) off();
  }
};
