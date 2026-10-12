import { Vector } from "@vivalence/typology";
import { wrap } from "@mikro-orm/core";
import * as argon2 from "argon2";
import { authority, card, respond } from "../aperture.js";

export const autologin = new Vector().open("/autologin", async (input, ctx) => {
  const user = await ctx.lighthouse.users.byUsername(ctx.lighthouse.trait.AUTOLOGIN.username);
  const tokens = await authority(ctx, user);
  wrap(user).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
  await ctx.lighthouse.users.em.flush();
  return respond.success({ authority: tokens, user: card(user) });
});

export const AUTOLOGIN = (lighthouse, runtime) => {
  lighthouse.aperture.graft(autologin);
  return () =>
    runtime.datamap.shard.scope(async () => {
      const { username, password } = lighthouse.trait.AUTOLOGIN;
      if (await lighthouse.users.byUsername(username)) return;
      const credentials = password === undefined ? { username } : { username, password: await argon2.hash(password) };
      lighthouse.users.create({ slug: username, authentication: { provider: "password", credentials } });
      await lighthouse.users.em.flush();
    });
};
