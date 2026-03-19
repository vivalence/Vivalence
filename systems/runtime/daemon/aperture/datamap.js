export async function datamap(die) {
  die.good.aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.daemon.entities[ctx.params.entity];
    return await ctx.daemon.entities.em[ctx.params.method](
      entity.entityName,
      body.where || {},
      body.options || {},
    );
  });
}
