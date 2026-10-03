export const bufferName = (buffer) => buffer.label?.name ?? `buffer ${buffer.index ?? 0}`;

export async function clear(terminal, thread) {
  await thread.daemon.entities.buffer.remove({ thread: thread.id });
  terminal?.$buffer.set(null);
}
