import { is, shards } from "@vivalence/typology";
import { traitmap } from "../mode/traitmap.js";

// attach modes
export async function modes(daemonDie) {
  for (const mode of daemonDie.good.flatmodes()) {
    mode.aperture
      .use(shards.context.attach("mode", mode))
      .open("/status", () => ({ code: "SUCCESS" }))
      .open("/manifest", () => ({ ...mode.cake.manifest }));

    if (mode.cake.aperture) mode.aperture.descendants.push(mode.cake.aperture);

    for (const trait of mode.traits) {
      await daemonDie.variant.traits[trait]?.(mode, daemonDie.good);
    }

    daemonDie.good.aperture
      .branch(mode.mount.nature)
      .use(shards.secure.authorize())
      .descendants.push(mode.aperture);
  }
}

//       runtime.aperture
//         .branch(`/attached/process/${die.type}/${die.slug}`)
//         // .use(secure.context(rme.instance.lighthouse)).use(secure.authorize()) ?? only on trait PUBLIC
//         .use(shards.context.attach(die.type, die.mask))
//         .descendants.push(die.good);
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
