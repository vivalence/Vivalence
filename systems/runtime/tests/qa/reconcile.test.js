import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { REPOSITORY, boot, ledger, pin, viva } from "./rig.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const PLAYGROUND = JSON.parse(await Deno.readTextFile(join(REPOSITORY, "commons/instances/playground/instance.viva.json"))).daemons[0];

describe("P-reconcile — a daemon added to instance.viva.json installs at boot; removed, start refuses and names rows; VIVA_RUNTIME_PRUNE=1 drops them", () => {
  let world;
  let shelf;
  let runtime;
  let finn;

  const restart = async (extra = {}) => {
    await runtime?.stop("SIGKILL");
    runtime = await boot(world, { shelf, slug: "hello-world", extra });
    return runtime;
  };

  const recipe = async (edit) => {
    const path = join(shelf, "instance.viva.json");
    const held = JSON.parse(await Deno.readTextFile(path));
    edit(held);
    await Deno.writeTextFile(path, JSON.stringify(held, null, 2));
  };

  beforeAll(async () => {
    world = await ledger("viva-qa-reconcile-");
    await viva(world, ["ledger/init"]);
    const { effect, err } = await viva(world, ["instance/create", "hello-world", "--use", "--init"]);
    if (!effect?.target) throw new Error(`instance/create failed: ${err}`);
    shelf = effect.target;
    await pin(shelf, { VIVA_RUNTIME_ORIGIN: world.origin });
  });

  afterAll(async () => {
    await runtime?.stop("SIGKILL");
    await world.remove();
  });

  it("boots hello-world with one Daemon row, stops on SIGTERM", async () => {
    await restart();
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    expect(runtime.query("select slug from Daemon order by slug")).toEqual([{ slug: "hello" }]);
    expect(await runtime.stop("SIGTERM")).toBe(0);
  });

  it("the playground daemon added to instance.viva.json installs on restart and answers /status through the lighthouse", async () => {
    await recipe((held) => held.daemons.push(PLAYGROUND));
    await restart();
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    expect(runtime.query("select slug from Daemon order by slug")).toEqual([{ slug: "hello" }, { slug: "playground" }]);
    const signup = await runtime.call("/lighthouse/signup", { username: "finn", password: "hunter22" });
    finn = { user: signup.user, access: signup.authority.access };
    const status = await runtime.get("/daemon/playground/status", finn.access);
    expect(status.status).toBe(200);
    await status.body?.cancel();
    expect(runtime.query("select count(*) as n from User_daemons").at(0).n).toBe(1);
  });

  it("its literals come through its own repository: casa under playground is invisible to hello", async () => {
    const [mode] = await runtime.call("/daemon/playground/entities/mode/find", { where: {}, options: { limit: 1 } }, finn.access);
    const created = await runtime.call("/daemon/playground/entities/literal/create", { data: { slug: "casa", mode: mode.id, traits: [], trait: {} } }, finn.access);
    expect(created.slug).toBe("casa");
    expect((await runtime.call("/daemon/playground/entities/literal/find", { where: { slug: "casa" } }, finn.access)).map((row) => row.slug)).toEqual(["casa"]);
    expect(await runtime.call("/daemon/hello/entities/literal/find", { where: { slug: "casa" } }, finn.access)).toEqual([]);
    expect(runtime.query("select daemon_slug from Literal where slug = 'casa'")).toEqual([{ daemon_slug: "playground" }]);
    expect(await runtime.stop("SIGTERM")).toBe(0);
  });

  it("removed from the file, start refuses and names the rows it would drop", async () => {
    await recipe((held) => {
      held.daemons = held.daemons.filter((daemon) => daemon.manifest.slug !== "playground");
    });
    await restart();
    expect(runtime.ready).toBe(null);
    expect(runtime.exit).not.toBe(0);
    expect(runtime.tail()).toContain("playground held in the datamap but absent from instance.viva.json");
    expect(runtime.query("select slug from Daemon order by slug")).toEqual([{ slug: "hello" }, { slug: "playground" }]);
  });

  it("VIVA_RUNTIME_PRUNE=1 drops the daemon row with its modes and literals; the next plain start is clean", async () => {
    await restart({ VIVA_RUNTIME_PRUNE: "1" });
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    expect(runtime.query("select slug from Daemon")).toEqual([{ slug: "hello" }]);
    expect(runtime.query("select count(*) as n from Literal where slug = 'casa'").at(0).n).toBe(0);
    expect(runtime.query("select count(*) as n from Mode where daemon_slug = 'playground'").at(0).n).toBe(0);
    expect(await runtime.stop("SIGTERM")).toBe(0);
    await restart();
    expect(runtime.ready ?? runtime.tail()).toBe("Status:RUNNING");
    expect(await runtime.stop("SIGTERM")).toBe(0);
  });
});
