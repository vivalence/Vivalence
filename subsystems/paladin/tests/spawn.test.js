import { assert, assertEquals } from "@std/assert";
import { Paladin, populate } from "@vivalence/paladin/typology";

async function mkPaladin() {
  const root = await Deno.makeTempDir({ prefix: "paladin-spawn-" });
  const paladin = new Paladin();
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", root);
  await populate.scopes(paladin);
  return paladin;
}

async function until(check, tries = 100) {
  for (let i = 0; i < tries; i++) {
    if (await check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return false;
}

const linger = (process) => ({
  process,
  instance: "spawn",
  mount: "/tmp",
  detached: false,
  env: {},
  cmd: ["deno", "eval", "setTimeout(() => Deno.exit(0), 400)"],
});

// attached spawn arms OS signal handlers (production teardown) — sanitizers off for that.
Deno.test({
  name: "ledger.boot: spawn a set, lock written then removed on exit",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();

    const processes = await paladin.ledger.boot([linger("alpha"), linger("beta")]);
    assertEquals(processes.length, 2);
    assert(processes.every((process) => process.pid > 0));

    const live = await paladin.ledger.lock("spawn", "alpha").read();
    assertEquals(live?.pid, processes[0].pid);

    await Promise.all(processes.map((process) => process.status));
    const cleared = await until(async () => (await paladin.ledger.lock("spawn", "alpha").read()) === null);
    assert(cleared, "lock removed after exit");
  },
});
