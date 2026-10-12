import { is } from "@vivalence/typology";

const named = (thing) => is.object(thing) && is.string(thing.name);

const resolved = (thread) => (is.object(thread.mode) ? thread.mode : null);

const shape = (thread, value) => ({
  name: value?.name ?? (resolved(thread) && `${resolved(thread).type}/${resolved(thread).name ?? resolved(thread).slug}`) ?? ".unnamed",
  description: value?.description ?? null,
  flags: value?.flags ?? [],
});

const sources = [
  (thread) => thread.trait.LABELED,
  (thread) =>
    thread.intent && {
      name: thread.intent.name ?? thread.intent.slug,
      description: thread.intent.description ?? resolved(thread)?.name ?? null,
    },
  (thread) => resolved(thread) && { name: resolved(thread).name ?? resolved(thread).slug, description: resolved(thread).description ?? null },
];

export const label = (thread) => {
  const found = sources.map((source) => source(thread)).find(named);
  thread.label = shape(thread, found);
};
