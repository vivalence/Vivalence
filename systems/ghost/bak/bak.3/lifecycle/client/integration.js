import { control } from "@vivalence/typology";
import { dock } from "../../gestalten/belt/index.js";

const shown = (client, terminal) => {
  if (!client.runtime.lighthouse.isAuthorized) return ["crown", "signin"];
  if (client.runtime.entities === null) return ["crown"];
  if (terminal === null || terminal.thread === null) return ["crown", "navigation", "dock"];
  return ["crown", "navigation", "dock", ...(terminal.buffer === null ? [] : ["frame"])];
};

const panes = (die) => {
  const { client, surface } = die;
  const mounted = new Map();
  const place = (list, layout) => {
    for (const pane of list) {
      if (!mounted.has(pane)) mounted.set(pane, surface.mount[pane](client));
      mounted.get(pane).place(layout);
    }
    for (const [pane, held] of mounted) {
      if (list.includes(pane)) continue;
      held.destroy();
      mounted.delete(pane);
    }
  };
  const arrange = () => {
    const terminal = client.terminals.active;
    const held = client.dock;
    const buffer = terminal !== null && terminal.buffer !== null;
    const list = shown(client, terminal);
    place(list, { dock: { ...dock.resolve(held, surface.viewport()), full: held.full, collapsed: held.collapsed }, buffer, panes: list });
  };
  const destroy = () => {
    for (const held of mounted.values()) held.destroy();
    mounted.clear();
  };
  return { arrange, destroy };
};

export const cover = async (die, next) => {
  die.panes = panes(die);
  const off = die.client.runtime.lighthouse.$isAuthorized.listen(die.panes.arrange);
  die.panes.arrange();
  try {
    await next();
  } finally {
    off();
    die.panes.destroy();
  }
};

export const surface = async (die, next) => {
  const { client, panes } = die;
  let unbind = null;
  const rebind = () => {
    if (unbind !== null) unbind();
    const terminal = client.terminals.active;
    const offs = terminal === null ? [] : [terminal.$thread.listen(panes.arrange), terminal.$buffer.listen(panes.arrange)];
    unbind = () => offs.forEach((off) => off());
    panes.arrange();
  };
  const offs = [client.$dock.listen(panes.arrange), client.terminals.$active.listen(rebind)];
  rebind();
  try {
    await next();
  } finally {
    for (const off of offs) off();
    if (unbind !== null) unbind();
  }
};

export const keys = async (die, next) => {
  const reading = (async () => {
    for await (const input of die.surface.keys) await die.client.dispatch(input);
    if (die.controller.status.is("RUNNING")) die.controller.kill("SIGTERM", "eof");
  })();
  await next();
  await Promise.race([reading, control.hold(die.controller)]);
};
