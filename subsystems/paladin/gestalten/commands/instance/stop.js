import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { instance } from "../belt/index.js";

export async function halt() {
  const home = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(home);
  if (!held) throw new Error(`instance: mount ${home} not recorded — viva instance/clone records one`);

  const lock = await paladin.ledger.lock(held.slug).read();
  if (!lock) return { status: "nothing-to-stop", instance: held.slug };

  Deno.kill(lock.pid, "SIGTERM");
  const gone = await instance.until(async () => ((await paladin.ledger.lock(held.slug).read()) === null ? true : null), 15_000);
  const processes = lock.processes.map((entry) => `${entry.process}=${entry.pid}`).join(", ");
  if (!gone) throw new Error(`${held.slug}: supervisor ${lock.pid} still holds the lock after 15 s (${processes})`);
  return { status: "stopped", instance: held.slug, supervisor: lock.pid, processes: lock.processes };
}

export const stop = new Vector().open(
  { nature: "/instance/stop", valence: "stop the mounted instance — SIGTERM its supervisor, wait for the lock to clear. Example: viva instance/stop", input: v.object({}) },
  halt,
);
