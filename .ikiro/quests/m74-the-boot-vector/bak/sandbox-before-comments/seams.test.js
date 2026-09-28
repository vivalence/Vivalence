import { expect } from "@std/expect";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { Connection, Path, Status, Url, Vector, control, shape, shard, steer } from "@vivalence/typology";
import { log, mint, run, seen } from "./lib.js";

const loose = { sanitizeOps: false, sanitizeResources: false };
const within = (promise, ms) => {
  let timer;
  return Promise.race([promise, new Promise((resolve) => (timer = setTimeout(() => resolve("TIMEOUT"), ms)))]).finally(() => clearTimeout(timer));
};
const boot = async (overrides) => {
  const die = mint(overrides);
  const execution = steer.dispatch.execute(run.runtime, die);
  await control.controlled(die.controller).catch(() => null);
  return { die, execution };
};
const down = async ({ die, execution }) => {
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
};

Deno.test("the parent serves its children: the subject on the parent, the status off the row", loose, async () => {
  const world = await boot();
  const connection = new Connection(new Url("http://test"), shard.transmitter.inline(shape.http(world.die.runtime.aperture)));
  expect((await connection.call("/status")).code).toBe("RUNNING");
  expect(await connection.call("/daemon/chess/manifest")).toEqual({ type: "daemon", slug: "chess" });
  expect((await connection.call("/daemon/chess/ping")).pong).toBe("chess");
  expect((await connection.call("/daemon/chess/mode/game/board/status")).code).toBe("RUNNING");
  expect((await connection.call("/attached/process/service/lighthouse/multiplayer/ping")).pong).toBe("multiplayer");
  expect((await connection.call("/attached/process/service/lighthouse/multiplayer/status")).code).toBe("RUNNING");
  const routes = [];
  const walk = (node, path) => {
    if (node.effect) routes.push(path || "/");
    for (const [name, branch] of Object.entries(node.branches ?? {})) walk(branch, `${path}/${name}`);
  };
  walk(shape.strip(world.die.runtime.aperture), "");
  console.log("ROUTES", JSON.stringify(routes.sort(), null, 1));
  await down(world);
});

Deno.test("what ctx.daemon carries: the subject, never the register", loose, async () => {
  const world = await boot();
  const connection = new Connection(new Url("http://test"), shard.transmitter.inline(shape.http(world.die.runtime.aperture)));
  const { keys } = await connection.call("/daemon/chess/ping");
  console.log("CTX.DAEMON KEYS", JSON.stringify(keys));
  expect(keys.includes("register")).toBe(false);
  await down(world);
});

Deno.test("two phases: every mode staggers before any finalizes; terminators before the datamap closes", loose, async () => {
  const world = await boot();
  const chess = log.filter((line) => /^(board|puzzles|chess) /.test(line));
  expect(chess).toEqual(["chess domain", "board stagger", "puzzles stagger", "board finalize", "puzzles finalize"]);
  await down(world);
  const after = log.filter((line) => /^(board|puzzles|chess) /.test(line)).slice(5);
  console.log("TEARDOWN", JSON.stringify(after));
  expect(after.at(-1)).toBe("chess datamap closed");
  expect(after.slice(0, -1).sort()).toEqual(["board terminate", "puzzles terminate"]);
});

Deno.test("births in order: the second daemon starts after the first is RUNNING", loose, async () => {
  const world = await boot();
  const order = log.filter((line) => / (stagger|finalize)$/.test(line));
  console.log("BOOT ORDER", JSON.stringify(order));
  expect(order).toEqual(["board stagger", "puzzles stagger", "board finalize", "puzzles finalize", "iroh stagger", "iroh finalize"]);
  await down(world);
});

Deno.test("a child executed outside the scope inherits no request context", loose, async () => {
  const world = await boot();
  console.log("CONTEXTS", JSON.stringify(seen.contexts));
  expect(seen.contexts.map((entry) => entry.inherited)).toEqual([false, false, false]);
  await down(world);
});

