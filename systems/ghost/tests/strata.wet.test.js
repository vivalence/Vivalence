import { assertEquals } from "@std/assert";

const REPO = new URL("../../..", import.meta.url).pathname.replace(/\/$/, "");
const BASE = { PATH: Deno.env.get("PATH"), HOME: Deno.env.get("HOME") };

async function viva(args, env = {}) {
  const command = new Deno.Command("deno", {
    args: ["run", "--config", `${REPO}/deno.jsonc`, "--no-check", "-A", `${REPO}/systems/ghost/mod.js`, ...args],
    cwd: REPO,
    env: { ...BASE, ...env },
    clearEnv: true,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  return { code, out: new TextDecoder().decode(stdout), err: new TextDecoder().decode(stderr) };
}

function report(out) {
  const lines = out.split("\n");
  const start = lines.lastIndexOf("{");
  return JSON.parse(lines.slice(start).join("\n"));
}

async function doctor(args, env) {
  const { out, err } = await viva(["ledger/doctor", "--json", ...args], env);
  try {
    return report(out);
  } catch (cause) {
    throw new Error(`doctor unparseable\nstdout: ${out}\nstderr: ${err}`, { cause });
  }
}

function stratumOf(held, key) {
  return held.environment.find((variable) => variable.key === key)?.stratum ?? null;
}

function valueOf(held, key) {
  return held.environment.find((variable) => variable.key === key)?.value ?? null;
}

async function mkHome() {
  const home = await Deno.makeTempDir({ prefix: "strata-wet-" });
  await Deno.mkdir(`${home}/sessions`, { recursive: true });
  return home;
}

async function seedInstance(slug) {
  const dir = await Deno.makeTempDir({ suffix: `-${slug}` });
  await Deno.mkdir(`${dir}/environment`, { recursive: true });
  await Deno.writeTextFile(
    `${dir}/${slug}.viva.js`,
    `export const manifest = { type: "instance", slug: "${slug}" };\n`,
  );
  return dir;
}

Deno.test("ladder peel — six rungs, doctor names each winner", async () => {
  const home = await mkHome();
  const byFlag = await seedInstance("byflag");
  const byCwd = await seedInstance("bycwd");
  const byEnvFile = await seedInstance("byenvfile");
  const byOs = await seedInstance("byos");
  const bySession = await seedInstance("bysession");
  const byLedger = await seedInstance("byledger");

  const envDir = await Deno.makeTempDir();
  await Deno.writeTextFile(`${envDir}/.env`, `VIVA_INSTANCE_MOUNT=${byEnvFile}\n`);
  const shell = String(Deno.pid);
  await Deno.writeTextFile(
    `${home}/sessions/${shell}.json`,
    JSON.stringify({ VIVA_INSTANCE_MOUNT: bySession }),
  );
  await Deno.writeTextFile(`${home}/.env`, `VIVA_INSTANCE_MOUNT=${byLedger}\n`);

  const base = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: shell };
  const rungs = [
    ["flag", byFlag, [`--instance=${byFlag}`], { ...base, INIT_CWD: byCwd, VIVA_INSTANCE_MOUNT: byOs }],
    ["cwd", byCwd, [], { ...base, INIT_CWD: byCwd, VIVA_INSTANCE_MOUNT: byOs }],
    [".env", byEnvFile, [], { ...base, INIT_CWD: envDir, VIVA_INSTANCE_MOUNT: byOs }],
    ["os", byOs, [], { ...base, INIT_CWD: envDir, VIVA_INSTANCE_MOUNT: byOs }],
    ["session", bySession, [], { ...base, INIT_CWD: envDir }],
    ["ledger", byLedger, [], { VIVA_LEDGER_MOUNT: home, INIT_CWD: envDir }],
  ];
  for (const [expected, value, args, env] of rungs) {
    if (expected === "os") await Deno.remove(`${envDir}/.env`);
    const held = await doctor(args, env);
    assertEquals(stratumOf(held, "VIVA_INSTANCE_MOUNT"), expected, `rung ${expected}`);
    assertEquals(valueOf(held, "VIVA_INSTANCE_MOUNT"), value, `rung ${expected} value`);
  }
});

Deno.test("two shells select two instances in parallel", async () => {
  const home = await mkHome();
  const italian = await seedInstance("italian");
  const spanish = await seedInstance("spanish");
  const neutral = await Deno.makeTempDir();
  const one = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: "61001", INIT_CWD: neutral };
  const two = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: "61002", INIT_CWD: neutral };
  await viva(["instances/use", italian], one);
  await viva(["instances/use", spanish], two);
  const [first, second] = await Promise.all([doctor([], one), doctor([], two)]);
  assertEquals(valueOf(first, "VIVA_INSTANCE_MOUNT"), italian);
  assertEquals(valueOf(second, "VIVA_INSTANCE_MOUNT"), spanish);
  assertEquals(stratumOf(first, "VIVA_INSTANCE_MOUNT"), "session");
});

