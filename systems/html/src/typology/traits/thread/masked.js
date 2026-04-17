export const MASKED = (thread, ctx) => {
  thread.mask = { thread: thread.id, ...(thread.trait.MASKED ?? {}) };
};
