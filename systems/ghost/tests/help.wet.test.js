import { assert, assertEquals } from "@std/assert";

const REPO = new URL("../../..", import.meta.url).pathname.replace(/\/$/, "");
const BASE = { PATH: Deno.env.get("PATH") };

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

async function mkHome() {
  return await Deno.makeTempDir({ prefix: "help-wet-" });
}

function listing(out) {
  const lines = out.split("\n");
  const start = lines.lastIndexOf("{");
  return JSON.parse(lines.slice(start).join("\n"));
}

Deno.test("help --json lists every nature with edge metadata", async () => {
  const home = await mkHome();
  const { code, out } = await viva(["help", "--json"], { HOME: home });
  assertEquals(code, 0);
  const held = listing(out);
  const natures = held.commands.map((command) => command.nature);
  assert(natures.includes("instance/create"));
  assert(natures.includes("registry/tap"));
  assert(natures.includes("registry/bootstrap"));
  assert(natures.includes("help"));
  const create = held.commands.find((command) => command.nature === "instance/create");
  assertEquals(create.params.map((param) => param.name), ["source", "target"]);
  assert(create.valence.startsWith("create an instance"));
  assert(held.flags.includes("--json"));
});

Deno.test("help prefix narrows to one noun", async () => {
  const home = await mkHome();
  const { out } = await viva(["help", "instance", "--json"], { HOME: home });
  const held = listing(out);
  assert(held.commands.length > 1);
  for (const command of held.commands) assert(command.nature.startsWith("instance"));
});

Deno.test("exact nature details params with descriptions", async () => {
  const home = await mkHome();
  const { out } = await viva(["help", "instance/create", "--json"], { HOME: home });
  const held = listing(out);
  assertEquals(held.commands.length, 1);
  const [create] = held.commands;
  assert(create.params.every((param) => param.description.length > 0));
});

Deno.test("--help on a nature rewrites into filtered help", async () => {
  const home = await mkHome();
  const { out } = await viva(["instance/create", "--help", "--json"], { HOME: home });
  const held = listing(out);
  assertEquals(held.commands.length, 1);
  assertEquals(held.commands[0].nature, "instance/create");
});

Deno.test("bare viva renders the listing", async () => {
  const home = await mkHome();
  const { code, out } = await viva([], { HOME: home });
  assertEquals(code, 0);
  assert(out.includes("registry/tap"));
  assert(out.includes("instance/create"));
});

Deno.test("unknown nature hints at help", async () => {
  const home = await mkHome();
  const { code, err } = await viva(["bogus"], { HOME: home });
  assertEquals(code, 127);
  assert(err.includes("try: viva help"));
});
