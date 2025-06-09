import config from "@vivalence/config";

// no access to ctx on boot means no access to database
// needs to be instantiated in middleware.
const makeIdentityClient = () => ({
  async getUser() {
    if (config.env.get("VIVA_IDENTITY_MODE") === "SINGLEPLAYER") {
      return config.identity.singleplayer.user;
      // return await ctx.entities.user.findOne({ id: config.identity.singleplayer.user.id });
    }
    return null;
  },
});

export default async function identity(serviceConfig) {
  // for now creates the default user.
  // return config.identity.singleplayer.user

  // let user = await ctx.entities.user.findOne({ id: config.identity.singleplayer.user.id });
  // if (!user) {
  //   user = await ctx.entities.user.create(config.identity.singleplayer.user);
  //   await ctx.entities.em.flush();
  // }

  return makeIdentityClient();
}
