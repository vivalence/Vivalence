import config from "@vivalence/config";

// needs to be instantiated in middleware.
const makeIdentityClient = (ctx) => ({
  async getUser() {
    if (config.env.get("VIVA_IDENTITY_MODE") === "SINGLEPLAYER") {
      return await ctx.entities.user.findOne({ id: config.identity.singleplayer.user.id });
    }
    return null;
  },
});

export default async function identity(serviceConfig, ctx) {
  // for now creates the default user.
  let user = await ctx.entities.user.findOne({ id: config.identity.singleplayer.user.id });
  if (!user) {
    user = await ctx.entities.user.create(config.identity.singleplayer.user);
    await ctx.entities.em.flush();
  }

  return makeIdentityClient(ctx);
}
