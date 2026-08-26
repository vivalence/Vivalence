import paladin from "@vivalence/paladin";
import { basename } from "@std/path";
import { path } from "../../belt/index.js";

export async function doctor(ctx) {
  const target = ctx.signal.params?.[0];
  if (target) {
    paladin.env.set("VIVA_INSTANCE_MOUNT", path.pin(target), "flag");
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
    daemons: (paladin.instance.daemons ?? []).map((daemon) => daemon.slug ?? daemon.manifest?.slug),
    services: (paladin.instance.services ?? []).map((service) => service.slug ?? service.manifest?.slug),
    clients: Object.keys(paladin.instance.clients ?? {}),
    runtime: Object.keys(paladin.instance.runtime ?? {}),
    environment: paladin.scope.environment?.absolute ?? null,
    mountpoint: paladin.scope.mountpoint?.absolute ?? null,
    vars: paladin.env.strata.get("instance") ?? {},
    locks: await paladin.ledger.locks(instance),
  };
}
