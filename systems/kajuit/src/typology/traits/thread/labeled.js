import { is } from "@vivalence/typology";

function shape(thread, value) {
  if (typeof value === "string") value = { name: value };
  return {
    name:
      value?.name ??
      (thread.mode && `${thread.mode.type}/${thread.mode.name ?? thread.mode.slug}`) ??
      ".unnamed",
    description: value?.description ?? null,
    flags: value?.flags ?? [],
  };
}

export const LABELED = (thread, ctx) => {
  let raw = thread.label;
  if (!is.labeled(raw) && is.labeled(thread.trait.LABELED)) raw = thread.trait.LABELED;
  if (!is.labeled(raw) && thread.intent) {
    raw = {
      name: thread.intent.name ?? thread.intent.slug,
      description: thread.intent.description ?? thread.mode?.name ?? null,
    };
  }
  if (!is.labeled(raw) && thread.mode) {
    raw = {
      name: thread.mode.name ?? thread.mode.slug,
      description: thread.mode.description ?? null,
    };
  }
  thread.label = shape(thread, raw);
};
