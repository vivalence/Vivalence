import paladin from "@vivalence/paladin";
import { path } from "../../belt/index.js";

export async function tap(ctx) {
  const [input] = ctx.signal.params ?? [];
  const slug = ctx.signal.flags?.slug;
  if (!input || !slug) {
    return (ctx.effect = { error: "--slug is required" });
  }
  const mount = path.pin(input);
  await paladin.ledger.instances.write(slug, { mount });
  ctx.effect = { tapped: slug, mount };
}
