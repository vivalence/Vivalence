import paladin from "@vivalence/paladin";
import { Connection, Path, Aperture } from "@vivalence/typology";
import { Die as DaemonDie, Daemon } from "@vivalence/runtime/daemon";
import { Die as ProcessDie, Process } from "@vivalence/runtime/process";

export async function registry(runtimeDie) {
  await paladin.ledger.registry.supply();
}

export async function wiring(runtimeDie) {
  runtimeDie.good.latch = paladin.instance.runtime?.statics?.remote?.clone();
}

export async function aperture(runtimeDie) {
  runtimeDie.good.aperture
    .open("/status", () => runtimeDie.status.reflection)
    .open("/manifest", () => runtimeDie.manifest);
}

export async function daemons(runtimeDie) {
  for (const mask of paladin.instance.daemons) {
    const daemonDie = new DaemonDie({
      mask,
      good: new Daemon({ manifest: mask.manifest }),
    });

    daemonDie.good.mount = mask.mount;
    daemonDie.good.url = mask.url;
    daemonDie.good.attach = mask.attach;
    runtimeDie.good.daemons.push(daemonDie);
  }
}

export async function processes(runtimeDie) {
  for (const service of paladin.instance.services) {
    const citizen = await paladin.ledger.registry.accio(service);
    // a service without ATTACHED is consumed by daemons, never spawned — a row, not a silence
    if (!citizen.manifest.traits.includes("ATTACHED")) {
      paladin.instance.dormant.push({ at: `service[${citizen.manifest.slug}]`, module: citizen.identifier, empty: [], why: "not ATTACHED — consumed only" });
      continue;
    }
    const aperture = new Aperture();
    const good = (await citizen.aperture(aperture, citizen)) || aperture;
    runtimeDie.good.processes.push(new ProcessDie({ mask: citizen, module: citizen.module, good, register: citizen.module }));
  }
}
