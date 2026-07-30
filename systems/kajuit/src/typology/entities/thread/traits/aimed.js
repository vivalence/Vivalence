import { object } from "@vivalence/typology";

// AIMED points a thread at an emitter. Its capabilities are FREE functions over the thread,
// not methods stamped onto it: nothing to install, nothing to go stale — every call reads
// live config. The thread's `trait.AIMED.mount` + `trait.MASKED` shape each fetch.

// fetch buffers from the AIMED mount. pure over (thread, args); reads the live mount + mask.
export const pull = async (thread, args = {}) => {
  const emission = await thread.mode.connection.call(
    thread.trait.AIMED.mount,
    object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
  );
  const buffers = emission?.entities?.buffer ?? [];
  return Promise.all(buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)));
};

// the composition rule: a mount must be declared AND resolve to a real emitter leaf. A phase
// that fetches (continuous) folds this; the violation string is what the integrity face shows.
export const valid = (thread) =>
  !thread.trait?.AIMED?.mount
    ? "AIMED has no mount"
    : !Object.keys(thread.mode?.emitter?.branches ?? {}).length
      ? "AIMED mount resolves to no emitter"
      : null;
