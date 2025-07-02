export default async function (aperture) {
  aperture.open("/status", () => ({
    status: "daemon:/status ok",
    timestamp: new Date().toISOString(),
  }));

  aperture.open("/identity/getUser", async (body, ctx) => {
    //
  });

  aperture.open("/entities/:entity/:repo", async (body, ctx) => {
    const entity = ctx.daemon.entities[ctx.params.entity];
    // const repo = entity[ctx.params.repo]; return await repo(body);
    return await ctx.daemon.entities.em[ctx.params.repo](
      entity.entityName,
      body.where,
      body.options,
    );
  });
}
