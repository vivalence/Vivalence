export const AIMED = (thread, ctx) => {
  return () => {
    thread.pull = thread.mode.connection.aim(thread.trait.AIMED.mount, thread.mask);
  };
};
