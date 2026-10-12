import { Connection, Dataspace, Path, Url, Vector, belt, fromm, middleware, object, shard, steer, traits } from "@vivalence/typology";
import * as commands from "../commands/index.js";
import * as catalog from "../traits/index.js";
import * as lighthouse from "../../entities/lighthouse/index.js";
import * as mode from "../../entities/mode/index.js";
import * as runtimeHost from "../../entities/runtime/index.js";
import * as daemonHost from "../../entities/daemon/index.js";
import * as terminalProcess from "../../entities/terminal/index.js";
import * as threadProcess from "../../entities/thread/index.js";
import * as activity from "../../entities/activity.js";
import * as buffer from "../../entities/buffer.js";
import * as turn from "../../entities/turn.js";
import { Runtime } from "../../entities/runtime/prototype.js";
import { Lighthouse } from "../../entities/lighthouse/prototype.js";

const INHERITED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];
const carried = (key) => INHERITED.includes(key) || (/^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_/.test(key) && key !== "VIVA_PROCESS_ID");
const HOSTS = { runtime: runtimeHost.lifecycle.execution, daemon: daemonHost.lifecycle.execution };

const specs = (instance) => {
  const mount = instance.home.absolute;
  const repository = instance.paladin.scope.repository.absolute;
  return [
    {
      identity: { process: "runtime", mount },
      serve: instance.runtime.statics.serve.absolute,
      command: {
        bin: Deno.execPath(),
        args: ["run", "-A", "--config", `${repository}/deno.jsonc`, `${repository}/systems/runtime/run.js`],
        cwd: mount,
        env: { ...object.filter(Deno.env.toObject(), carried), VIVA_INSTANCE_MOUNT: mount, VIVA_LEDGER_MOUNT: instance.paladin.scope.ledger.absolute, VIVA_REPOSITORY_MOUNT: repository },
      },
    },
  ];
};

const reached = (remote) => new Connection(remote).call("/status").then(() => true, () => false);

export const verbs = async (clientDie, next) => {
  clientDie.repl.graft(commands.help, commands.quit);
  await next();
};

export const modes = async (clientDie, next) => {
  for (const citizen of clientDie.register.modes)
    (clientDie.modes[citizen.manifest.type] ??= {})[citizen.manifest.slug] = Object.assign(new mode.Mode(citizen), { stdout: clientDie.controller.stdout.branch(citizen.reference.absolute) });
  for (const held of fromm.modes(clientDie.modes).flat)
    await steer.dispatch.execute(mode.lifecycle.execution, { mode: held, client: clientDie, controller: clientDie.controller });
  try {
    await next();
  } finally {
    for (const held of fromm.modes(clientDie.modes).flat) held.stdout.close();
  }
};

export const surface = async (clientDie, next) => {
  clientDie.unmount = await clientDie.surface(clientDie);
  try {
    await next();
  } finally {
    clientDie.unmount();
  }
};

export const runtime = async (clientDie, next) => {
  const remote = new Url(clientDie.instance.runtime.statics.remote);
  if (!(await reached(remote))) {
    const held = await clientDie.instance.paladin.ledger.instances.lookup(clientDie.instance.home.absolute);
    if (held === null) throw new Error(`runtime ${remote.absolute} unreachable, and ${clientDie.instance.home.absolute} is no instance of this ledger — not this machine's to start`);
    clientDie.controller.stdout.message({ booting: held.slug, log: clientDie.instance.paladin.scope.ledger.branch(`logs/${held.slug}/runtime.out.log`).absolute });
    clientDie.booted = await clientDie.instance.paladin.ledger.boot(specs(clientDie.instance), { instance: held.slug, attachment: "logged" });
    await clientDie.booted.integrate();
  }
  try {
    await next();
  } finally {
    if (clientDie.booted !== null) await clientDie.booted.disintegrate();
  }
};

export const connection = async (clientDie, next) => {
  clientDie.runtime = new Runtime({ remote: new Url(clientDie.instance.runtime.statics.remote) });
  clientDie.runtime.lighthouse = Object.assign(new Lighthouse(), { stdout: clientDie.controller.stdout.branch("lighthouse") });
  const multiplex = shard.transmitter.multiplex({ authority: clientDie.runtime.lighthouse.$authority });
  clientDie.runtime.connection = new Connection(clientDie.runtime.remote, shard.transmitter.retry(multiplex, { maxRetries: 2 }))
    .use(shard.track.request())
    .use(shard.track.fault())
    .use(shard.connection.authorize(clientDie.runtime.lighthouse.$authority))
    .use(shard.connection.timeout(8000));
  clientDie.runtime.lighthouse.connection = clientDie.runtime.connection;
  clientDie.runtime.lighthouse.manifest = await clientDie.runtime.connection.call("/lighthouse/metadata");
  clientDie.controller.stdout.message({ lighthouse: clientDie.runtime.remote.absolute, traits: clientDie.runtime.lighthouse.manifest.traits });
  try {
    await next();
  } finally {
    multiplex.close();
  }
};

