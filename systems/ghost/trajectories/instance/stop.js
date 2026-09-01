import paladin from "@vivalence/paladin";
import { until } from "./target.js";

export async function stop(ctx) {
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) throw new Error(`instance: mount not registered — viva instances/tap ${mount} --slug=<slug>`);

  const lock = await paladin.ledger.lock(held.slug).read();
  if (!lock) {
    console.log(`ghost: ${held.slug} not running`);
    return (ctx.effect = { status: "nothing-to-stop", instance: held.slug });
  }

  Deno.kill(lock.pid, "SIGTERM");
  const gone = await until(async () => ((await paladin.ledger.lock(held.slug).read()) === null ? true : null), 15_000);
  const processes = lock.processes.map((entry) => `${entry.process}=${entry.pid}`).join(", ");
  ctx.effect = {
    status: gone ? "stopped" : "still-running",
    instance: held.slug,
    supervisor: lock.pid,
    processes: lock.processes,
  };
  if (!gone) throw new Error(`${held.slug}: supervisor ${lock.pid} still holds the lock after 15 s (${processes})`);
  console.log(`ghost: stopped ${held.slug} (supervisor ${lock.pid}: ${processes})`);
}
