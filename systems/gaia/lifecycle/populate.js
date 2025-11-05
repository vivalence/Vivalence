// // populate is for tools, maps and repositories
import paladin from "@vivalence/paladin";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { Status } from "@vivalence/typology";
import { ServiceDie, DaemonDie, Daemon } from "@vivalence/gaia/typology";

export async function aperture(gaia) {
  gaia.aperture.open("/status", (body, ctx) => gaia.status.reflection);
}

export async function registry(gaia) {
  await paladin.vip.mount(paladin.join.registry());
  await paladin.vip.mount(paladin.join.system("systems"));
}

export async function terrans(gaia) {
  for (const cake of paladin.variant.daemons) {
    const die = new DaemonDie({
      cake,
      good: new Daemon(cake),
    });
    gaia.terrans.push(die);
  }

  for (const cake of paladin.variant.services) {
    const register = await paladin.vip.accio(cake.module);
    if (register.manifest?.traits?.includes("ATTACHED") && register.aperture) {
      const aperture = new Aperture();

      const die = new ServiceDie({
        cake,
        register,
        good: await register.aperture(aperture, cake),
      });

      const { type, slug } = die.cake.manifest;

      gaia.aperture
        .branch(`/attached/services/${type}/${slug}`)
        // .use(secure.context(rme.instance.lighthouse)) .use(secure.authorize()) ?? only on trait PUBLIC
        .use(shards.context.attach(type, cake))
        .descendants.push(aperture);

      gaia.terrans.push(die);
    }
  }
}