export const authorized = (clientDie, next) =>
  middleware.compose(lighthouse.lifecycle.execution.carry)({ client: clientDie, controller: clientDie.controller }, next);

export const dataspace = async (clientDie, next) => {
  clientDie.runtime.manifest = await clientDie.runtime.connection.call("/metadata/manifest");
  clientDie.runtime.reference = new Path(`/runtime/${clientDie.runtime.manifest.slug}`);
  clientDie.runtime.aperture = clientDie.runtime.connection.branch(clientDie.runtime.reference.absolute);
  clientDie.runtime.entities = new Dataspace({
    runtime: clientDie.runtime,
    entities: { activity, buffer, daemon: daemonHost, mode, terminal: terminalProcess, thread: threadProcess, turn },
    seed: (boot) => boot.use(shard.context.bind("client", clientDie)).use(shard.context.bind("runtime", clientDie.runtime)),
  });
  await clientDie.runtime.entities.init();
  clientDie.controller.stdout.message({ runtime: clientDie.runtime.reference.absolute });
  await next();
};

export const rows = async (clientDie, next) => {
  await clientDie.runtime.entities.daemon.find();
  await clientDie.runtime.entities.thread.find();
  await clientDie.runtime.entities.buffer.find();
  await clientDie.runtime.entities.turn.find();
  await clientDie.runtime.entities.activity.find();
  await clientDie.runtime.entities.terminal.find();
  const offs = [
    clientDie.runtime.entities.thread.subscribe(),
    clientDie.runtime.entities.buffer.subscribe(),
    clientDie.runtime.entities.turn.subscribe(),
    clientDie.runtime.entities.activity.subscribe(),
    clientDie.runtime.entities.terminal.subscribe(),
  ];
  try {
    await next();
  } finally {
    for (const off of offs) off();
  }
};

export const hosts = async (clientDie, next) => {
  for (const held of [clientDie.runtime, ...clientDie.runtime.entities.daemon.$entities.get()])
    steer.dispatch.execute(HOSTS[held.type], { client: clientDie, [held.type]: held, controller: clientDie.controller.branch(held.reference.absolute) }).catch((error) => held.$status.set({ code: "ERROR", error }));
  await next();
};

export const terminals = async (clientDie, next) => {
  const held = new Map();
  const reconcile = (rows) => {
    for (const row of rows) {
      if (held.has(row.id)) continue;
      row.controller = clientDie.controller.branch(`terminal/${row.id}`);
      held.set(row.id, row.controller);
      steer.dispatch.execute(terminalProcess.lifecycle.execution, { client: clientDie, controller: row.controller, terminal: row }).catch((error) => row.controller.stdout.fault(error));
    }
    for (const [id, controller] of held) {
      if (rows.some((row) => row.id === id)) continue;
      controller.abort.abort("removed");
      held.delete(id);
    }
  };
  const off = clientDie.runtime.entities.terminal.$entities.subscribe(reconcile);
  try {
    await next();
  } finally {
    off();
    for (const controller of held.values()) controller.abort.abort("client stopped");
  }
};

export const staggered = async (clientDie, next) => {
  for (const finalize of await traits.stagger(clientDie.mask, clientDie, catalog)) await finalize();
  try {
    await next();
  } finally {
    if ("terminators" in clientDie.mask) for (const terminate of clientDie.mask.terminators.reverse()) await terminate();
  }
};

export const thread = async (clientDie, next) => {
  let current = null;
  let release = null;
  const derive = () => {
    const active = clientDie.$active.get();
    const row = active === null ? null : active.thread;
    if (current === row) return;
    current = row;
    if (release !== null) release();
    release = null;
    if (row === null) return;
    row.controller = active.controller.branch(`thread/${row.id}`);
    release = () => row.controller.abort.abort("thread unset");
    steer.dispatch.execute(threadProcess.lifecycle.execution, { client: clientDie, controller: row.controller, thread: row }).catch((error) => row.controller.stdout.fault(error));
  };
  let bound = null;
  const rebind = () => {
    if (bound !== null) bound();
    const active = clientDie.$active.get();
    bound = active === null ? null : active.$thread.listen(derive);
    derive();
  };
  const off = clientDie.$active.listen(rebind);
  rebind();
  try {
    await next();
  } finally {
    off();
    if (bound !== null) bound();
    if (release !== null) release();
  }
};

export const active = async (clientDie, next) => {
  const rows = clientDie.runtime.entities.terminal.$entities.get();
  clientDie.$active.set(rows.length === 0 ? await clientDie.runtime.entities.terminal.create({}) : rows[0]);
  await next();
};

export const execution = new Vector()
  .use(shard.controller.open)
  .use(verbs)
  .use(modes)
  .use(surface)
  .use(runtime)
  .use(connection)
  .use(authorized)
  .use(dataspace)
  .use(rows)
  .use(hosts)
  .use(terminals)
  .use(staggered)
  .use(thread)
  .use(active)
  .do(shard.controller.hold);
