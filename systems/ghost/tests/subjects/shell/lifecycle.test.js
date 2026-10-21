// m93 Q6 · law 3 (execute) + m96 ruling 4: against a world, factories.client hands back its Client at the run's end; the door's boot beat passes a reachable runtime and refuses a stranger; /help strips the shell.
// m96 law 9: `viva --help` exits 0 under an empty HOME — the shell answers help before the door's `seat` beat resolves an instance; repl · chrome stay loud naming what is missing.
import { join } from "@std/path";
import { Argv, Connection, Controller, Path, Span, Url, Vector, shape, specimen, steer } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";
import { boot as door } from "../../../subjects/shell/lifecycle/boot.js";
import * as shell from "../../../subjects/shell/index.js";

const eventually = async (predicate, ms) => {
  const deadline = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting ${ms}ms`);
    await new Promise((wake) => setTimeout(wake, 25));
  }
};

const logged = async (work) => {
  const lines = [];
  const original = console.log;
  console.log = (text) => lines.push(text);
  try {
    await work();
  } finally {
    console.log = original;
  }
  return lines;
};

specimen.describe("the door against a world — boot passes a reachable runtime, refuses a stranger; /help strips; factories.client hands back its Client", { sanitizeOps: false, sanitizeResources: false }, () => {
  let world = null;
  let instance = null;
  let mask = null;
  let register = null;
  specimen.beforeAll(async () => {
    world = await hello.boot({ recipe: hello.DEMO, prefix: "viva-door-" });
    paladin.assign(world.env, "flag");
    instance = await factories.instance(lifecycle.paladin.instance(paladin));
    await paladin.ledger.registry.supply();
    mask = instance.clients.find((client) => client.manifest.slug === "ghost");
    register = await paladin.ledger.registry.wire(mask);
  });
  specimen.afterAll(async () => {
    await world.stop();
  });

  specimen.it("boot: a reachable runtime is not booted again — the beat passes, nothing is said", async () => {
    const shellDie = { controller: new Controller({ stdout: new Span("ghost") }), instance, mask, register };
    let passed = false;
    await door(shellDie, async () => {
      passed = true;
    });
    specimen.expect(passed).toBe(true);
    specimen.expect(shellDie.controller.stdout.history.filter((record) => ["log"].includes(record.track))).toEqual([]);
  });

  specimen.it("boot: an unreachable runtime whose home is no instance of this ledger throws — not this machine's to start", async () => {
    const stranger = { home: new Path("/nowhere/stranger"), runtime: { statics: { remote: "http://127.0.0.1:9/" } } };
    const shellDie = { controller: new Controller({ stdout: new Span("ghost") }), instance: stranger, mask, register };
    await specimen.expect(door(shellDie, async () => {})).rejects.toThrow("not this machine's to start");
  });

  specimen.it("/help strips the shell: help · chrome · paladin's commands under the root; --help strips before any door opens", async () => {
    const routed = await logged(() => steer.dispatch.execute(shell.lifecycle.execution, { controller: new Controller({ stdout: new Span("ghost") }), signal: new Argv(["help", "--json"]), instance, mask, register }, "/help"));
    specimen.expect(Object.keys(JSON.parse(routed[0]).branches)).toEqual(["help", "chrome", "instance", "ledger", "registry"]);
    const flagged = await logged(() => steer.dispatch.execute(shell.lifecycle.execution, { controller: new Controller({ stdout: new Span("ghost") }), signal: new Argv(["help", "--help", "--json"]), instance, mask, register }, "/help"));
    specimen.expect(flagged).toEqual(routed);
    const listed = await logged(() => steer.dispatch.execute(shell.lifecycle.execution, { controller: new Controller({ stdout: new Span("ghost") }), signal: new Argv(["help"]), instance, mask, register }, "/help"));
    specimen.expect(listed[0].startsWith("viva · 26 commands\n")).toBe(true);
  });

  specimen.it("client.factory: hands back the Client RUNNING against the world; the runtime keeps the user a terminal — the last closed, a fresh one streams in; a kill settles it STOPPED", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    const clientDie = await ghost.client.factory({ controller: root, mask, register, instance });
    specimen.expect(clientDie).toBeInstanceOf(ghost.client.Client);
    specimen.expect(clientDie.controller.status.is("RUNNING")).toBe(true);
    const terminals = () => clientDie.runtime.entities.terminal.$entities.get();
    await eventually(() => clientDie.runtime !== null && terminals().length === 1, 30000);
    const [closed] = terminals();
    await clientDie.runtime.entities.terminal.removeOne({ id: closed.id });
    await eventually(() => terminals().length === 1 && terminals()[0].id !== closed.id, 10000);
    specimen.expect(terminals()[0].index).toBe(0);

    clientDie.controller.kill("SIGTERM", "quit");
    await clientDie.controller.settled;
    specimen.expect(clientDie.controller.status.reflection.code).toBe("STOPPED");
    specimen.expect(root.status.is("IDLE")).toBe(true);
  });

  specimen.it("boot: the runtime gone, the ledger's instance is booted through paladin.ledger.boot — reachable inside the beat, disintegrated after it", async () => {
    world.child.kill("SIGKILL");
    await world.child.status;
    const remote = new Url(instance.runtime.statics.remote);
    const reached = () => new Connection(remote).call("/status").then(() => true, () => false);
    specimen.expect(await reached()).toBe(false);
    for (const [key, value] of Object.entries(world.env)) Deno.env.set(key, value);
    const listed = { runtime: instance.runtime, home: new Path(await Deno.realPath(instance.home.absolute)) };
    const shellDie = { controller: new Controller({ stdout: new Span("ghost") }), instance: listed, mask, register };
    let inside = null;
    try {
      await door(shellDie, async () => {
        inside = await reached();
      });
    } finally {
      for (const key of Object.keys(world.env)) Deno.env.delete(key);
    }
    specimen.expect(inside).toBe(true);
    specimen.expect(shellDie.controller.stdout.history.filter((record) => ["log"].includes(record.track)).map((record) => Object.keys(record.data))).toEqual([["booting", "log"]]);
    specimen.expect(await reached()).toBe(false);
  });
});

const REPOSITORY = new URL("../../../../../", import.meta.url).pathname;
const RUN = new URL("../../../run.js", import.meta.url).pathname;
const CARRIED = ["PATH", "TMPDIR", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];

const viva = async (home, args, env = {}) => {
  const carried = Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));
  const output = await new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", join(REPOSITORY, "deno.jsonc"), RUN, ...args],
    cwd: home,
    env: { ...carried, HOME: home, NO_COLOR: "1", ...env },
    clearEnv: true,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).output();
  const decoder = new TextDecoder();
  return { code: output.code, stdout: decoder.decode(output.stdout), stderr: decoder.decode(output.stderr) };
};

const SHELL = {
  help: "the shell's commands. Example: viva help",
  chrome: "the repl under the chrome — the dock paints. Example: viva chrome",
  "instance/tail": "follow a running ghost's spans from another terminal. Example: viva instance/tail",
  "instance/tail/ghost": "follow a running ghost's spans, every branch. Example: viva instance/tail/ghost",
  "instance/tail/client": "follow a running ghost's client spans only. Example: viva instance/tail/client",
};
const valences = (node, route = "") =>
  Object.entries(node.branches).reduce(
    (found, [segment, child]) => ({
      ...found,
      ...(child.effect ? { [`${route}${segment}`]: child.effect.valence } : {}),
      ...valences(child, `${route}${segment}/`),
    }),
    {},
  );
const VERBS = { ...SHELL, ...valences(shape.strip(paladin.commands)) };

specimen.describe("the shell under an empty HOME — help answers without an instance; a door names what is missing", () => {
  let home = null;
  specimen.beforeEach(async () => {
    home = await Deno.makeTempDir({ prefix: "viva-shell-" });
  });
  specimen.afterEach(async () => {
    await Deno.remove(home, { recursive: true });
  });

  specimen.it("--help exits 0 and strips the shell's commands; nothing is written under HOME", async () => {
    const ran = await viva(home, ["--help", "--json"]);
    specimen.expect(ran.stderr).toBe("");
    specimen.expect(ran.code).toBe(0);
    specimen.expect(valences(JSON.parse(ran.stdout))).toEqual(VERBS);
    specimen.expect([...Deno.readDirSync(home)]).toEqual([]);
  });

  specimen.it("help lists every command the --json strip holds, one nature each, no JSON", async () => {
    const stripped = await viva(home, ["help", "--json"]);
    const listed = await viva(home, ["help"]);
    specimen.expect(listed.code).toBe(0);
    const natures = Object.keys(valences(JSON.parse(stripped.stdout))).map((route) => `/${route}`);
    const shown = listed.stdout.split("\n").filter((printed) => printed.startsWith("  /")).map((printed) => printed.trim().split(" ")[0]);
    specimen.expect(shown).toEqual(natures);
  });

  specimen.it("help --json exits 0 with the same strip as --help --json", async () => {
    const ran = await viva(home, ["help", "--json"]);
    specimen.expect(ran.code).toBe(0);
    specimen.expect(valences(JSON.parse(ran.stdout))).toEqual(VERBS);
  });

  specimen.it("chrome exits 1 naming the missing instance", async () => {
    const ran = await viva(home, ["chrome"]);
    specimen.expect(ran.code).toBe(1);
    specimen.expect(ran.stderr).toContain("viva /chrome: instance: nothing selected");
  });

  specimen.it("chrome against an instance that masks no ghost client exits 1 naming the absent mask", async () => {
    const mount = join(home, "bare");
    await Deno.mkdir(mount);
    await Deno.writeTextFile(join(mount, "instance.viva.json"), JSON.stringify({ manifest: { type: "instance", slug: "bare" } }));
    const ran = await viva(home, ["chrome"], { VIVA_INSTANCE_MOUNT: mount });
    specimen.expect(ran.code).toBe(1);
    specimen.expect(ran.stderr).toContain(`viva /chrome: instance ${mount} masks no ghost client — no client at all`);
  });
});
