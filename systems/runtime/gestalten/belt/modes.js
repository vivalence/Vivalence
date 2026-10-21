import { fromm } from "@vivalence/typology";

export const resolve = async (context, factory, traits) => {
  for (const mode of fromm.modes(context.modes).flat) {
    await factory(mode)({ context, traits });
  }
  await context.datamap.shard.scope(() => Promise.all(fromm.modes(context.modes).flat.flatMap((mode) => mode.finalizers).map((finalize) => finalize())));
  for (const mode of fromm.modes(context.modes).flat) {
    context.aperture.branch(mode.reference.nature, mode.aperture);
  }
};

export const release = async (context) => {
  for (const mode of fromm.modes(context.modes).flat) {
    for (const terminate of mode.terminators ?? []) await terminate();
    mode.stdout.stop();
  }
};

const typeSlug = (item) => `${item.type}:${item.slug}`;

const orphans = (em, rows, keep, keyOf, label) => {
  for (const row of rows) {
    if (keep.has(keyOf(row))) continue;
    em.remove(row);
    console.log(`pruned ${label}:`, row.slug);
  }
};

export const prune = async (context) => {
  await context.datamap.shard.scope(async () => {
    const modes = fromm.modes(context.modes).flat;
    const installed = new Set(modes.map((mode) => typeSlug(mode.manifest)));
    orphans(context.entities.em, await context.entities.mode.find({}), installed, typeSlug, "mode");
    await context.entities.em.flush();
    for (const mode of modes) {
      const slugs = new Set((mode.module.dataset?.intent ?? []).map((intent) => intent.slug));
      orphans(context.entities.em, await context.entities.intent.find({ mode: mode.entity.id }, { filters: false }), slugs, (intent) => intent.slug, "intent");
    }
    await context.entities.em.flush();
  });
};
