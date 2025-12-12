import { is, shards } from "@vivalence/typology";
import { traitmap } from "../mode/traitmap.js";

export async function modes(die) {
  for (const mode of die.good.flatmodes()) {
    mode.aperture
      .use(shards.context.attach("mode", mode))
      .open("/status", async () => ({ code: "SUCCESS" }))
      .open("/manifest", async () => ({ ...mode.cake.manifest }));

    if (mode.cake.aperture) mode.aperture.descendants.push(mode.cake.aperture);

    for (const trait of mode.traits) {
      await die.variant.traits[trait]?.(mode, die.good);
    }

    die.good.aperture
      .branch(mode.mount.nature)
      .use(shards.secure.authorize())
      .descendants.push(mode.aperture);
  }
}

// // legacy/duplicate?
// export async function services(die) {
//   // console.log({ ...die.mask });
//   for (const [slug, servicemask] of Object.entries(die.mask.consume)) {
//     const register = await paladin.vip.accio(servicemask.module);
//     die.good.service[servicemask.slug] = await register.provider(servicemask);
//   }
// }
// async function services(die) {
//   if (die.mask.consume) {
//     for (const [service, config] of Object.entries(die.mask.consume)) {
//       const provider = runtime.terrans.find((t) => t.slug === config.provider);
//       die.variant.service[service] = provider;
//     }
//   }
// }
