import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { boot, exists, ledger, pin, viva } from "./rig.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

describe("T-fresh — a clean ledger, ghost's verbs, hello-world from the JSON recipe, the runtime-level home", () => {
  let world;
  let shelf;
  let runtime;
  let finn;

  beforeAll(async () => {
    world = await ledger("viva-qa-fresh-");
  });

  afterAll(async () => {
    await runtime?.stop("SIGKILL");
    await world.remove();
  });

  it("ledger/init scaffolds the ledger home: ledger.viva.json, instances.json, registry — commons tapped", async () => {
    const { code, effect, err } = await viva(world, ["ledger/init"]);
    expect([code, effect?.error ?? null]).toEqual([0, null]);
    for (const file of ["ledger.viva.json", "instances.json"]) expect([file, await exists(join(world.root, "ledger", file))]).toEqual([file, true]);
    expect(JSON.parse(await Deno.readTextFile(join(world.root, "ledger/registry.json")))).toEqual({ "@commons": { slug: "commons", mount: effect.commons } });
    expect(effect.commons.endsWith("/commons")).toBe(true);
    expect(err).not.toContain("Error");
  });

  it("instance/create hello-world --use --init clones the JSON recipe to the shelf, selects it, mints the jwt", async () => {
    const { effect, err } = await viva(world, ["instance/create", "hello-world", "--use", "--init"]);
    expect(effect?.slug ?? err).toBe("hello-world");
    shelf = effect.target;
    expect(JSON.parse(await Deno.readTextFile(join(shelf, "instance.viva.json"))).manifest.slug).toBe("hello-world");
    expect(await exists(join(shelf, "instance.viva.js"))).toBe(false);
    expect(await exists(join(shelf, "mountpoint"))).toBe(false);
    const record = JSON.parse(await Deno.readTextFile(join(world.root, "ledger/instances.json")));
    expect(record["hello-world"].mount).toBe(shelf);
    const environment = await Deno.readTextFile(join(shelf, ".env"));
    const jwt = environment.split("\n").find((line) => line.startsWith("SECRET_VIVA_JWT="));
    expect(jwt !== undefined && jwt.length >= "SECRET_VIVA_JWT=".length + 24).toBe(true);
    expect(effect.initialized.env).toBe("present");
    await pin(shelf, { VIVA_RUNTIME_ORIGIN: world.origin });
  });

  it("instance/use hello-world --ledger selects it for every later verb on this ledger", async () => {
    const { effect, err } = await viva(world, ["instance/use", "hello-world", "--ledger"]);
    expect(effect?.selected ?? err).toBe(shelf);
    expect(effect.stratum).toBe("ledger");
  });

  it("instance/doctor: zero faults, zero problems, two dormant hallucinators, no lighthouse organ", async () => {
    const { effect, err } = await viva(world, ["instance/doctor"]);
    expect(effect?.manifest?.slug ?? err).toBe("hello-world");
    expect(effect.faults).toEqual([]);
    expect(effect.problems).toEqual([]);
    expect(Object.keys(effect.dormant).sort()).toEqual(["hallucinators[0]", "hallucinators[1]"]);
    expect(Object.keys(effect.daemons)).toEqual(["hello"]);
    expect(effect.services).toEqual({});
    expect("lighthouse" in effect).toBe(false);
    expect(effect.env.some((row) => row.key === "VIVA_LIGHTHOUSE_MOUNT" || row.key === "PUBLIC_VIVA_LIGHTHOUSE_REMOTE")).toBe(false);
  });

  it("run.js on the shelf prints Status:RUNNING with ONE db at the mountpoint", async () => {
    runtime = await boot(world, { shelf, slug: "hello-world" });
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    const files = [];
    for await (const entry of Deno.readDir(join(shelf, "mountpoint"))) files.push(entry.name);
    expect(files.filter((name) => name.endsWith(".viva.db"))).toEqual(["hello-world.viva.db"]);
    expect(runtime.query("select slug from Daemon")).toEqual([{ slug: "hello" }]);
  });

  it("instance/user signup → login through ghost reach /lighthouse/* on the one remote", async () => {
    const signup = await viva(world, ["instance/user", "signup", "finn", "hunter22"]);
    expect(signup.effect?.status ?? signup.err).toBe("SUCCESS");
    expect(signup.effect.user.slug).toBe("finn");
    const login = await viva(world, ["instance/user", "login", "finn", "hunter22"]);
    expect(login.effect?.status ?? login.err).toBe("SUCCESS");
    expect(login.effect.user.id).toBe(signup.effect.user.id);
    finn = { user: login.effect.user, access: login.effect.authority.access };
    expect(typeof finn.access).toBe("string");
  });

  it("the runtime-level home under /userspace: a thread with no mode, a terminal at index 0, no notes yet", async () => {
    const thread = await runtime.call("/userspace/entities/thread/create", { data: { trait: {} } }, finn.access);
    expect([thread.mode ?? null, thread.user?.id ?? thread.user]).toEqual([null, finn.user.id]);
    const terminal = await runtime.call("/userspace/entities/terminal/create", { data: {} }, finn.access);
    expect(terminal.index).toBe(0);
    expect(await runtime.call("/userspace/entities/note/find", { where: {} }, finn.access)).toEqual([]);
    const turn = await runtime.call("/userspace/entities/turn/create", { data: { thread: thread.id, role: "user", parts: [{ type: "text", text: "hello runtime" }] } }, finn.access);
    expect(turn.thread?.id ?? turn.thread).toBe(thread.id);
    expect(runtime.query("select count(*) as n from Turn").at(0).n).toBe(1);
  });

  it("entering hello: /metadata/daemons names it, the same user, no handshake, membership on first use", async () => {
    const roster = await (await runtime.get("/metadata/daemons")).json();
    expect(roster.map((row) => row.slug)).toEqual(["hello"]);
    expect(runtime.query("select * from User_daemons")).toEqual([]);
    const status = await runtime.get("/daemon/hello/status", finn.access);
    expect(status.status).toBe(200);
    await status.body?.cancel();
    const handshake = await runtime.post("/daemon/hello/userspace/handshake", {}, finn.access);
    expect(handshake.status).toBe(404);
    await handshake.body?.cancel();
    expect(runtime.query("select count(*) as n from User_daemons").at(0).n).toBe(1);
    const bare = await runtime.get("/daemon/hello/status");
    expect(bare.status).toBe(401);
    await bare.body?.cancel();
  });

  it("SIGTERM → exit 0", async () => {
    expect(await runtime.stop("SIGTERM")).toBe(0);
  });
});
