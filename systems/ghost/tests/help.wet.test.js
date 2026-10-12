import { assert, assertEquals } from "@std/assert";
import { viva } from "./subprocess.js";

async function mkHome() {
  return await Deno.makeTempDir({ prefix: "help-wet-" });
}

function listing(out) {
  const lines = out.split("\n");
  const start = lines.lastIndexOf("{");
  return JSON.parse(lines.slice(start).join("\n"));
}

Deno.test("--help --json lists every nature with edge metadata", async () => {
  const home = await mkHome();
  const { code, out } = await viva(["--help", "--json"], { env: { HOME: home } });
  assertEquals(code, 0);
  const held = listing(out);
  const natures = held.commands.map((command) => command.nature);
  assert(natures.includes("instance/clone"));
  assert(natures.includes("registry/tap"));
  assert(!natures.includes("help"));
  const clone = held.commands.find((command) => command.nature === "instance/clone");
  assertEquals(clone.params.map((param) => param.name), ["source", "target", "use", "install", "slug"]);
  // a flag is declared, never inferred — the value-carrying --slug is one, the positionals are not.
  assertEquals(clone.params.filter((param) => param.group === "flags").map((param) => param.name), ["use", "install", "slug"]);
  assert(natures.includes("instance/use"));
  assert(!natures.includes("instances/use"));
  assert(held.flags.includes("--instance=<slug|path>"));
  assert(clone.valence.startsWith("create an instance"));
  assert(held.flags.includes("--json"));
});

Deno.test("help prefix narrows to one noun", async () => {
  const home = await mkHome();
  const { out } = await viva(["instance", "--help", "--json"], { env: { HOME: home } });
  const held = listing(out);
  assert(held.commands.length > 1);
  for (const command of held.commands) assert(command.nature.startsWith("instance"));
});

Deno.test("exact nature details params with descriptions", async () => {
  const home = await mkHome();
  const { out } = await viva(["instance/clone", "--help", "--json"], { env: { HOME: home } });
  const held = listing(out);
  assertEquals(held.commands.length, 1);
  const [clone] = held.commands;
  assert(clone.params.every((param) => param.description.length > 0));
});

Deno.test("--help on a nature runs nothing; an exact nature wins over its prefix", async () => {
  const home = await mkHome();
  const { code, out } = await viva(["instance/use", "--help", "--json"], { env: { HOME: home } });
  assertEquals(code, 0);
  const held = listing(out);
  assertEquals(held.commands.map((command) => command.nature), ["instance/use"]);
});

Deno.test("bare viva is the client; in a pipe with no instance selected it refuses and names instance/use", async () => {
  const home = await mkHome();
  const { code, err } = await viva([], { env: { HOME: home } });
  assertEquals(code, 1);
  assert(err.includes("viva instance/use"));
});

Deno.test("viva --help renders the listing", async () => {
  const home = await mkHome();
  const { code, out } = await viva(["--help"], { env: { HOME: home } });
  assertEquals(code, 0);
  assert(out.includes("registry/tap"));
  assert(out.includes("instance/clone"));
});

Deno.test("unknown nature hints at --help, nested ones too, and help itself is no verb", async () => {
  const home = await mkHome();
  for (const argv of [["bogus"], ["instance/bogus"], ["help"]]) {
    const { code, err } = await viva(argv, { env: { HOME: home } });
    assertEquals(code, 127);
    assert(err.includes("no such verb — viva --help"));
  }
});
