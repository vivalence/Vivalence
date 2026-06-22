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

// convoluted and stupid.
function isLabeled(thing) {
  return is.object(thing) && is.string(thing.name);
}

// LABELED is a one-shot normalization: derive a display label from the thread's own data
// (explicit label → trait config → intent → mode). Called once at resolve by the dossier —
// not installed, not reactive; the label is set, not watched.
export const label = (thread) => {
  let raw = thread.label;
  if (!isLabeled(raw) && isLabeled(thread.trait.LABELED)) raw = thread.trait.LABELED;
  if (!isLabeled(raw) && thread.intent) {
    raw = {
      name: thread.intent.name ?? thread.intent.slug,
      description: thread.intent.description ?? thread.mode?.name ?? null,
    };
  }
  if (!isLabeled(raw) && thread.mode) {
    raw = {
      name: thread.mode.name ?? thread.mode.slug,
      description: thread.mode.description ?? null,
    };
  }
  thread.label = shape(thread, raw);
};
