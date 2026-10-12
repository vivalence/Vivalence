import { Vector } from "@vivalence/typology";
import { wrap } from "@mikro-orm/core";
import * as argon2 from "argon2";
import { authority, card, respond } from "../aperture.js";

export const signup = new Vector().open("/signup", async ({ username, password }, ctx) => {
  if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
  const existing = await ctx.lighthouse.users.byUsername(username);
  if (existing) return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");

  const user = ctx.lighthouse.users.create({ slug: username });
  await ctx.lighthouse.users.em.flush();
  const tokens = await authority(ctx, user);
  wrap(user).assign({
    authentication: { provider: "password", credentials: { username, password: await argon2.hash(password) }, tokens },
  });
  await ctx.lighthouse.users.em.flush();
  return respond.success({ user: card(user), authority: tokens });
});

export const JOINABLE = (lighthouse) => {
  lighthouse.aperture.graft(signup);
};
