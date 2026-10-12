import { Aperture, shard } from "@vivalence/typology";
import { authenticate } from "./signer.js";
import { aperture } from "./aperture.js";

export const core = async (die, next) => {
  die.lighthouse.users = die.runtime.entities.user;
  die.lighthouse.authenticate = authenticate({ secret: die.lighthouse.secret, users: die.lighthouse.users });
  die.lighthouse.bind = die.runtime.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id }));
  die.lighthouse.aperture = new Aperture()
    .use(shard.context.bind("lighthouse", die.lighthouse))
    .open("/metadata", () => die.lighthouse.manifest)
    .graft(aperture);
  await next();
};
