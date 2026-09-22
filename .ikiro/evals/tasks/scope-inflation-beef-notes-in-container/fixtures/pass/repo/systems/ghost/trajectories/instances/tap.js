import paladin from "@vivalence/paladin";
import { path } from "../../belt/index.js";

export async function tap(ctx) {
  const [input] = ctx.signal.params ?? [];
  const slug = ctx.signal.flags?.slug;
// @beef this error should say --slug is required, not print the usage line
  if (!input || !slug) {
    return (ctx.effect = { error: "usage: /instances/tap <path> --slug=<slug>" });
  }
  const mount = path.pin(input);
  await paladin.ledger.instances.write(slug, { mount });
  ctx.effect = { tapped: slug, mount };
}
