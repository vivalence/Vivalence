import { shape, shard } from "@vivalence/typology";

export async function metadata(die) {
  const root = die.good.aperture.branch("/metadata");

  root.open("/manifest", () => die.manifest);
  root.open("/statics", () => die.good.statics ?? {});
  root.open("/cargo", () => die.good.cargo);
  root.open("/datamap", () => shard.datamap.strip(die.datamap.introspect()));
  root.open("/aperture", () => shape.strip(die.good.aperture));

  root.open("/cortex", () => (die.good.cortex ? shape.cortex.strip(die.good.cortex) : []));
  root.open("/modes", () =>
    die.good.flatmodes().map((mode) => ({
      type: mode.type,
      slug: mode.slug,
      name: mode.manifest.name ?? mode.slug,
      traits: mode.traits,
      metadata: `${die.good.mount.nature}/mode/${mode.type}/${mode.slug}/metadata`,
    })),
  );

  for (const mode of die.good.flatmodes()) {
    const meta = die.good.aperture.branch(mode.mount.nature).branch("/metadata");

    meta.open("/manifest", () => mode.manifest);
    meta.open("/aperture", () => shape.strip(mode.aperture));
    if (mode.statics) meta.open("/statics", () => mode.statics);

    if (mode.implements("APPLICATION"))
      meta.open("/app", () => ({
        url: die.good.attach.branch("/bundle").branch(mode.mount.absolute).absolute,
        view: mode.app.view.json,
        schema: mode.app.schema ?? null,
      }));

    if (mode.implements("EMITTER")) meta.open("/emitter", () => shape.strip(mode.module.emitter));

    // if (mode.implements("TOOLED")) meta.open("/tools", () => someMetadataStripOfModuleTools());

    if (mode.implements("FRAUGHT")) meta.open("/freight", () => mode.freight.catalog);

    if (mode.implements("HARNESSED")) {
      meta.open("/harness", () => shape.strip(mode.aperture.branch("/harness")));
    }
  }
}
