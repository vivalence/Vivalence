export async function modes(die) {
  die.good.aperture.open("/modes/:type/:method", async (body, ctx) => {
    console.log("/modes/:type/:method called");
    // else trash
    const params = ctx.params;
    const modes = ctx.daemon.modes[params.type];
    if (!modes) throw new Error("unsupported mode");
    let mode = {};
    switch (params.method) {
      case "findOne":
        mode = modes[body.where.slug];
        break;
      default:
        throw new Error("unsupported method");
    }
    const result = {
      manifest: mode.manifest,
    };
    if (mode.implements("VIEWABLE")) {
      result.buffered = {
        url: mode.cake.view.url.absolute,
        schema: mode.cake.view.mask,
      };
    }
    return result;
    // return await ctx.daemon.modes[someModeManager/EntityMap/RepositorySystem][ctx.params.method](mode.type, body.where, body.options);
  });
}
