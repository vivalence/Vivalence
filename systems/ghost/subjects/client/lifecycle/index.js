import { Vector, fromm, middleware, monad, shard, traits } from "@vivalence/typology";
import * as catalog from "../traits/index.js";
import * as lighthouse from "../../../entities/lighthouse/index.js";
import * as mode from "../../../entities/mode/index.js";
import * as runtimeHost from "../../../entities/runtime/index.js";
import * as daemonHost from "../../../entities/daemon/index.js";

const HOSTS = { runtime: runtimeHost.factory, daemon: daemonHost.factory };

export const modes = async (clientDie, next) => {
  for (const citizen of clientDie.register.modes)
    (clientDie.modes[citizen.manifest.type] ??= {})[citizen.manifest.slug] = Object.assign(new mode.Mode(citizen), { stdout: clientDie.controller.stdout.branch(citizen.reference.absolute) });
  for (const held of fromm.modes(clientDie.modes).flat)
    await mode.factory(held)(clientDie);
  try {
    await next();
  } finally {
    for (const held of fromm.modes(clientDie.modes).flat) held.stdout.stop();
  }
};

export const connection = async (clientDie, next) => {
  try {
    await next();
  } finally {
    clientDie.runtime.multiplex.close();
  }
};

export const authorized = (clientDie, next) =>
  middleware.compose(lighthouse.lifecycle.execution.carry)({ client: clientDie, controller: clientDie.controller }, next);

export const dataspace = async (clientDie, next) => {
  await clientDie.runtime.entities.init();
  clientDie.controller.stdout.log({ runtime: clientDie.runtime.reference.absolute });
  await next();
};

export const subscribed = async (clientDie, next) => {
  let off = await clientDie.runtime.entities.subscribe();
  let reader = clientDie.runtime.lighthouse.user.slug;
  const unlisten = clientDie.runtime.lighthouse.$user.listen(async (user) => {
    if (user === null || user.slug === reader) return;
    reader = user.slug;
    off();
    for (const [name, repository] of Object.entries(clientDie.runtime.entities.em.repositoryMap))
      for (const entity of repository.$entities.get()) clientDie.runtime.entities.em.drop(name, entity.id);
    off = await clientDie.runtime.entities.subscribe();
  });
  try {
    await next();
  } finally {
    unlisten();
    off();
  }
};

export const hosts = async (clientDie, next) => {
  await monad.traverse([clientDie.runtime, ...clientDie.runtime.entities.daemon.$entities.get()], (held) => HOSTS[held.type](held)(clientDie));
  await next();
};

export const terminals = async (clientDie, next) => {
  const held = new Map();
  const reconcile = (terminals) => {
    for (const terminal of terminals) if (!held.has(terminal.id)) held.set(terminal.id, terminal.stall.watch());
    for (const [id, unwatch] of held) {
      if (terminals.some((terminal) => terminal.id === id)) continue;
      unwatch();
      held.delete(id);
    }
  };
  const off = clientDie.runtime.entities.terminal.$entities.subscribe(reconcile);
  try {
    await next();
  } finally {
    off();
    for (const unwatch of held.values()) unwatch();
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

export const execution = new Vector()
  .use(shard.controller.open)
  .use(modes)
  .use(connection)
  .use(authorized)
  .use(dataspace)
  .use(subscribed)
  .use(hosts)
  .use(terminals)
  .use(staggered)
  .do(shard.controller.hold);
