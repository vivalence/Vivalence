import { is, object } from "@vivalence/typology";

export const pull = async (thread, entities, args = {}) => {
  const emission = await thread.mode.connection.call(
    thread.trait.AIMED.mount,
    object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
  );
  const buffers = emission?.output?.buffer ?? [];
  return Promise.all(buffers.map((pojo) => entities.buffer.merge(pojo)));
};

export const valid = (thread) =>
  !thread.trait.AIMED?.mount
    ? "AIMED has no mount"
    : !is.object(thread.mode) || !Object.keys(thread.mode.metadata.emitter?.branches ?? {}).length
      ? "AIMED mount resolves to no emitter"
      : null;
