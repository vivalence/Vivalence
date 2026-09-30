import { Url, Connection, shard, shape } from "@vivalence/typology";

export const call = async (die, next) => {
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(shape.http(die.daemon.aperture)));
  await next();
};

export const prune = async (die, next) => {
  const typeSlug = (item) => `${item.type}:${item.slug}`;

  async function removeOrphans(em, rows, keep, keyOf, label) {
    for (const row of rows) {
      if (keep.has(keyOf(row))) continue;
      em.remove(row);
      console.log(`pruned ${label}:`, row.slug);
    }
  }

  await die.daemon.datamap.shard.scope(async () => {
    const modes = die.daemon.flatmodes();

    const installed = new Set(modes.map((mode) => typeSlug(mode.manifest)));
    await removeOrphans(die.daemon.entities.em, await die.daemon.entities.mode.find(), installed, typeSlug, "mode");
    await die.daemon.entities.em.flush();

    for (const m of modes) {
      const slugs = new Set((m.module.dataset?.intent ?? []).map((i) => i.slug));
      await removeOrphans(die.daemon.entities.em, await die.daemon.entities.intent.find({ mode: m.entity.id }, { filters: false }), slugs, (i) => i.slug, "intent");
    }
    await die.daemon.entities.em.flush();
  });
  await next();
};
