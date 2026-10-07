import { authenticate } from "../lighthouse/signer.js";
import { auth } from "../lighthouse/auth.js";

export const lighthouse = async (die, next) => {
  die.runtime.lighthouse = {
    secret: die.mask.secrets.jwt,
    users: die.runtime.entities.user,
    authenticate: authenticate({ secret: die.mask.secrets.jwt, users: die.runtime.entities.user }),
    bind: die.runtime.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })),
  };
  die.aperture.branch("/lighthouse", auth(die.runtime.lighthouse));
  await next();
};
