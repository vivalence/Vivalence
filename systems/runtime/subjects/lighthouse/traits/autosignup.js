import { Vector } from "@vivalence/typology";
import { wrap } from "@mikro-orm/core";
import { authority, card, respond, seated } from "../apertures/users.js";

export const autosignup = new Vector().open("/autosignup", async ({ username }, ctx) => {
  if (!username) return respond.error(ctx, "INVALID_INPUT", "Username required");
  const user =
    (await ctx.lighthouse.users.byUsername(username)) ??
    ctx.lighthouse.users.create({
      slug: username,
      authentication: { credentials: { username } },
    });
  if (user.authentication.credentials.password) {
    return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");
  }
  await ctx.lighthouse.users.em.flush();
  const tokens = await authority(ctx, user);
  wrap(user).assign(
    { authentication: { tokens: seated(user, tokens) } },
    { merge: true, mergeObjectProperties: true },
  );
  await ctx.lighthouse.users.em.flush();
  return respond.success({ authority: tokens, user: card(user) });
});

export const AUTOSIGNUP = (lighthouse) => {
  lighthouse.aperture.graft(autosignup);
};
