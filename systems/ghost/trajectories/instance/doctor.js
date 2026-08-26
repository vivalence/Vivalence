import paladin from "@vivalence/paladin";
import { basename, resolve } from "@std/path";
import { Path } from "@vivalence/typology";

export async function doctor(ctx) {
  const target = ctx.signal.params?.[0];
  if (target) {
    const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
    const home = target.includes("/") || target.startsWith(".")
      ? new Path(resolve(cwd, target))
      : paladin.scope.ledger.branch(`instances/${target}`);
    paladin.scopes([["instance", () => true, () => home]]);
  }

  if (!paladin.scope.instance) {
    return (ctx.effect = { error: "no instance — set VIVA_INSTANCE_MOUNT or pass a slug/path" });
  }

  await paladin.instance.mount();
  const mount = paladin.scope.instance.absolute;
  const instance = basename(mount);

  ctx.effect = {
    mount,
    manifest: paladin.instance.manifest,
    daemons: paladin.instance.daemons?.length ?? 0,
    services: paladin.instance.services?.length ?? 0,
    clients: Object.keys(paladin.instance.clients ?? {}),
    locks: await paladin.ledger.locks(instance),
  };
}
