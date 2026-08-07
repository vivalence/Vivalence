import { Url, Connection, shard, shape } from "@vivalence/typology";

export async function call(die) {
  const handler = shape.http(die.good.aperture);
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(handler));
}

export async function prune(daemonDie) {
  const typeSlug = (item) => `${item.type}:${item.slug}`;

  async function removeOrphans(em, rows, keep, keyOf, label) {
    for (const row of rows) {
      if (keep.has(keyOf(row))) continue;
      em.remove(row);
      console.log(`pruned ${label}:`, row.slug);
    }
  }

  await daemonDie.datamap.shard.context(async () => {
    const { em, mode, intent, literal } = daemonDie.good.entities;
    const modes = daemonDie.good.flatmodes();

    // mode in db but not config → uninstall
    const installed = new Set(modes.map((m) => typeSlug(m.manifest)));
    await removeOrphans(em, await mode.find(), installed, typeSlug, "mode");
    await em.flush();

    // intent dropped from a still-installed mode's config
    for (const m of modes) {
      const slugs = new Set((m.module.dataset?.intent ?? []).map((i) => i.slug));
      await removeOrphans(
        em,
        await intent.find({ mode: m.entity.id }, { filters: false }),
        slugs,
        (i) => i.slug,
        "intent",
      );
    }
    await em.flush();
  });
}
