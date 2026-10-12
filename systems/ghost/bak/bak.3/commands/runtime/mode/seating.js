export async function seating(ctx, mode) {
  const reference = mode.reference.absolute;
  const held = ctx.runtime.entities.thread.$entities
    .get()
    .filter((thread) => thread.mode !== null && thread.mode.reference.absolute === reference)
    .sort((left, right) => String(right.id).localeCompare(String(left.id)));
  const row = ctx.runtime.entities.mode.$entities.get().find((entity) => entity.reference.absolute === reference);
  if (held.length === 0 && row === undefined) throw new Error(`${reference}: no mode entity to open a thread on`);
  const thread = held.length > 0 ? held[0] : await ctx.runtime.entities.thread.create({ mode: row.id });
  await ctx.terminal.seat(thread);
  return thread;
}
