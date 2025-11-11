// // populate is for tools, maps and repositories
import paladin from "@vivalence/paladin";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { Status } from "@vivalence/typology";
import { ProcessDie, RuntimeDie, Daemon } from "@vivalence/runtime/typology";

export async function aperture(runtime) {
  runtime.aperture.open("/status", (body, ctx) => runtime.status.reflection);
}

export async function registry(runtime) {
  console.trace("LEGACY");
  // await paladin.vip.mount(paladin.join.registry());
  // await paladin.vip.mount(paladin.join.system("systems"));
}

export async function terrans(runtime) {
  for (const mask of paladin.variant.daemons) {
    const die = new RuntimeDie({ mask, good: new Daemon(mask) });
    runtime.terrans.push(die);
  }

  for (const mask of paladin.variant.services) {
    const register = await paladin.vip.accio(mask.module);
    if (register.manifest?.traits?.includes("ATTACHED") && register.aperture) {
      const aperture = new Aperture();

      const die = new ProcessDie({
        mask,
        register,
        good: (await register.aperture(aperture, mask)) || aperture,
      });

      die.good
        .open("/status", () => die.status)
        .open("/manifest", () => die.manifest);

      runtime.aperture
        .branch(`/attached/process/${die.type}/${die.slug}`)
        // .use(secure.context(rme.instance.lighthouse)) .use(secure.authorize()) ?? only on trait PUBLIC
        .use(shards.context.attach(die.type, die.mask))
        .descendants.push(die.good);

      die.status.set("alive");

      runtime.terrans.push(die);
    }
  }
}

// some base aperture. process/mask process/status
