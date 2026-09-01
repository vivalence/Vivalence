import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";

export async function lighthouse(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!["signup", "login"].includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /instance/lighthouse <signup|login> <username> <password>" });
  }
  await paladin.instance.mount();
  ctx.effect = await new Connection(paladin.instance.lighthouse.statics.remote).call(
    `/auth/${action}`,
    { username, password },
  );
}
