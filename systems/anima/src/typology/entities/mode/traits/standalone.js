export const open = async (terminal, mode) => {
  const thread = terminal.thread;
  const kept = thread.$buffers
    .get()
    .filter((buffer) => (buffer.mode?.id ?? buffer.mode) === mode.id)
    .sort((first, second) => (first.index ?? 0) - (second.index ?? 0))
    .at(-1);
  const buffer = kept ?? (await thread.daemon.entities.buffer.create({ mode: mode.id, thread: thread.id, data: {} }));
  if (terminal.thread === thread) terminal.buffer = buffer;
};
