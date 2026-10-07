// @beef
// -- // @beef expose cortex.hallucinate.[faculty][via](xyz)!
// -- // @beef strip wire into anima daemon who branches and aims deamon connection.
const faculty = (cortex, type, via) => async (ctx) => {
  const { tune, ...request } = ctx.input;
  const held = cortex.findOne({ type, tune, via });
  if (!held?.via?.[via]) throw new Error(`[cortex] no '${type}' faculty resolves a '${via}' avenue`);
  ctx.output = await held.via[via](request);
};

export const cortex = async (die, next) => {
  if (die.host.cortex) {
    const root = die.host.aperture.branch("/cortex");
    for (const type of ["dialogue", "object", "choice", "verbatim", "vocal"]) {
      root.branch(type).open("/render", faculty(die.host.cortex, type, "render")).open("/stream", faculty(die.host.cortex, type, "stream"));
    }
  }
  await next();
};
