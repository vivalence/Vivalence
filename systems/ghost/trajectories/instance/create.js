import paladin from "@vivalence/paladin";
import { basename, dirname, resolve } from "@std/path";
import { cast } from "@vivalence/typology";

export async function create(ctx) {
  const [source, target] = ctx.signal.params ?? [];
  if (!source) {
    return (ctx.effect = { error: "usage: /instance/create <@owner/instance/slug | ../path> [target]" });
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

  const slug = source.startsWith("@") ? cast.lookup(source).slug : basename(mount);
  const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
  const destination = target
    ? resolve(cwd, target)
    : paladin.scope.ledger.branch(`instances/${slug}`).absolute;

  await cloneDir(mount, destination);

  ctx.effect = {
    source,
    from: mount,
    target: destination,
    env: `VIVA_INSTANCE_MOUNT=${target ? destination : slug}`,
  };
}

export async function cloneDir(source, target) {
  await Deno.mkdir(target, { recursive: true });
  for await (const entry of Deno.readDir(source)) {
    const src = `${source}/${entry.name}`;
    const dst = `${target}/${entry.name}`;
    if (entry.isDirectory) {
      await cloneDir(src, dst);
    } else if (entry.isFile) {
      await Deno.copyFile(src, dst);
    }
  }
}
