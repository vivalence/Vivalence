// walk — boot the runtime of ONE copy on HIS localhost recipe (a scratch ledger, a scratch mountpoint, a free port,
// provider keys that are not keys), then read what every host serves. Nothing of his is written: the ledger and the
// instance are copies, his registry packages are mounted where they lie and only read.
//   deno run -A walk.js <copy-root> <label>
import { join } from "jsr:@std/path@1";

const [COPY, LABEL] = Deno.args;
const HOME = Deno.env.get("HOME");
const VIVA = join(HOME, ".viva");
const root = await Deno.makeTempDir({ prefix: `viva-walk-${LABEL}-` });
await Deno.mkdir(join(root, "ledger"));
await Deno.mkdir(join(root, "instance"), { recursive: true });
const run = async (bin, args) => {
  const { code, stderr } = await new Deno.Command(bin, { args, stdout: "null", stderr: "piped" }).output();
  if (code) throw new Error(`${bin} ${args.join(" ")} — ${new TextDecoder().decode(stderr)}`);
};
const lived = join(VIVA, "instances/localhost/mountpoint");
await run("rsync", ["-a", "--exclude", "*.db", "--exclude", "*.db-*", `${lived}/`, join(root, "instance/mountpoint/")]);
await run("sqlite3", [`file:${join(lived, "localhost.viva.db")}?mode=ro`, `.backup '${join(root, "instance/mountpoint/localhost.viva.db")}'`]);
await Deno.mkdir(join(root, "home"));
for (const file of ["ledger.viva.json", "environment.json"]) await Deno.copyFile(join(VIVA, file), join(root, "ledger", file));
await Deno.copyFile(join(VIVA, "instances/localhost/instance.viva.jsonc"), join(root, "instance/instance.viva.jsonc"));
const registry = JSON.parse(await Deno.readTextFile(join(VIVA, "registry.json")));
for (const entry of Object.values(registry)) {
  if (entry.mount.startsWith("./")) entry.mount = join(VIVA, entry.mount);
  else entry.mount = entry.mount.replace(join(HOME, "vivalence/code/vivalence"), COPY.replace(/\/$/, ""));
}
await Deno.writeTextFile(join(root, "ledger/registry.json"), JSON.stringify(registry, null, 2));
await Deno.writeTextFile(join(root, "ledger/instances.json"), JSON.stringify({ localhost: { mount: join(root, "instance") } }));

