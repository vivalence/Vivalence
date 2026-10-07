import { fromm, Mode, steer } from "@vivalence/typology";

export const HOST = ["type", "slug", "reference", "attach", "controller", "aperture", "entities", "datamap", "twitch", "cortex", "modes", "services", "domain"];

export const host = (bearer) => {
  const missing = HOST.filter((word) => !(word in bearer));
  if (missing.length) throw new Error(`host ${bearer.slug} lacks ${missing.join(" ")}`);
  return bearer;
};

export const seat = (bearer, masks) => {
  for (const mask of masks) {
    (bearer.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = Object.assign(new Mode(mask), { stdout: bearer.controller.stdout.branch(mask.reference.absolute) });
  }
  return bearer;
};

export const resolve = async (bearer, execution, traits) => {
  for (const mode of fromm.modes(bearer.modes).flat) {
    await steer.dispatch.execute(execution, { mask: mode.module, mode, host: bearer, traits });
  }
  await bearer.datamap.shard.scope(() => Promise.all(fromm.modes(bearer.modes).flat.flatMap((mode) => mode.finalizers).map((finalize) => finalize())));
  for (const mode of fromm.modes(bearer.modes).flat) {
    bearer.aperture.branch(mode.reference.nature, mode.aperture);
  }
};

export const release = async (bearer) => {
  for (const mode of fromm.modes(bearer.modes).flat) {
    for (const terminate of mode.terminators ?? []) await terminate();
    mode.stdout.close();
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

export const prune = async (bearer) => {
  await bearer.datamap.shard.scope(async () => {
    const modes = fromm.modes(bearer.modes).flat;
    const installed = new Set(modes.map((mode) => typeSlug(mode.manifest)));
    orphans(bearer.entities.em, await bearer.entities.mode.find({}), installed, typeSlug, "mode");
    await bearer.entities.em.flush();
    for (const mode of modes) {
      const slugs = new Set((mode.module.dataset?.intent ?? []).map((intent) => intent.slug));
      orphans(bearer.entities.em, await bearer.entities.intent.find({ mode: mode.entity.id }, { filters: false }), slugs, (intent) => intent.slug, "intent");
    }
    await bearer.entities.em.flush();
  });
};
