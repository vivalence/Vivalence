import { specimen, sleep, shape, shard, Url, Connection } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { bench } from "./scenarios/bench.js";

specimen.describe("multiplex filter context", { sanitizeOps: false, sanitizeResources: false }, () => {
  let scenario;
  let world;
  let transport;
  let muxed;

  specimen.beforeAll(async () => {
    scenario = await bench({
      services: {
        lighthouse: {
          authenticate: async () => ({
            getUser: async () => ({ id: "probe-user", roles: ["USER"] }),
          }),
        },
      },
    });
    scenario.daemon.aperture
      .use(shard.secure.authorize())
      .use(shard.ambient.store((ctx) => ({ user: ctx.user })))
      .use(scenario.die.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));

    scenario.daemon.aperture.open("/probe/filters", (ctx) => {
      const em = RequestContext.getEntityManager();
      let params = "UNSET";
      try {
        params = em?.getFilterParams("user") ?? null;
      } catch {
        params = "UNSET";
      }
      return { hasFork: Boolean(em), params, user: ctx.user?.id ?? null };
    });

    scenario.daemon.aperture.open("/probe/pulses", async function* (ctx) {
      for (let index = 0; index < 4; index++) {
        yield { index, fork: Boolean(RequestContext.getEntityManager()) };
        await sleep.ms(30);
      }
    });

    const gate = shard.serve.multiplex(scenario.daemon.aperture);
    scenario.daemon.aperture.open("/multiplex", gate);
    const abort = new AbortController();
    const server = Deno.serve(
      { port: 0, signal: abort.signal, onListen() {} },
      shape.http(scenario.daemon.aperture),
    );
    world = { abort, gate, url: new Url(`http://localhost:${server.addr.port}`) };
    await sleep.ms(50);

    scenario.connection.use(shard.connection.authorize({ get: () => ({ access: "probe" }) }));
    transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
    muxed = new Connection(world.url, transport);
  });

  specimen.afterAll(async () => {
    transport.close();
    await sleep.ms(200);
    world.abort.abort();
    await sleep.ms(20);
    await scenario.teardown();
  });

  specimen.it("filtered thread find works inline", async () => {
    const rows = await scenario.connection.call("/userspace/entities/thread/find", { where: {} });
    specimen.expect(Array.isArray(rows)).toBe(true);
  });

  specimen.it("filtered thread find works through the multiplex", async () => {
    const rows = await muxed.call("/userspace/entities/thread/find", { where: {} });
    specimen.expect(Array.isArray(rows)).toBe(true);
  });

  specimen.it("filter fork state matches across carriers", async () => {
    const inline = await scenario.connection.call("/probe/filters", {});
    const overMux = await muxed.call("/probe/filters", {});
    specimen.expect(overMux).toEqual(inline);
    specimen.expect(overMux.hasFork).toBe(true);
    specimen.expect(overMux.params).toEqual({ user: "probe-user" });
  });

  specimen.it("RequestContext fork spans every stream pull through the multiplex", async () => {
    const pulses = [];
    for await (const pulse of muxed.stream("/probe/pulses", undefined, { method: "GET" })) {
      pulses.push(pulse);
    }
    specimen.expect(pulses.length).toBe(4);
    specimen.expect(pulses.every((pulse) => pulse.fork)).toBe(true);
  });

  specimen.it("history-shaped turn find crosses both carriers", async () => {
    const ghost = "00000000-0000-0000-0000-000000000000";
    const inline = await scenario.connection.call("/userspace/entities/turn/find", {
      where: { thread: ghost },
    });
    const overMux = await muxed.call("/userspace/entities/turn/find", {
      where: { thread: ghost },
    });
    specimen.expect(Array.isArray(inline)).toBe(true);
    specimen.expect(Array.isArray(overMux)).toBe(true);
  });
});
