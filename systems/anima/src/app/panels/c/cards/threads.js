export const named = (thread) => (typeof thread.label === "object" ? thread.label?.name : thread.label) ?? thread.mode?.slug ?? thread.id.slice(0, 8);

export const healthy = (daemons) => daemons.filter((daemon) => daemon.status.is("healthy"));

export const pickDaemon = (held, chosen, active) => held.find((daemon) => daemon.slug === chosen) ?? held.find((daemon) => daemon === active?.daemon) ?? held[0] ?? null;

export async function seat(terminals, thread) {
  const terminal = terminals.active ?? (await terminals.create());
  await terminal.seat(thread);
  return terminal;
}

export async function mint(terminals, daemon, mode) {
  const thread = await daemon.entities.thread.create({ mode: mode.id });
  daemon.entities.thread.resolve?.(thread);
  return seat(terminals, thread);
}

export async function remode(thread, mode) {
  const previous = thread.mode;
  const label = typeof thread.label === "object" ? thread.label?.name : thread.label;
  const wasDefault = label === previous?.name || label === previous?.slug;
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { mode: mode.id });
  thread.mode = mode;
  if (!wasDefault) return null;
  const name = mode.name ?? mode.slug;
  thread.label = { ...(typeof thread.label === "object" ? thread.label : {}), name };
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait: { ...thread.trait, LABELED: { ...(thread.trait?.LABELED ?? {}), name } } });
  return null;
}

export async function pickMode(terminals, daemon, mode) {
  const current = terminals.active?.$thread.get();
  if (current && current.daemon?.slug === daemon.slug) return remode(current, mode);
  return mint(terminals, daemon, mode);
}

export async function rename(thread, name) {
  const next = name.trim();
  if (!next || next === named(thread)) return;
  thread.label = { ...(typeof thread.label === "object" ? thread.label : {}), name: next };
  await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait: { ...thread.trait, LABELED: { ...(thread.trait?.LABELED ?? {}), name: next } } });
}

export const drop = (thread) => thread.daemon.entities.thread.removeOne({ id: thread.id });
