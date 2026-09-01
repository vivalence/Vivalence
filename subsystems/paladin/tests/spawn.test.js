import { assert, assertEquals, assertRejects } from "@std/assert";
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

const ENV = { PATH: Deno.env.get("PATH") ?? "", HOME: Deno.env.get("HOME") ?? "" };
const child = (process, script, extra = {}) => ({
  identity: { process, mount: "/tmp" },
  command: { bin: Deno.execPath(), args: ["eval", script], env: ENV, ...extra },
});
const ALIVE = 'console.log("Status:ALIVE"); setTimeout(() => Deno.exit(0), 400);';
const DIES = "Deno.exit(1);";
const MUTE = "setTimeout(() => Deno.exit(0), 5000);";

Deno.test({
  name: "ledger.boot: BOOTING lock with every pid; integrate on ALIVE → ALIVE lock; perpetuate folds exits and clears the lock",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("alpha", ALIVE), child("beta", ALIVE)], { instance: "spawn", attachment: "piped" });
    assertEquals(die.good.processes.length, 2);
    const booting = await paladin.ledger.lock("spawn").read();
    assertEquals(booting.status, "BOOTING");
    assertEquals(booting.pid, Deno.pid);
    assertEquals(booting.processes.map((held) => held.process), ["alpha", "beta"]);
    assert(booting.processes.every((held) => held.pid > 0));

    await die.integrate();
    assertEquals((await paladin.ledger.lock("spawn").read()).status, "ALIVE");
    assert(die.status.is("alive"));
    assert(die.good.processes.every((process) => process.status.is("alive")));

    const { exits, signal } = await die.perpetuate();
    assertEquals(exits.map((exit) => exit.success), [true, true]);
    assertEquals(signal, null);
    assert(die.status.is("exited"));
    assertEquals(await paladin.ledger.lock("spawn").read(), null);
  },
});

Deno.test({
  name: "ledger.boot: a child that exits before ALIVE makes integrate reject, the sibling is disintegrated, the lock is gone",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("dies", DIES), child("mute", MUTE)], { instance: "half", attachment: "piped" });
    await assertRejects(() => die.integrate(), Error, "dies exited 1");
    assert(die.status.is("stopped"));
    const mute = die.good.processes[1];
    assertEquals((await mute.perpetuate()).success, false);
    assertEquals(await paladin.ledger.lock("half").read(), null);
  },
});

Deno.test({
  name: "ledger.boot: no ALIVE line within the deadline rejects and tears down",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("late", MUTE, { deadline: 300 })], { instance: "late", attachment: "piped" });
    await assertRejects(() => die.integrate(), Error, "late not ready after 300 ms");
    assert(die.status.is("stopped"));
    assertEquals(await paladin.ledger.lock("late").read(), null);
  },
});

Deno.test({
  name: "die.disintegrate: SIGTERM within grace stops a sleeper, the lock is gone, the exit is not success",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("sleeper", MUTE)], { instance: "sleeper", attachment: "piped" });
    const settled = die.perpetuate();
    await die.disintegrate("SIGTERM");
    assert(die.status.is("stopped"));
    const { exits, signal } = await settled;
    assertEquals(signal, "SIGTERM");
    assertEquals(exits[0].success, false);
    assertEquals(await paladin.ledger.lock("sleeper").read(), null);
  },
});

Deno.test({
  name: "attachment inherit: integrate resolves without a readiness line",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("quiet", "setTimeout(() => Deno.exit(0), 200);")], { instance: "quiet" });
    await die.integrate();
    assert(die.status.is("alive"));
    const { exits } = await die.perpetuate();
    assertEquals(exits[0].success, true);
  },
});

Deno.test({
  name: "attachment logged: lines land in <ledger>/logs/<instance>/<process>.out.log",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("writer", 'console.log("hello from writer"); ' + ALIVE)], { instance: "logged", attachment: "logged" });
    await die.integrate();
    await die.perpetuate();
    const text = await paladin.read.text(paladin.scope.ledger.branch("/logs/logged/writer.out.log"));
    assert(text.includes("hello from writer"));
    assert(text.includes("Status:ALIVE"));
  },
});

Deno.test({
  name: "a second die for a held instance refuses at resolve, spawns nothing, and the first claim survives",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const first = await paladin.ledger.boot([child("one", MUTE)], { instance: "held", attachment: "piped" });
    const claim = await paladin.ledger.lock("held").read();
    await assertRejects(
      () => paladin.ledger.boot([child("two", MUTE)], { instance: "held", attachment: "piped" }),
      Error,
      "held already running",
    );
    assertEquals(await paladin.ledger.lock("held").read(), claim);
    await first.disintegrate();
    assertEquals(await paladin.ledger.lock("held").read(), null);
  },
});

Deno.test({
  name: "a die releases only its own claim — a foreign live claim survives its teardown",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("mine", MUTE)], { instance: "shared", attachment: "piped" });
    const foreign = { pid: Deno.pid, token: "someone-else", instance: "shared", status: "ALIVE", processes: [] };
    await paladin.ledger.lock("shared").write(foreign);
    await die.disintegrate();
    assertEquals(await paladin.ledger.lock("shared").read(), foreign);
    await paladin.ledger.lock("shared").remove();
  },
});

Deno.test({
  name: "a die without an instance writes no lock",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([child("free", ALIVE)], { attachment: "piped" });
    await die.integrate();
    assertEquals(die.lock, null);
    await die.perpetuate();
  },
});
