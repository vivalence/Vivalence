import paladin from "@vivalence/paladin";
import { basename, resolve } from "@std/path";
import { Path } from "@vivalence/typology";

export async function doctor(ctx) {
  const target = ctx.signal.params?.[0];
  if (target) {
    const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
    const home = target.includes("/") || target.startsWith(".")
      ? new Path(resolve(cwd, target))
      : paladin.scope.ledger.branch(`variants/${target}`);
    paladin.scopes([["variant", () => true, () => home]]);
  }

  if (!paladin.scope.variant) {
    return (ctx.effect = { error: "no variant — set VIVA_VARIANT_MOUNT or pass a slug/path" });
  }

  await paladin.variant.mount();
  const mount = paladin.scope.variant.absolute;
  const instance = basename(mount);

  ctx.effect = {
    mount,
    manifest: paladin.variant.manifest,
    daemons: paladin.variant.daemons?.length ?? 0,
    services: paladin.variant.services?.length ?? 0,
    clients: Object.keys(paladin.variant.clients ?? {}),
    locks: await paladin.ledger.locks(instance),
  };
}
