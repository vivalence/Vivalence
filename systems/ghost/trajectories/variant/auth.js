import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";

export async function auth(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!["signup", "login"].includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /variant/auth <signup|login> <username> <password>" });
  }
  await paladin.variant.mount();
  ctx.effect = await new Connection(paladin.variant.lighthouse.statics.remote).call(
    `/auth/${action}`,
    { username, password },
  );
}
