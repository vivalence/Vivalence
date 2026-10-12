import { specimen, atom, steer } from "@vivalence/typology";
import { hello } from "@vivalence/runtime/scenarios";
import { Client } from "../prototypes/client.js";
import { execution } from "../lifecycle/client/execution.js";
import { headless, memory } from "./headless.js";
import { boot } from "./scenarios/hello.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = (store, predicate, signal, ms = 15000) =>
  Promise.race([atom.until(store, predicate, signal), settle(ms).then(() => Promise.reject(new Error(`timed out waiting ${ms}ms`)))]);
const eventually = async (predicate, ms = 15000) => {
  const deadline = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting ${ms}ms`);
    await settle(25);
  }
};
const open = (signal) => (async function* () {
  await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
})();

describe("the client die across a runtime restart", { sanitizeOps: false, sanitizeResources: false }, () => {
  let world = null;

  beforeAll(async () => {
    world = await boot();
  });

  afterAll(async () => {
    await world.stop();
  });

  it("the runtime reads UNAVAILABLE when it stops and HEALTHY when it comes back on the same port, no reboot", async () => {
    const typing = new AbortController();
    const surface = { ...headless({ credentials: memory() }), keys: open(typing.signal) };
    const client = new Client({ manifest: { type: "client", slug: "test" }, statics: { remote: `${world.origin}/` }, traits: [], trait: {} });
    const die = { controller: client.controller, mask: client.mask, surface, client };
    const running = steer.dispatch.execute(execution, die);
    const signal = client.controller.abort.signal;
    const settled = client.controller.settled.then((json) => Promise.reject(new Error(`client ${json.code}: ${json.error ? json.error.message : "no error"}`)));
    const alive = (waiting) => Promise.race([waiting, settled]);

    await alive(eventually(() => client.runtime.lighthouse !== null && client.runtime.lighthouse.manifest !== null));
    expect((await client.runtime.lighthouse.signup(`offline-${crypto.randomUUID().slice(0, 8)}`, "walk-the-walk")).status).toBe("OK");
    await alive(until(client.runtime.$status, (status) => status.code === "HEALTHY", signal, 30000));

    world.child.kill("SIGTERM");
    await alive(until(client.runtime.$status, (status) => status.code === "UNAVAILABLE", signal));
    expect((await world.child.status).code).toBe(0);

    world = await hello.revive(world);
    await alive(until(client.runtime.$status, (status) => status.code === "HEALTHY", signal, 30000));
    expect(client.runtime.lighthouse.isAuthorized).toBe(true);

    await client.controller.kill("SIGTERM", "offline done");
    await running;
    typing.abort();
    expect(client.controller.status.reflection.code).toBe("STOPPED");
  });
});
