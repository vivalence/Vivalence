import paladin from "@vivalence/paladin";
import { Aperture } from "@vivalence/vector/aperture";
import { Die as DaemonDie, Daemon } from "@vivalence/runtime/daemon";
import { Die as ProcessDie, Process } from "@vivalence/runtime/process";

export async function registry(die) {
  await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
  await paladin.vip.mount(paladin.scope.registry.branch("modes"));
  await paladin.vip.mount(paladin.scope.registry.branch("services"));
}

export async function aperture(die) {
  die.good.aperture.open("/status", () => die.status.reflection);
  die.good.aperture.open("/manifest", () => die.manifest);
}

export async function terrans(die) {
  for (const mask of paladin.variant.daemons) {
    const daemonDie = new DaemonDie({ mask, good: new Daemon(mask) });
    die.good.daemons.push(daemonDie);
  }

  for (const mask of paladin.variant.services) {
    const register = await paladin.vip.accio(mask.module);
    if (register.manifest?.traits?.includes("ATTACHED") && register.aperture) {
      const aperture = new Aperture();
      const good = (await register.aperture(aperture, mask)) || aperture;
      const processDie = new ProcessDie({ mask, register, good });
      die.good.processes.push(processDie);
    }
  }
}

// // // populate is for tools, maps and repositories
// import paladin from "@vivalence/paladin";
// import { shards } from "@vivalence/vector";
// import { Aperture } from "@vivalence/vector/aperture";
// import { Status } from "@vivalence/typology";
// import { ProcessDie, DaemonDie, Daemon } from "@vivalence/runtime/typology";

// export async function aperture(runtime) {
//   runtime.aperture.open("/status", (body, ctx) => runtime.status.reflection);
// }

// // export async function registry(runtime) {console.trace("LEGACY"); await paladin.vip.mount(paladin.join.registry()); await paladin.vip.mount(paladin.join.system("systems"));}

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