Deno.test("chain landmine — standing in an instance dir, cwd outranks the fresh selection", async () => {
  const home = await mkHome();
  const standing = await seedInstance("standing");
  const selected = await seedInstance("selected");
  const env = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: "61003", INIT_CWD: standing };
  await viva(["instances/use", selected], env);
  const held = await doctor([], env);
  assertEquals(stratumOf(held, "VIVA_INSTANCE_MOUNT"), "cwd");
  assertEquals(valueOf(held, "VIVA_INSTANCE_MOUNT"), standing);
});

Deno.test("doctor prunes dead-pid sessions, keeps live, never surfaces secret values", async () => {
  const home = await mkHome();
  const corpse = new Deno.Command("deno", { args: ["eval", ""], stdout: "null", stderr: "null" }).spawn();
  const dead = corpse.pid;
  await corpse.status;
  await Deno.writeTextFile(`${home}/sessions/${dead}.json`, JSON.stringify({ VIVA_INSTANCE_MOUNT: "/gone" }));
  await Deno.writeTextFile(
    `${home}/sessions/${Deno.pid}.json`,
    JSON.stringify({ VIVA_INSTANCE_MOUNT: "/alive" }),
  );
  const neutral = await Deno.makeTempDir();
  const held = await doctor([], {
    VIVA_LEDGER_MOUNT: home,
    INIT_CWD: neutral,
    SECRET_VIVA_PROBE_DARK: "never-printed",
  });
  assertEquals(held.sessions.map((session) => session.shell), [Deno.pid]);
  assertEquals(await Deno.stat(`${home}/sessions/${dead}.json`).catch(() => null), null);
  assertEquals(JSON.stringify(held).includes("never-printed"), false);
});

Deno.test("--env: a knowledge-bearing file lands @.env; a hollow one exits loud", async () => {
  const home = await mkHome();
  const byEnvFlag = await seedInstance("byenvflag");
  const dir = await Deno.makeTempDir();
  await Deno.writeTextFile(`${dir}/knowledge.env`, `VIVA_INSTANCE_MOUNT=${byEnvFlag}\n`);
  await Deno.writeTextFile(`${dir}/hollow.env`, "NOTHING=here\n");
  const neutral = await Deno.makeTempDir();
  const env = { VIVA_LEDGER_MOUNT: home, INIT_CWD: neutral };
  const held = await doctor([`--env=${dir}/knowledge.env`], env);
  assertEquals(stratumOf(held, "VIVA_INSTANCE_MOUNT"), ".env");
  const { code, err } = await viva(["ledger/doctor", "--json", `--env=${dir}/hollow.env`], env);
  assertEquals(code === 0, false);
  assertEquals(err.includes("no VIVA_* knowledge"), true);
});

