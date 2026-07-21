export async function modes(die) {
  die.good.aperture.open("/modes/:type/:method", async (body, ctx) => {
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
    return { manifest: mode.manifest };
  });
}
