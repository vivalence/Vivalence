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
  root.open("/datamap", () => shard.datamap.strip(context.datamap.getMetadata()));
  root.open("/aperture", () => shape.strip(context.aperture));

  root.open("/cortex", () => (context.cortex ? faculties.strip(context.cortex) : []));
  root.open("/modes", () => fromm.modes(context.modes).flat.map(listed(context)));
};

// @beef
// -- // @beef expose cortex.hallucinate.[faculty][via](xyz)!
// -- // @beef strip wire into anima daemon who branches and aims deamon connection.
const faculty = (cortex, type, via) => async (ctx) => {
  const { provider, id, tier, tune, ...request } = ctx.input;
  const held = cortex.findOne({ type, via, provider, id, tier, tune });
  if (!held?.via?.[via]) throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
  ctx.output = await held.via[via](request);
};

export const cortex = (context) => {
  if (!context.cortex) return;
  const root = context.aperture.branch("/cortex");
  for (const type of ["dialogue", "object", "choice", "verbatim", "speech", "picture"]) {
    root.branch(type).open("/render", faculty(context.cortex, type, "render")).open("/stream", faculty(context.cortex, type, "stream"));
  }
};

export const entities = (context) => {
  context.aperture
    .branch("/entities/mode")
    .graft(shard.datamap.repository(context.entities.mode))
    .graft(shard.datamap.reactive(context.entities.mode, context.twitch));
};
