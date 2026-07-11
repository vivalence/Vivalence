import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";

export async function login(ctx) {
  const [username, password] = ctx.signal.params ?? [];
  if (!username || !password) {
    return (ctx.effect = { error: "usage: /variant/lighthouse/auth/login <username> <password>" });
  }
  await paladin.variant.mount();
  ctx.effect = await new Connection(paladin.variant.lighthouse.statics.remote).call("/auth/login", {
    username,
    password,
  });
}
