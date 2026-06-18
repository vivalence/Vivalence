import { object } from "@vivalence/typology";

export const AIMED = (thread, ctx) => {
  thread.pull = (args = {}) =>
    thread.mode.connection.call(
      thread.trait.AIMED.mount,
      object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
    );
};
