import { control, middleware, steer } from "@vivalence/typology";
import { mode as traits, client } from "../../traits/index.js";

const RETRY = { base: 5000, ceiling: 60000 };
const WIRE = ["CLIENT", "NETWORK", "TIMEOUT"];

const sleep = (ms, signal) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(timer), resolve()), { once: true });
  });

export const lighthouse = (execution) => (die, next) => middleware.compose(execution.carry)(die, next);

const mount = async (die, daemon, execution) => {
  const signal = die.controller.abort.signal;
  for (let attempt = 1; !signal.aborted; attempt++) {
    const controller = die.controller.branch(`daemon/${daemon.slug}`);
    try {
      await steer.dispatch.execute(execution, { ...die, controller, daemon, traits });
      return;
    } catch (error) {
      controller.stdout.fault(error);
      if (!WIRE.includes(error.type)) {
        daemon.$status.set({ code: "ERROR", error });
        return;
      }
      daemon.$status.set({ code: "UNAVAILABLE", error });
      await sleep(Math.min(RETRY.base * 2 ** (attempt - 1), RETRY.ceiling), signal);
    }
  }
};

export const runtime = (execution) => async (die, next) => {
  const { runtime } = die.client;
  runtime.daemon.mounting = mount(die, runtime.daemon, execution);
  await next();
};

export const daemons = (execution) => async (die, next) => {
  for (const daemon of die.client.runtime.daemons) daemon.mounting = mount(die, daemon, execution);
  await next();
};

export const terminals = (execution) => async (die, next) => {
  const held = new Map();
  const reconcile = (rows) => {
    for (const terminal of rows) {
      if (held.has(terminal.id)) continue;
      const controller = die.controller.branch(`terminal/${terminal.id}`);
      held.set(terminal.id, controller);
      steer.dispatch.execute(execution, { ...die, controller, terminal }).catch((error) => controller.stdout.fault(error));
    }
    for (const [id, controller] of held) {
      if (rows.some((terminal) => terminal.id === id)) continue;
      controller.abort.abort("removed");
      held.delete(id);
    }
  };
  const off = die.client.runtime.entities.terminal.$entities.subscribe(reconcile);
  try {
    await next();
  } finally {
    off();
    for (const controller of held.values()) controller.abort.abort("client stopped");
  }
};

export const seat = (execution) => async (die, next) => {
  const { terminals } = die.client;
  let seated = null;
  let release = null;
  const derive = () => {
    const terminal = terminals.active;
    const thread = terminal === null ? null : terminal.thread;
    if (seated === thread) return;
    seated = thread;
    if (release !== null) release();
    release = null;
    if (thread === null) return;
    const controller = die.controller.branch(`thread/${thread.id}`);
    release = () => controller.abort.abort("unseated");
    steer.dispatch.execute(execution, { ...die, controller, thread }).catch((error) => controller.stdout.fault(error));
  };
  let bound = null;
  const rebind = () => {
    if (bound !== null) bound();
    const terminal = terminals.active;
    bound = terminal === null ? null : terminal.$thread.listen(derive);
    derive();
  };
  const off = terminals.$active.listen(rebind);
  rebind();
  try {
    await next();
  } finally {
    off();
    if (bound !== null) bound();
    if (release !== null) release();
  }
};

export const home = async (die, next) => {
  const { runtime, terminals } = die.client;
  const terminal = terminals.entities[0] ?? (await terminals.create({}));
  terminals.activate(terminal);
  const home = client.home.reference(die.client);
  if (terminal.thread === null && home !== null) {
    const host = [runtime.daemon, ...runtime.daemons].find((held) => home.startsWith(`${held.reference.absolute}/`));
    if (host === undefined) throw new Error(`${home}: no host of ${runtime.reference.absolute} owns it`);
    await Promise.race([host.mounted.promise, control.hold(die.controller)]);
    if (!(await die.controller.proceed())) return;
    const mode = host.modes.find((row) => row.reference.absolute === home);
    if (mode === undefined) throw new Error(`${home}: no such mode on ${host.reference.absolute}`);
    await terminal.seat(await runtime.entities.thread.create({ mode: mode.id }));
  }
  await next();
};