Deno.test("the mask on the row: a handle, held by identity, never serialized", loose, async () => {
  const world = await boot();
  const { process } = world.die.runtime.entities;
  const chess = await process.findOne({ type: "daemon", slug: "chess" });
  expect(chess.mask).toBe(world.die.runtime.instance.daemons[0]);
  expect(chess.mask.mount instanceof Path).toBe(true);
  expect(chess.mask.url instanceof Url).toBe(true);
  const multiplayer = await process.findOne({ type: "service" });
  expect(multiplayer.mask.secrets.jwt).toBe("held-in-clear");
  expect(JSON.stringify(multiplayer).includes("held-in-clear")).toBe(false);
  expect(Object.keys(JSON.parse(JSON.stringify(chess))).sort()).toEqual(["createdAt", "id", "manifest", "slug", "status", "type", "updatedAt"]);
  console.log("ROW JSON", JSON.stringify(chess));
  expect((await process.find({ manifest: { type: "lighthouse" } })).map((held) => held.slug)).toEqual(["multiplayer"]);
  await down(world);
});

Deno.test("the contrast: a run executed INSIDE a scope holds that request context for its whole life", loose, async () => {
  const world = await boot();
  const held = [];
  const probe = new Vector().use(async (die, next) => {
    held.push(Boolean(RequestContext.currentRequestContext()));
    await next();
    held.push(Boolean(RequestContext.currentRequestContext()));
  });
  let release;
  probe.affect(() => new Promise((resolve) => (release = resolve)));
  const inside = world.die.runtime.datamap.shard.scope(() => steer.dispatch.execute(probe, {}));
  await new Promise((resolve) => setTimeout(resolve, 20));
  release();
  await inside;
  console.log("INSIDE A SCOPE →", JSON.stringify(held));
  expect(held).toEqual([true, true]);
  await down(world);
});

Deno.test("born before booted: every child holds a row at IDLE before the first one runs", loose, async () => {
  const die = mint();
  const observed = [];
  const probe = async (held, next) => {
    observed.push(Object.fromEntries((await held.runtime.entities.process.find({})).map((row) => [row.slug, row.status])));
    await next();
  };
  const vector = new Vector()
    .use(run.runtime.middlewares?.[0] ?? (async (held, next) => next()));
  const { lifecycle, service, daemon } = await import("./lib.js");
  const staged = new Vector()
    .use(lifecycle.process.seal)
    .use(lifecycle.runtime.population.datamap)
    .use(lifecycle.runtime.population.services)
    .use(lifecycle.runtime.population.daemons)
    .use(probe)
    .use(lifecycle.runtime.resolution.services(service))
    .use(lifecycle.runtime.resolution.daemons(daemon));
  staged.affect(lifecycle.process.effect);
  const execution = steer.dispatch.execute(staged, die);
  await control.controlled(die.controller);
  console.log("AT BIRTH", JSON.stringify(observed[0]));
  expect(observed[0]).toEqual({ multiplayer: "IDLE", chess: "IDLE", education: "IDLE" });
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
});

Deno.test("a fault between birth and boot: the born are aborted, none is left IDLE", loose, async () => {
  const die = mint();
  const { lifecycle } = await import("./lib.js");
  const born = [];
  const staged = new Vector()
    .use(lifecycle.process.seal)
    .use(lifecycle.runtime.population.datamap)
    .use(async (held, next) => {
      try {
        await next();
      } finally {
        born.push(...born.splice(0), ...held.controllers.map((controller) => controller.status.reflection.code));
      }
    })
    .use(lifecycle.runtime.population.daemons)
    .use(async (held) => {
      held.controllers = [...held.controller.children];
      throw new Error("registry refused");
    });
  staged.affect(lifecycle.process.effect);
  await within(steer.dispatch.execute(staged, die), 1000);
  console.log("AFTER THE FAULT", JSON.stringify(born), die.controller.status.reflection.code);
  expect(born).toEqual(["ABORTED", "ABORTED"]);
  expect(die.controller.status.reflection.code).toBe("FAILED");
});

Deno.test("the readiness line paladin waits for", () => {
  console.log("INSPECT alive →", Deno.inspect(new Status("alive")), "| running →", Deno.inspect(new Status("RUNNING")));
  expect(/^Status:ALIVE$/.test(Deno.inspect(new Status("alive")))).toBe(true);
  expect(/^Status:ALIVE$/.test(Deno.inspect(new Status("RUNNING")))).toBe(false);
});
