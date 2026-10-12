import { belt, is, v } from "@vivalence/typology";

const SETTLED = ["HEALTHY", "ERROR"];

export const HOME = (mask, clientDie) => {
  const seat = async (terminal) => {
    const user = v.user.trait(clientDie.runtime.lighthouse.user, "HOME");
    const home = is.string(user.reference) ? user.reference : mask.trait.HOME.reference;
    const owner = [clientDie.runtime, ...clientDie.runtime.entities.daemon.$entities.get()].find((held) => home.startsWith(`${held.reference.absolute}/`));
    if (owner === undefined) throw new Error(`${home}: no host of ${clientDie.runtime.reference.absolute} owns it`);
    const status = await belt.atom.until(owner.$status, (held) => SETTLED.includes(held.code), clientDie.controller.abort.signal);
    if (status.code === "ERROR") throw status.error;
    const mode = owner.modes.find((held) => held.reference.absolute === home);
    if (mode === undefined) throw new Error(`${home}: no such mode on ${owner.reference.absolute}`);
    const thread = await clientDie.runtime.entities.thread.create({ mode: mode.id });
    await terminal.setThread(thread);
    terminal.controller.stdout.message({ home, thread: thread.id });
  };
  const seated = new Set();
  const off = clientDie.runtime.entities.terminal.$entities.subscribe((rows) => {
    for (const row of rows) {
      if (row.thread !== null || seated.has(row.id)) continue;
      seated.add(row.id);
      seat(row).catch((error) => row.controller.stdout.fault(error));
    }
  });
  return { terminate: off };
};
