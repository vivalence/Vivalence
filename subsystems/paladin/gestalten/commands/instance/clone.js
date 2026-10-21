import { basename, dirname, resolve } from "@std/path";
import { cast, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { lens, path, pick, tree } from "../belt/index.js";

async function effect(ctx) {
  const [input, target] = ctx.signal.body;

  let source = input;
  const local = input && !input.startsWith("@") && (input.includes("/") || input.startsWith("."));
  if (!local) {
    const chosen = await pick(ctx, await lens.modes({ type: "instance" }), input);
    if (chosen?.aborted) return { aborted: true };
    if (!chosen) return { error: `no instance module matches '${input ?? ""}' — usage: /instance/clone <@owner/instance/slug | ../path> [target]` };
    source = chosen.identifier;
  }

  let mount;
  if (source.startsWith("@")) {
    await paladin.ledger.registry.supply();
    const module = await paladin.ledger.registry.accio(source);
    mount = dirname(module.source.absolute);
  } else {
    const absolute = path.pin(source);
    const stat = await Deno.stat(absolute);
    mount = stat.isDirectory ? absolute : dirname(absolute);
  }

  const recipe = source.startsWith("@") ? cast.lookup(source).slug : basename(mount);
  const slug = ctx.signal.flags.slug ?? recipe;
  if (await paladin.ledger.instances.read(slug)) return { error: `instance '${slug}' exists — pass --slug=<other>` };
  const destination = target ? resolve(path.cwd(), target) : paladin.ledger.instances.shelf(slug).absolute;

  await tree(mount, destination);
  await paladin.ledger.instances.write(slug, { mount: destination });

  const created = { source, slug, from: mount, target: destination, env: `VIVA_INSTANCE_MOUNT=${destination}` };

  if (ctx.signal.flags.use) created.selected = await ctx.call(["instance/use", destination]);
  if (ctx.signal.flags.install) {
    paladin.env.set("VIVA_INSTANCE_MOUNT", destination, "flag");
    created.installed = await ctx.call(["instance/install"]);
  }
  return created;
}

export const clone = new Vector().open(
  {
    nature: "/instance/clone",
    valence: "create an instance from a registry source — a bare slug resolves against the registry, an ambiguous or missing one opens the picker; no target lands it in <ledger>/instances/<slug>. Example: viva instance/clone hello-world --use --install",
    input: v.object({
      source: v.string().desc("slug | @owner/instance/slug | ../path — preset for the picker. Example: hello-world").optional(),
      target: v.string().desc("destination dir, defaults to <ledger>/instances/<slug>. Example: ./chess").optional(),
      use: v.boolean().desc("select it for this shell once created").group("flags").optional(),
      install: v.boolean().desc("run instance/install on it once created").group("flags").optional(),
      slug: v.string().desc("the slug to record it under. Example: readmen").group("flags").optional(),
    }),
  },
  effect,
);
