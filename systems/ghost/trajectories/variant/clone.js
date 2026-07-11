import paladin from "@vivalence/paladin";
import { dirname, resolve } from "@std/path";
import { cloneDir } from "../instance/clone.js";

export async function clone(ctx) {
  const [source, target] = ctx.signal.params ?? [];
  if (!source) {
    return (ctx.effect = { error: "usage: /variant/clone <@owner/type/slug | ../path> [target]" });
  }

  let mount;
  if (source.startsWith("@")) {
    await paladin.vip.supply();
    const module = await paladin.vip.accio(source);
    mount = dirname(module.mount.absolute);
  } else {
    const located = paladin.source(source);
    const absolute = located.absolute ?? String(located);
    const stat = await Deno.stat(absolute);
    mount = stat.isDirectory ? absolute : dirname(absolute);
  }

  const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
  const destination = resolve(cwd, target ?? "testament/variant");

  await cloneDir(mount, destination);

  ctx.effect = { source, from: mount, target: destination };
}