Deno.test("path law — ./dotted and bare dir/sub both pin to the shell cwd, slugs stay symbolic", async () => {
  const home = await mkHome();
  const stand = await Deno.makeTempDir();
  for (const dir of ["dotted", "apps/nested"]) {
    await Deno.mkdir(`${stand}/${dir}/environment`, { recursive: true });
    const slug = dir.split("/").pop();
    await Deno.writeTextFile(
      `${stand}/${dir}/${slug}.viva.js`,
      `export const manifest = { type: "instance", slug: "${slug}" };\n`,
    );
  }
  const env = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: String(Deno.pid), INIT_CWD: stand };

  await viva(["instances/use", "./dotted"], env);
  let session = JSON.parse(await Deno.readTextFile(`${home}/sessions/${Deno.pid}.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, `${stand}/dotted`);

  await viva(["instances/use", "apps/nested"], env);
  session = JSON.parse(await Deno.readTextFile(`${home}/sessions/${Deno.pid}.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, `${stand}/apps/nested`);

  const elsewhere = await Deno.makeTempDir();
  const held = await doctor([], { ...env, INIT_CWD: elsewhere });
  assertEquals(held.environment.find((v) => v.key === "VIVA_INSTANCE_MOUNT").value, `${stand}/apps/nested`);
  assertEquals(held.environment.find((v) => v.key === "VIVA_INSTANCE_MOUNT").stratum, "session");

  const refused = await viva(["instances/use", "bareword", "--json"], env);
  assertEquals(refused.out.includes("bareword"), true);
  session = JSON.parse(await Deno.readTextFile(`${home}/sessions/${Deno.pid}.json`));
  // m44: a bareword with no record row is an honest error, never a shelf guess — nothing stored
  assertEquals(session.VIVA_INSTANCE_MOUNT, `${stand}/apps/nested`);

  await Deno.writeTextFile(
    `${home}/instances.json`,
    JSON.stringify({ bareword: { mount: `${stand}/dotted` } }),
  );
  await viva(["instances/use", "bareword"], env);
  session = JSON.parse(await Deno.readTextFile(`${home}/sessions/${Deno.pid}.json`));
  // m44: a recorded slug resolves through the RECORD's mount, not the shelf name
  assertEquals(session.VIVA_INSTANCE_MOUNT, `${stand}/dotted`);
});

Deno.test("path law — --instance flag pins the same way", async () => {
  const home = await mkHome();
  const stand = await Deno.makeTempDir();
  await Deno.mkdir(`${stand}/flagged/environment`, { recursive: true });
  await Deno.writeTextFile(
    `${stand}/flagged/flagged.viva.js`,
    `export const manifest = { type: "instance", slug: "flagged" };\n`,
  );
  const env = { VIVA_LEDGER_MOUNT: home, INIT_CWD: stand };
  const held = await doctor(["--instance=./flagged"], env);
  assertEquals(held.environment.find((v) => v.key === "VIVA_INSTANCE_MOUNT").value, `${stand}/flagged`);
  assertEquals(held.environment.find((v) => v.key === "VIVA_INSTANCE_MOUNT").stratum, "flag");
});

Deno.test("chaining through the real CLI — use <path> doctor --json returns the doctor report", async () => {
  const home = await mkHome();
  const stand = await Deno.makeTempDir();
  await Deno.mkdir(`${stand}/chained/environment`, { recursive: true });
  await Deno.writeTextFile(
    `${stand}/chained/chained.viva.js`,
    `export const manifest = { type: "instance", slug: "chained" };\n`,
  );
  const env = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: String(Deno.pid), INIT_CWD: stand };
  const { out, err } = await viva(["instances/use", "./chained", "doctor", "--json"], env);
  assertEquals(err.includes("NOT_FOUND"), false, err);
  const held = report(out);
  assertEquals(held.mount, `${stand}/chained`);
});

Deno.test("bare effects print — use without --json renders human, an ink view suppresses the default", async () => {
  const home = await mkHome();
  const stand = await Deno.makeTempDir();
  const env = { VIVA_LEDGER_MOUNT: home, VIVA_PROCESS_ID: String(Deno.pid), INIT_CWD: stand };
  const bare = await viva(["instances/use"], env);
  assertEquals(bare.out.includes("stratum"), true);
  assertEquals(bare.out.trimStart().startsWith("{"), false);
  const doctorRun = await viva(["ledger/doctor"], env);
  assertEquals(doctorRun.out.includes("viva doctor"), true);
  assertEquals(doctorRun.out.trimEnd().endsWith("}"), false);
});
