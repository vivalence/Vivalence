import paladin from "@vivalence/paladin";
import { path } from "../../belt/index.js";

export async function tap(ctx) {
  const [input] = ctx.signal.params ?? [];
  const slug = ctx.signal.flags?.slug;
  if (!input || !slug) {
    return (ctx.effect = { error: "usage: /instances/tap <path> --slug=<slug>" });
  }
  if (!input.includes("/") && !input.startsWith(".")) {
    return (ctx.effect = { error: `'${input}' is a slug-shaped token — a tap takes a PATH; try ./${input}` });
  }
  const mount = path.pin(input);
  const stat = await Deno.stat(mount).catch(() => null);
  if (!stat?.isDirectory) return (ctx.effect = { error: `no directory at ${mount}` });
  if (await paladin.ledger.instances.read(slug)) {
    return (ctx.effect = { error: `instance '${slug}' exists` });
  }
  await paladin.ledger.instances.write(slug, { mount });
  ctx.effect = { tapped: slug, mount };
}
