import paladin from "@vivalence/paladin";
import { basename, dirname, resolve } from "@std/path";
import { cast } from "@vivalence/typology";
import { clone, lens, path, pick } from "../../belt/index.js";

export async function create(ctx) {
  const [input, target] = ctx.signal.params ?? [];

  let source = input;
  const local = input && !input.startsWith("@") && (input.includes("/") || input.startsWith("."));
  if (!local) {
    const chosen = await pick(ctx, await lens.modes({ type: "instance" }), input);
    if (chosen?.aborted) return (ctx.effect = { aborted: true });
    if (!chosen) {
      return (ctx.effect = {
        error: `no instance module matches '${input ?? ""}' — usage: /instance/create <@owner/instance/slug | ../path> [target]`,
      });
    }
    source = chosen.reference;
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

  const recipe = source.startsWith("@") ? cast.lookup(source).slug : basename(mount);
  const slug = ctx.signal.flags?.slug ?? recipe;
  if (await paladin.ledger.instances.read(slug)) {
    return (ctx.effect = { error: `instance '${slug}' exists — pass --slug=<other>` });
  }
  const destination = target
    ? resolve(path.cwd(), target)
    : paladin.scope.ledger.branch(`instances/${slug}`).absolute;

  await clone.tree(mount, destination);
  await paladin.ledger.instances.write(slug, { mount: destination });

  ctx.effect = {
    source,
    slug,
    from: mount,
    target: destination,
    env: `VIVA_INSTANCE_MOUNT=${destination}`,
  };

  if (ctx.signal.flags?.use) ctx.effect.selected = await ctx.call(["instances/use", destination]);
}
