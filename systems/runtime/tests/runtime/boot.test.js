import paladin from "@vivalence/paladin";
import { specimen } from "@vivalence/typology";
import { TextLineStream } from "@std/streams";
import { join } from "@std/path";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const FIXTURES = new URL("../fixtures/", import.meta.url).pathname;
const FILE = "chess.routes.json";
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";
const INSTANCE = "chess";
const READY = /^Status:RUNNING$/;
const DEADLINE = 60_000;
const CARRIED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];

const lines = (stream, into) =>
  stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(new WritableStream({ write: (line) => into(line) }));

function free() {
  const listener = Deno.listen({ port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
}

function routes(strip, path = "") {
  const branches = Object.entries(strip.branches ?? {});
  if (!branches.length) return path ? [path] : [];
  return branches.flatMap(([name, branch]) => routes(branch, `${path}/${name}`)).sort();
}

async function home(source, origin) {
  const held = await Deno.makeTempDir({ prefix: `viva-boot-${INSTANCE}-` });
  for await (const entry of Deno.readDir(source)) {
    if (entry.isFile && entry.name !== ".env") await Deno.copyFile(join(source, entry.name), join(held, entry.name));
  }
  const declared = await Deno.readTextFile(join(source, ".env")).catch(() => "");
  const pinned = `VIVA_RUNTIME_ORIGIN="${origin}"`;
  const rewritten = /^VIVA_RUNTIME_ORIGIN=.*$/m.test(declared) ? declared.replace(/^VIVA_RUNTIME_ORIGIN=.*$/m, pinned) : `${declared}\n${pinned}\n`;
  await Deno.writeTextFile(join(held, ".env"), rewritten);
  return held;
}

describe("runtime boot — the chess instance in a child process, on its own mountpoint and port", () => {
  let child;
  let mount;
  let origin;
  let ready;
  let drained;
  const log = [];

  const call = async (path) => {
    const response = await fetch(`${origin}${path}`);
    expect(response.status).toBe(200);
    return response.json();
  };

  beforeAll(async () => {
    const source = (await paladin.ledger.instances.resolve(INSTANCE)).mount;
    const repository = paladin.scope.repository.absolute;
    origin = `http://localhost:${free()}`;
    mount = await home(source, origin);
    const carried = Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));

    child = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "--no-check", "--config", join(repository, "deno.jsonc"), join(repository, "systems/runtime/run.js")],
      cwd: mount,
      env: {
        ...carried,
        VIVA_INSTANCE_MOUNT: mount,
        VIVA_LEDGER_MOUNT: paladin.scope.ledger.absolute,
        VIVA_REPOSITORY_MOUNT: repository,
        VIVA_REGISTRY_MOUNT: paladin.scope.registry.absolute,
      },
      clearEnv: true,
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    let settled = false;
    let timer;
    const tail = () => log.slice(-20).join("\n");
    const readiness = new Promise((resolve, reject) => {
      drained = Promise.all([
        lines(child.stdout, (line) => {
          log.push(line);
          if (READY.test(line.trim())) resolve(line.trim());
        }),
        lines(child.stderr, (line) => log.push(line)),
      ]);
      child.status.then((exit) => !settled && reject(new Error(`runtime exited ${exit.code} before ready\n${tail()}`)));
      timer = setTimeout(() => reject(new Error(`runtime not ready after ${DEADLINE} ms\n${tail()}`)), DEADLINE);
    });
    try {
      ready = await readiness;
    } finally {
      settled = true;
      clearTimeout(timer);
    }
  });

  afterAll(async () => {
    try {
      child.kill("SIGKILL");
    } catch {
      // already exited
    }
    await child.status;
    await drained;
    await Deno.remove(mount, { recursive: true });
  });

  it("prints the readiness line", () => {
    expect(ready).toBe("Status:RUNNING");
  });

  it("/status settles on RUNNING after the readiness line · /manifest", async () => {
    let status = await call("/status");
    for (let tries = 0; status.code !== "RUNNING" && tries < 40; tries++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      status = await call("/status");
    }
    expect(Object.keys(status)).toEqual(["timestamp", "code"]);
    expect(status.code).toBe("RUNNING");
    expect(await call("/manifest")).toEqual({ slug: "runtime" });
  });

  it("/metadata/instance — the record's manifests", async () => {
    const instance = await call("/metadata/instance");
    expect(Object.keys(instance)).toEqual(["daemons", "services"]);
    expect(instance.daemons.map((daemon) => daemon.slug)).toEqual(["chess"]);
    expect(instance.services).toEqual([{ type: "lighthouse", slug: "multiplayer", traits: [], module: "@commons/lighthouse/multiplayer" }]);
  });

  it("/metadata/daemons · /metadata/services — the wire keys, reference among them", async () => {
    expect(await call("/metadata/daemons")).toEqual([{ slug: "chess", reference: "/daemon/chess", modes: 12, metadata: "/daemon/chess/metadata" }]);
    expect(await call("/metadata/services")).toEqual([
      {
        type: "lighthouse",
        slug: "multiplayer",
        reference: "/attached/process/service/lighthouse/multiplayer",
        metadata: "/attached/process/service/lighthouse/multiplayer/metadata",
      },
    ]);
  });

  it("every process answers under its reference — the daemon behind its authority, the service open", async () => {
    for (const path of ["/daemon/chess/status", "/daemon/chess/manifest"]) {
      const response = await fetch(`${origin}${path}`);
      expect(response.status).toBe(401);
      expect((await response.json()).error.code).toBe("MISSING_TOKEN");
    }
    expect((await call("/attached/process/service/lighthouse/multiplayer/status")).code).toBe("RUNNING");
    expect((await call("/attached/process/service/lighthouse/multiplayer/manifest")).slug).toBe("multiplayer");
  });

  it("the route census — every leaf of /metadata/aperture, held as a fixture", async () => {
    const census = routes(await call("/metadata/aperture"));
    const path = join(FIXTURES, FILE);
    if (HOT) {
      await Deno.writeTextFile(path, JSON.stringify(census, null, 2) + "\n");
      console.log(`[boot HOT] ${census.length} routes → ${path}`);
    }
    const held = JSON.parse(await Deno.readTextFile(path));
    expect(census.length).toBe(held.length);
    expect(census).toEqual(held);
  });

  it("SIGTERM → exit 0, the port released", async () => {
    child.kill("SIGTERM");
    const exit = await child.status;
    expect(exit.code).toBe(0);
    await expect(fetch(`${origin}/status`)).rejects.toThrow();
  });
});
