import paladin from "@vivalence/paladin";
import { cortex, fromm, shape, shard } from "@vivalence/typology";

const listed = (bearer) => (mode) => ({
  type: mode.manifest.type,
  slug: mode.manifest.slug,
  name: mode.manifest.name ?? mode.manifest.slug,
  traits: mode.manifest.traits,
  reference: `${bearer.reference.nature}${mode.reference.nature}`,
  metadata: `${bearer.reference.nature}${mode.reference.nature}/metadata`,
});

export const metadata = async (die, next) => {
  const root = die.host.aperture.branch("/metadata");

  root.open("/manifest", () => die.host.manifest);
  root.open("/statics", () => die.host.statics ?? {});
  root.open("/cargo", () => die.host.cargo);
  root.open("/datamap", () => shard.datamap.strip(die.host.datamap.getMetadata()));
  root.open("/aperture", () => shape.strip(die.host.aperture));

  root.open("/cortex", () => (die.host.cortex ? cortex.strip(die.host.cortex) : []));
  root.open("/modes", () => fromm.modes(die.host.modes).flat.map(listed(die.host)));

  for (const mode of fromm.modes(die.host.modes).flat) {
    const meta = die.host.aperture.branch(mode.reference.nature).branch("/metadata");

    meta.open("/aperture", () => shape.strip(mode.aperture));
    if (mode.statics) meta.open("/statics", () => mode.statics);
    if (mode.mountpoint) meta.open("/mountpoint", () => mode.mountpoint.absolute);

    if (mode.implements("APPLICATION"))
      meta.open("/application", async () => {
        if (paladin.is.dev) await mode.application.compile();
        return {
          url: die.host.attach.branch("/bundle").branch(die.host.reference.absolute).branch(mode.reference.absolute).absolute,
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
