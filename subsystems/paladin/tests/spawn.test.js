import { assert, assertEquals, assertRejects } from "@std/assert";
import { Paladin, lifecycle } from "@vivalence/paladin/typology";
import { FULL } from "../gestalten/belt/index.js";

async function mkPaladin() {
  const root = await Deno.makeTempDir({ prefix: "paladin-spawn-" });
  const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", root);
  await lifecycle.paladin.scopes(paladin);
  lifecycle.paladin.instance(paladin);
  return paladin;
}

const ENV = { PATH: Deno.env.get("PATH") ?? "", HOME: Deno.env.get("HOME") ?? "" };
const child = (process, script, extra = {}) => ({
  identity: { process, mount: "/tmp" },
  command: { bin: Deno.execPath(), args: ["eval", script], env: ENV, ...extra },
});
const DIES = "Deno.exit(1);";
const MUTE = "setTimeout(() => Deno.exit(0), 5000);";
const SERVES = (port, then) => `Deno.serve({ port: ${port}, onListen() {} }, () => new Response("ok")); ${then}`;
const free = () => {
  const listener = Deno.listen({ port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
};
const served = (process, then, extra = {}) => {
  const port = free();
  return { ...child(process, SERVES(port, then), extra), serve: `http://127.0.0.1:${port}/` };
};
const unanswered = (process, script, extra = {}) => ({ ...child(process, script, extra), serve: `http://127.0.0.1:${free()}/` });

Deno.test({
  name: "ledger.boot: SPAWNED lock with every pid; integrate once every served child answers → ALIVE lock; perpetuate folds exits and clears the lock",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([served("alpha", "setTimeout(() => Deno.exit(0), 400);"), served("beta", "setTimeout(() => Deno.exit(0), 400);")], { instance: "spawn", attachment: "piped" });
    assertEquals(die.good.processes.length, 2);
    const booting = await paladin.ledger.lock("spawn").read();
    assertEquals(booting.status, "SPAWNED");
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
  name: "ledger.boot: a served child that exits before answering makes integrate reject, the sibling is disintegrated, the lock is gone",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([unanswered("dies", DIES), child("mute", MUTE)], { instance: "half", attachment: "piped" });
    await assertRejects(() => die.integrate(), Error, "dies exited 1");
    assert(die.status.is("stopped"));
    const mute = die.good.processes[1];
    assertEquals((await mute.perpetuate()).success, false);
    assertEquals(await paladin.ledger.lock("half").read(), null);
  },
});

Deno.test({
  name: "ledger.boot: a served child that never answers within the deadline rejects and tears down",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const die = await paladin.ledger.boot([unanswered("late", MUTE, { deadline: 300 })], { instance: "late", attachment: "piped" });
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
  name: "a child without serve is alive at spawn — integrate resolves without waiting",
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
    const die = await paladin.ledger.boot([served("writer", 'console.log("hello from writer"); setTimeout(() => Deno.exit(0), 400);')], { instance: "logged", attachment: "logged" });
    await die.integrate();
    await die.perpetuate();
    const text = await paladin.read.text(paladin.scope.ledger.branch("/logs/logged/writer.out.log"));
    assert(text.includes("hello from writer"));
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
    const die = await paladin.ledger.boot([child("free", "setTimeout(() => Deno.exit(0), 400);")], { attachment: "piped" });
    await die.integrate();
    assertEquals(die.lock, null);
    await die.perpetuate();
  },
});

Deno.test({
  name: "the lock carries a row per process — each one's serve and status, re-claimed when one exits while its sibling lives",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const brief = served("brief", "setTimeout(() => Deno.exit(3), 300);");
    const steady = served("steady", "setTimeout(() => {}, 60000);");
    const die = await paladin.ledger.boot([brief, steady], { instance: "rows", attachment: "piped" });
    await die.integrate();
    const alive = await paladin.ledger.lock("rows").read();
    assertEquals(alive.processes.map(({ process, serve, status }) => ({ process, serve, status })), [
      { process: "brief", serve: brief.serve, status: "ALIVE" },
      { process: "steady", serve: steady.serve, status: "ALIVE" },
    ]);
    await die.good.processes[0].perpetuate();
    await die.writing;
    const after = await paladin.ledger.lock("rows").read();
    assertEquals(after.status, "ALIVE");
    assertEquals(after.processes.map(({ process, status }) => [process, status]), [["brief", "EXITED"], ["steady", "ALIVE"]]);
    assertEquals(after.processes[0].exit.code, 3);
    assertEquals(after.processes[1].exit, null);
    await die.disintegrate();
    assertEquals(await paladin.ledger.lock("rows").read(), null);
  },
});

Deno.test({
  name: "ledger.boot refuses a port another instance's lock holds, naming the holder; spawns nothing; the holder's claim survives",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const holder = await paladin.ledger.boot([{ ...child("runtime", MUTE), serve: "http://localhost:47010/" }], { instance: "first", attachment: "piped" });
    const claim = await paladin.ledger.lock("first").read();
    const error = await assertRejects(
      () => paladin.ledger.boot([{ ...child("runtime", MUTE), serve: "http://0.0.0.0:47010/" }], { instance: "second", attachment: "piped" }),
      Error,
      "first holds http://localhost:47010/",
    );
    assert(error.message.includes(`under supervisor ${Deno.pid}`));
    assert(error.message.includes("viva instance/stop --instance=first"));
    assertEquals(await paladin.ledger.lock("second").read(), null);
    assertEquals(await paladin.ledger.lock("first").read(), claim);
    const elsewhere = await paladin.ledger.boot([{ ...child("runtime", MUTE), serve: "http://localhost:47011/" }], { instance: "second", attachment: "piped" });
    assertEquals((await paladin.ledger.locks()).map((held) => held.instance).sort(), ["first", "second"]);
    await elsewhere.disintegrate();
    await holder.disintegrate();
    assertEquals(await paladin.ledger.locks(), []);
  },
});

Deno.test({
  name: "ledger.locks reaps a dead supervisor's lock and lists nothing on a ledger without locks/",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    assertEquals(await paladin.ledger.locks(), []);
    await paladin.ledger.lock("gone").write({ pid: 4999999, instance: "gone", processes: [] });
    assertEquals(await paladin.ledger.locks(), []);
    assertEquals(await paladin.ledger.lock("gone").read(), null);
  },
});

Deno.test({
  name: "lock.read asks every process pid: a dead one reads EXITED; all dead reaps the lock though its supervisor lives (a --watch restart keeps the pid)",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const paladin = await mkPaladin();
    const lock = paladin.ledger.lock("watched");
    await lock.write({ pid: Deno.pid, instance: "watched", status: "ALIVE", processes: [{ process: "runtime", pid: 4999999, status: "ALIVE" }, { process: "anima", pid: Deno.pid, status: "ALIVE" }] });
    assertEquals((await lock.read()).processes.map(({ process, status }) => [process, status]), [["runtime", "EXITED"], ["anima", "ALIVE"]]);
    await lock.write({ pid: Deno.pid, instance: "watched", status: "ALIVE", processes: [{ process: "runtime", pid: 4999999, status: "ALIVE" }] });
    assertEquals(await lock.read(), null);
    assertEquals(await paladin.read.json(lock.path, null), null);
  },
});
