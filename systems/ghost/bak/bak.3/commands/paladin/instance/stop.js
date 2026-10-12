import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { until } from "../../../gestalten/belt/instance.js";

export async function effect(ctx) {
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) throw new Error(`instance: mount ${mount} not recorded — viva instance/clone records one`);

  const lock = await paladin.ledger.lock(held.slug).read();
  if (!lock) {
    console.log(`ghost: ${held.slug} not running`);
    return { status: "nothing-to-stop", instance: held.slug };
  }

  Deno.kill(lock.pid, "SIGTERM");
  const gone = await until(async () => ((await paladin.ledger.lock(held.slug).read()) === null ? true : null), 15_000);
  const processes = lock.processes.map((entry) => `${entry.process}=${entry.pid}`).join(", ");
  const stopped = {
    status: gone ? "stopped" : "still-running",
    instance: held.slug,
    supervisor: lock.pid,
    processes: lock.processes,
  };
  if (!gone) throw new Error(`${held.slug}: supervisor ${lock.pid} still holds the lock after 15 s (${processes})`);
  console.log(`ghost: stopped ${held.slug} (supervisor ${lock.pid}: ${processes})`);
  return stopped;
}

export const stop = new Vector().open(
  { nature: "/instance/stop", valence: "stop the mounted instance — SIGTERM its supervisor, wait for the lock to clear. Example: viva instance/stop", schema: v.object({}) },
  effect,
);
