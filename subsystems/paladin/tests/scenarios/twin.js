import { join } from "@std/path";

const REPOSITORY = new URL("../../../../", import.meta.url);
const absolute = (token, base) => (token.startsWith("./") ? new URL(token, base).href : token);
const rebase = (entries) => Object.fromEntries(Object.entries(entries).map(([key, value]) => [absolute(key, REPOSITORY), absolute(value, REPOSITORY)]));

export async function twin(baked = new URL("./baked.js", import.meta.url).href) {
  const root = JSON.parse(await Deno.readTextFile(new URL("import_map.json", REPOSITORY)));
  const map = {
    imports: {
      ...rebase(root.imports),
      "@vivalence/typology": new URL("subsystems/typology/mod.client.js", REPOSITORY).href,
      "@vivalence/paladin": new URL("subsystems/paladin/mod.client.js", REPOSITORY).href,
      "paladin:baked": baked,
    },
    scopes: Object.fromEntries(Object.entries(root.scopes).map(([scope, entries]) => [absolute(scope, REPOSITORY), rebase(entries)])),
  };
  const home = await Deno.makeTempDir({ prefix: "viva-twin-" });
  await Deno.writeTextFile(join(home, "import_map.json"), JSON.stringify(map));
  const carried = Object.fromEntries(["PATH", "DENO_DIR"].filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));
  const { code, stdout, stderr } = await new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "--no-check",
      "--config",
      new URL("deno.jsonc", REPOSITORY).pathname,
      "--import-map",
      join(home, "import_map.json"),
      new URL("./twin.driver.js", import.meta.url).pathname,
    ],
    cwd: home,
    env: { ...carried, HOME: home, NO_COLOR: "1" },
    clearEnv: true,
  }).output();
  const out = new TextDecoder().decode(stdout);
  const err = new TextDecoder().decode(stderr);
  if (code !== 0) throw new Error(`twin exited ${code}\n${err}`);
  return { ...JSON.parse(out.trim().split("\n").at(-1)), home, stderr: err };
}
