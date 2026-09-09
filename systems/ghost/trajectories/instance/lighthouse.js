import paladin, { lifecycle } from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";

export async function lighthouse(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!["signup", "login"].includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /instance/lighthouse <signup|login> <username> <password>" });
  }
  await lifecycle.mount(paladin.instance);
  ctx.effect = await new Connection(paladin.instance.lighthouse.statics.remote).call(
    `/auth/${action}`,
    { username, password },
  );
}
