import paladin from "@vivalence/paladin";
import { cortex as faculties, fromm, shape, shard } from "@vivalence/typology";

const listed = (context) => (mode) => ({
  type: mode.manifest.type,
  slug: mode.manifest.slug,
  name: mode.manifest.name ?? mode.manifest.slug,
  traits: mode.manifest.traits,
  reference: `${context.reference.nature}${mode.reference.nature}`,
  metadata: `${context.reference.nature}${mode.reference.nature}/metadata`,
});

export const metadata = (context) => {
  const root = context.aperture.branch("/metadata");

  root.open("/manifest", () => context.manifest);
  root.open("/statics", () => context.statics ?? {});
  root.open("/cargo", () => context.cargo);
  root.open("/datamap", () => shard.datamap.strip(context.datamap.getMetadata()));
  root.open("/aperture", () => shape.strip(context.aperture));

  root.open("/cortex", () => (context.cortex ? faculties.strip(context.cortex) : []));
  root.open("/modes", () => fromm.modes(context.modes).flat.map(listed(context)));

  for (const mode of fromm.modes(context.modes).flat) {
    const meta = context.aperture.branch(mode.reference.nature).branch("/metadata");

    meta.open("/aperture", () => shape.strip(mode.aperture));
    if (mode.statics) meta.open("/statics", () => mode.statics);
    if (mode.mountpoint) meta.open("/mountpoint", () => mode.mountpoint.absolute);

    if (mode.implements("APPLICATION"))
      meta.open("/application", async () => {
        if (paladin.is.dev) await mode.application.compile();
        return {
          url: context.attach.branch("/bundle").branch(context.reference.absolute).branch(mode.reference.absolute).absolute,
          bundle: mode.application.bundle.json,
          schema: mode.application.schema ?? null,
        };
      });

    if (mode.implements("EMITTER")) meta.open("/emitter", () => shape.strip(mode.module.emitter));

    if (mode.implements("FRAUGHT") || mode.implements("MOUNTED")) meta.open("/freight", () => mode.freight.catalog);

    if (mode.implements("HARNESSED")) {
      meta.open("/harness", () => shape.strip(mode.aperture.branch("/harness")));
    }
  }
};

// @beef
// -- // @beef expose cortex.hallucinate.[faculty][via](xyz)!
// -- // @beef strip wire into anima daemon who branches and aims deamon connection.
const faculty = (cortex, type, via) => async (ctx) => {
  const { tune, ...request } = ctx.input;
  const held = cortex.findOne({ type, tune, via });
  if (!held?.via?.[via]) throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
  ctx.output = await held.via[via](request);
};

export const cortex = (context) => {
  if (!context.cortex) return;
  const root = context.aperture.branch("/cortex");
  for (const type of ["dialogue", "object", "choice", "verbatim", "vocal"]) {
    root.branch(type).open("/render", faculty(context.cortex, type, "render")).open("/stream", faculty(context.cortex, type, "stream"));
  }
};

export const entities = (context) => {
  context.aperture
    .branch("/entities/mode")
    .graft(shard.datamap.repository(context.entities.mode))
    .graft(shard.datamap.reactive(context.entities.mode, context.twitch));
};
