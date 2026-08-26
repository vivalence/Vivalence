import paladin from "@vivalence/paladin";
import { basename, dirname, resolve } from "@std/path";
import { cast } from "@vivalence/typology";
import { clone, lens, path, pick } from "../../belt/index.js";

export async function create(ctx) {
  const [input, target] = ctx.signal.params ?? [];

  let source = input;
  const local = input && (await Deno.stat(path.pin(input)).catch(() => null));
  if (!local) {
    const chosen = await pick(ctx, await lens.modes({ type: "instance" }), input);
    if (chosen?.aborted) return (ctx.effect = { aborted: true });
    if (chosen) source = chosen.reference;
  }

  if (!source) {
    return (ctx.effect = { error: "usage: /instance/create <@owner/instance/slug | ../path> [target]" });
  }

  let mount;
  if (source.startsWith("@")) {
    await paladin.vip.supply();
    const module = await paladin.vip.accio(source);
    mount = dirname(module.mount.absolute);
  } else {
    const absolute = path.pin(source);
    const stat = await Deno.stat(absolute);
    mount = stat.isDirectory ? absolute : dirname(absolute);
  }

  const slug = source.startsWith("@") ? cast.lookup(source).slug : basename(mount);
  const destination = target
    ? resolve(path.cwd(), target)
    : paladin.scope.ledger.branch(`instances/${slug}`).absolute;

  await clone.tree(mount, destination);

  ctx.effect = {
    source,
    from: mount,
    target: destination,
    env: `VIVA_INSTANCE_MOUNT=${target ? destination : slug}`,
  };
}
