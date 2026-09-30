import paladin from "@vivalence/paladin";
import { shape, shard } from "@vivalence/typology";

export const metadata = async (die, next) => {
  const root = die.daemon.aperture.branch("/metadata");

  root.open("/manifest", () => die.daemon.manifest);
  root.open("/statics", () => die.daemon.statics ?? {});
  root.open("/cargo", () => die.daemon.cargo);
  root.open("/datamap", () => shard.datamap.strip(die.daemon.datamap.getMetadata()));
  root.open("/aperture", () => shape.strip(die.daemon.aperture));

  root.open("/cortex", () => (die.daemon.cortex ? shape.cortex.strip(die.daemon.cortex) : []));
  root.open("/modes", () =>
    die.daemon.flatmodes().map((mode) => ({
      type: mode.manifest.type,
      slug: mode.manifest.slug,
      name: mode.manifest.name ?? mode.manifest.slug,
      traits: mode.manifest.traits,
      metadata: `${die.daemon.reference.nature}/mode/${mode.manifest.type}/${mode.manifest.slug}/metadata`,
    })),
  );

  for (const mode of die.daemon.flatmodes()) {
    const meta = die.daemon.aperture.branch(mode.reference.nature).branch("/metadata");

    meta.open("/manifest", () => mode.manifest);
    meta.open("/aperture", () => shape.strip(mode.aperture));
    if (mode.statics) meta.open("/statics", () => mode.statics);
    if (mode.mountpoint) meta.open("/mountpoint", () => mode.mountpoint.absolute);

    if (mode.implements("APPLICATION"))
      meta.open("/application", async () => {
        if (paladin.is.dev) await mode.application.compile();
        return {
          url: die.daemon.attach.branch("/bundle").branch(die.daemon.reference.absolute).branch(mode.reference.absolute).absolute,
          view: mode.application.view.json,
          schema: mode.application.schema ?? null,
        };
      });

    if (mode.implements("EMITTER")) meta.open("/emitter", () => shape.strip(mode.module.emitter));

    if (mode.implements("FRAUGHT") || mode.implements("MOUNTED")) meta.open("/freight", () => mode.freight.catalog);

    if (mode.implements("HARNESSED")) {
      meta.open("/harness", () => shape.strip(mode.aperture.branch("/harness")));
    }
  }
  await next();
};
