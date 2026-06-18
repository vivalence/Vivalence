import paladin from "@vivalence/paladin";
import { Url, Connection, Path, Aperture } from "@vivalence/typology";
import { Die as DaemonDie, Daemon } from "@vivalence/runtime/daemon";
import { Die as ProcessDie, Process } from "@vivalence/runtime/process";

export async function registry(runtimeDie) {
  await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
  await paladin.vip.mount(paladin.scope.registry.branch("modes"));
  await paladin.vip.mount(paladin.scope.registry.branch("services"));
}

export async function wiring(runtimeDie) {
  runtimeDie.good.latch = new Url(paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE"));
}

export async function aperture(runtimeDie) {
  runtimeDie.good.aperture
    .open("/status", () => runtimeDie.status.reflection)
    .open("/manifest", () => runtimeDie.manifest);
}

export async function daemons(runtimeDie) {
  for (const mask of paladin.variant.daemons) {
    // console.log({ mask });
    const daemonDie = new DaemonDie({
      mask,
      good: new Daemon({ manifest: mask.manifest }),
    });

    daemonDie.good.mount = new Path(`/daemon/${daemonDie.slug}`);
    daemonDie.good.url = runtimeDie.good.latch //
      .branch(daemonDie.good.mount.nature);

    daemonDie.good.attach = runtimeDie.good.latch.branch("/attached");
    runtimeDie.good.daemons.push(daemonDie);
  }
}

export async function processes(runtimeDie) {
  for (const mask of paladin.variant.services) {
    const cake = await paladin.vip.accio(mask.module);
    // if cake.implements(trait) TODO
    if (cake.manifest?.traits?.includes("ATTACHED") && cake.aperture) {
      const aperture = new Aperture();
      const good = (await cake.aperture(aperture, mask)) || aperture;
      const processDie = new ProcessDie({ mask, cake, good, register: cake });
      runtimeDie.good.processes.push(processDie);
    }
  }
}

// export async function terrans(runtime) {
//   for (const mask of paladin.variant.daemons) {
//     const die = new DaemonDie({ mask, good: new Daemon(mask) });
//     runtime.terra.daemons.push(die);
//   }

//   for (const mask of paladin.variant.services) {
//     const register = await paladin.vip.accio(mask.module);
//     if (register.manifest?.traits?.includes("ATTACHED") && register.aperture) {
//       const aperture = new Aperture();
//       const good = (await register.aperture(aperture, mask)) || aperture;
//       const die = new ProcessDie({ mask, register, good });

//       die.good
//         .open("/status", () => die.status)
//         .open("/manifest", () => die.manifest);

//       runtime.aperture
//         .branch(`/attached/process/${die.type}/${die.slug}`)
//         // .use(secure.context(rme.instance.lighthouse)).use(secure.authorize()) ?? only on trait PUBLIC
//         .use(shards.context.attach(die.type, die.mask))
//         .descendants.push(die.good);

//       die.status.set("alive");

//       runtime.terra.processes.push(die);
//     }
//   }
// }

// // some base aperture. process/mask process/status
