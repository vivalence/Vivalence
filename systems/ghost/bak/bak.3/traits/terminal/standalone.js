export const open = async (terminal, mode) => {
  const { thread } = terminal;
  const kept = thread.$buffers
    .get()
    .filter((buffer) => buffer.mode === mode)
    .sort((first, second) => first.index - second.index)
    .at(-1);
  const buffer = kept ?? (await mode.runtime.entities.buffer.create({ mode: mode.id, thread: thread.id, data: {} }));
  if (terminal.thread === thread) terminal.$buffer.set(buffer);
};
