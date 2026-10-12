import paladin from "@vivalence/paladin";
import { hello } from "@vivalence/runtime/scenarios";
import { fromFileUrl } from "@std/path";

const RUN = fromFileUrl(import.meta.resolve("@vivalence/ghost/run"));

const CARRIED = ["PATH", "HOME", "TMPDIR", "TERM", "LANG", "NO_COLOR"];

const { denoDir } = JSON.parse(
  new TextDecoder().decode((await new Deno.Command(Deno.execPath(), { args: ["info", "--json"] }).output()).stdout),
);

export const { lines } = hello;

export const environment = (env = {}) => ({
  ...Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)])),
  DENO_DIR: denoDir,
  ...env,
});

export const spawn = (argv, { cwd = paladin.scope.repository.absolute, env = {}, stdin = "null", stderr = "piped" } = {}) =>
  new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", paladin.scope.repository.branch("deno.jsonc").absolute, RUN, ...argv],
    cwd,
    env: environment(env),
    clearEnv: true,
    stdin,
    stdout: "piped",
    stderr,
  }).spawn();

export async function viva(argv, { cwd, env, stdin = null } = {}) {
  const child = spawn(argv, { cwd, env, stdin: stdin === null ? "null" : "piped" });
  if (stdin !== null) {
    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode(stdin));
    await writer.close();
  }
  const [status, out, err] = await Promise.all([
    child.status,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  const printed = out.split("\n").filter((line) => line.length > 0);
  return {
    code: status.code,
    out,
    err,
    lines: printed,
    get json() {
      return printed.map((line) => JSON.parse(line));
    },
  };
}
