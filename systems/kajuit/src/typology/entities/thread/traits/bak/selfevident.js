export const SELFEVIDENT = (thread, ctx) => {
  console.log("SELFEVIDENT thread.mode.id", thread.mode.id);

  if (thread.$buffer.get()) return;

  const modeId = thread.mode?.id ?? thread.mode;
  const mode = ctx.daemon.entities.mode.$entities.get().find((m) => m.id === modeId);

  const buffer = Buffer.from(mode.buffer(), mode.buffered);
  buffer.status = "ACTIVE";
  thread.$buffer.set(buffer);
  //
};