const listener = Deno.listen({ port: 0 });
const { port } = listener.addr;
listener.close();
const origin = `http://localhost:${port}`;
const envfile = (path) => Deno.readTextFile(path).catch(() => "");
const service = Object.fromEntries(
  ((await envfile(join(VIVA, ".env"))) + "\n" + (await envfile(join(VIVA, "instances/localhost/.env"))))
    .split("\n")
    .filter((row) => /^VIVA_SERVICE_[A-Z_]+=/.test(row))
    .map((row) => [row.slice(0, row.indexOf("=")), row.slice(row.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const env = {
  PATH: Deno.env.get("PATH"),
  HOME: join(root, "home"),
  DENO_DIR: Deno.env.get("DENO_DIR"),
  NO_COLOR: "1",
  VIVA_INSTANCE_MOUNT: join(root, "instance"),
  VIVA_LEDGER_MOUNT: join(root, "ledger"),
  VIVA_REPOSITORY_MOUNT: COPY,
  VIVA_REGISTRY_MOUNT: join(VIVA, "registry"),
  VIVA_RUNTIME_ORIGIN: origin,
  VIVA_RUNTIME_SERVE: `${origin}/`,
  PUBLIC_VIVA_RUNTIME_REMOTE: `${origin}/`,
  VIVA_CLIENT_ANIMA_ORIGIN: "http://localhost:1",
  VIVA_CLIENT_ANIMA_SERVE: "http://localhost:1/",
  SECRET_VIVA_JWT: "walk-secret-walk-secret-walk-secret",
  SECRET_VIVA_ANTHROPIC_API_KEY: "walk-not-a-key",
  SECRET_VIVA_OPENROUTER_API_KEY: "walk-not-a-key",
  SECRET_VIVA_ELEVENLABS_API_KEY: "walk-not-a-key",
  ...service,
};
const child = new Deno.Command(Deno.execPath(), {
  args: ["run", "-A", "--no-check", "--config", join(COPY, "deno.jsonc"), join(COPY, "systems/runtime/run.js")],
  cwd: join(root, "instance"),
  env,
  clearEnv: true,
  stdin: "null",
  stdout: "piped",
  stderr: "piped",
}).spawn();
const log = [];
const pump = async (stream) => {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  let rest = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const rows = (rest + value).split("\n");
    rest = rows.pop();
    log.push(...rows);
  }
};
pump(child.stdout);
pump(child.stderr);
let exited = null;
child.status.then((status) => (exited = status.code));

const report = { label: LABEL, port };
try {
  const READY = /^\[runtime\/[^/\]]+\] start\s*$/;
  const started = Date.now();
  while (!log.some((row) => READY.test(row.trim()))) {
    if (exited !== null) throw new Error(`runtime exited ${exited} before ready\n${log.slice(-25).join("\n")}`);
    if (Date.now() - started > 240000) throw new Error(`not ready after 240s\n${log.slice(-25).join("\n")}`);
    await new Promise((wake) => setTimeout(wake, 250));
  }
  report.ready = `${Math.round((Date.now() - started) / 100) / 10}s`;
  const post = (path, body, token) =>
    fetch(`${origin}${path}`, { method: "POST", headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) }, body: JSON.stringify(body) });
  const get = (path, token) => fetch(`${origin}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  await (await post("/lighthouse/signup", { username: "walker", password: "hunter22" })).json();
  const login = await (await post("/lighthouse/login", { username: "walker", password: "hunter22" })).json();
  const token = login.authority.access;
  const read = async (path) => {
    const response = await get(path, token);
    if (response.status !== 200) {
      await response.body?.cancel();
      return { status: response.status };
    }
    return await response.json();
  };
  const tally = (faculties) =>
    Array.isArray(faculties)
      ? Object.entries(Object.groupBy(faculties, (faculty) => faculty.type)).map(([type, held]) => `${type}:${held.length}`).sort().join(" ")
      : `status ${faculties.status}`;
  report.status = (await (await get("/beacon/status")).json()).code;
  report.dormant = log.filter((row) => /^\[instance\] .* filtered/.test(row)).map((row) => row.replace(/^\[instance\] /, "").replace(/ filtered.*/, ""));
  report.hosts = {};
  const hosts = ["/runtime/runtime", "/daemon/chess", "/daemon/droneaid", "/daemon/spanish"];
  for (const host of hosts) {
    const modes = await read(`${host}/metadata/modes`);
    const cortex = await read(`${host}/metadata/cortex`);
    const tiers = await get(`${host}/metadata/tiers`, token);
    await tiers.body?.cancel();
    const served = [];
    for (const mode of Array.isArray(modes) ? modes : []) {
      const own = await read(`${mode.metadata}/cortex`);
      const manifest = await read(`${mode.metadata}/manifest`);
      served.push({ mode: `${mode.type}/${mode.slug}`, cortex: tally(own), traits: (manifest.traits ?? []).join(" ") });
    }
    const counts = Object.entries(Object.groupBy(served, (row) => row.cortex)).map(([cortex, rows]) => `${rows.length}× ${cortex}`);
    report.hosts[host] = {
      cortex: tally(cortex),
      tiers: tiers.status,
      modes: Array.isArray(modes) ? modes.length : modes,
      modeCortex: counts,
      modeList: served.map((row) => row.mode).join(" "),
      harnessed: served.filter((row) => row.traits.split(" ").includes("HARNESSED")).length,
      conversational: served.filter((row) => row.traits.split(" ").includes("CONVERSATIONAL")).length,
    };
  }
  const worn = await read("/runtime/runtime/metadata/cortex");
  report.sample = Array.isArray(worn) ? worn.slice(0, 2).map(({ type, id, provider, tier, tune }) => ({ type, id, provider, tier, tune })) : worn;
  const strip = await read("/runtime/runtime/mode/harness/runtime/metadata/harness");
  report.harness = strip.status ? strip : { keys: Object.keys(strip), tools: Object.keys(strip.tools?.branches ?? {}).length };
  report.warnings = log.filter((row) => /\[provider\]|refused|Error|TypeError|Uncaught/.test(row)).slice(0, 12).map((row) => row.slice(0, 220));
} catch (error) {
  report.error = String(error.message).slice(0, 2500);
} finally {
  if (exited === null) child.kill("SIGTERM");
  await child.status;
  report.exit = exited;
  await Deno.writeTextFile(join(root, "runtime.log"), log.join("\n"));
  report.log = join(root, "runtime.log");
}
console.log(JSON.stringify(report, null, 1));
