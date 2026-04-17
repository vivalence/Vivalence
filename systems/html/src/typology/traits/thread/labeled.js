import { is } from "@vivalence/typology";

export const LABELED = (thread, ctx) => {
  if (!is.labeled(thread.label) && is.labeled(thread.trait.LABELED)) {
    thread.label = thread.trait.LABELED;
  }
  if (!is.labeled(thread.label) && thread.intent) {
    thread.label = {
      name: thread.intent.name ?? thread.intent.slug,
      description: thread.intent.description ?? thread.mode?.name ?? null,
    };
  }
  if (!is.labeled(thread.label) && thread.mode) {
    thread.label = {
      name: thread.mode.name ?? thread.mode.slug,
      description: thread.mode.description ?? null,
    };
  }
};
