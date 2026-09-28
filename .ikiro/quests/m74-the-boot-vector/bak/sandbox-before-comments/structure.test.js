import { expect } from "@std/expect";
import { control, steer } from "@vivalence/typology";
import { log, mint, run } from "./lib.js";

const loose = { sanitizeOps: false, sanitizeResources: false };
const within = (promise, ms) => {
  let timer;
  return Promise.race([promise, new Promise((resolve) => (timer = setTimeout(() => resolve("TIMEOUT"), ms)))]).finally(() => clearTimeout(timer));
};
const codes = async (repository, where = {}) => Object.fromEntries((await repository.find(where)).map((held) => [held.slug, held.status]));
const boot = async (overrides) => {
  const die = mint(overrides);
  const exits = [];
  const execution = steer.dispatch.execute(run.runtime, die).then(() => exits.push(die.controller.status.is("STOPPED") ? 0 : 1));
  await control.controlled(die.controller).catch(() => null);
  return { die, execution, exits };
};

Deno.test("boot and stop: three levels, one process repository per datamap, the subject born on the die", loose, async () => {
  const { die, execution, exits } = await boot();
  const { process } = die.runtime.entities;
  expect(await codes(process, { type: "service" })).toEqual({ multiplayer: "RUNNING" });
  expect(await codes(process, { type: "daemon" })).toEqual({ chess: "RUNNING", education: "RUNNING" });
  const chess = await process.findOne({ type: "daemon", slug: "chess" });
  expect(chess.controller.stdout.absolute).toBe("/runtime/test/daemon/chess");
  expect(JSON.parse(JSON.stringify(chess))).toEqual({
    id: chess.id,
    createdAt: chess.createdAt.toISOString(),
    updatedAt: chess.updatedAt.toISOString(),
    type: "daemon",
    slug: "chess",
    manifest: { type: "daemon", slug: "chess" },
    status: "RUNNING",
  });
  expect((await process.findOne({ type: "service" })).controller.stdout.absolute).toBe("/runtime/test/attached/process/service/lighthouse/multiplayer");
  expect(Object.keys(die).sort()).toEqual(["controller", "mask", "runtime"]);
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
  expect(die.controller.status.reflection.code).toBe("STOPPED");
  expect(exits).toEqual([0]);
  console.log("TRAIL", JSON.stringify(log, null, 1));
});

Deno.test("a daemon stops on its own: its row reads STOPPED, its sibling runs on", loose, async () => {
  const { die, execution, exits } = await boot();
  const { process } = die.runtime.entities;
  const chess = await process.findOne({ type: "daemon", slug: "chess" });
  await chess.controller.kill("SIGTERM");
  await within(chess.execution, 500);
  expect(await codes(process, { type: "daemon" })).toEqual({ chess: "STOPPED", education: "RUNNING" });
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
  expect(exits).toEqual([0]);
});

Deno.test("pause one daemon, resume", loose, async () => {
  const { die, execution, exits } = await boot();
  const { process } = die.runtime.entities;
  const chess = await process.findOne({ type: "daemon", slug: "chess" });
  await chess.controller.kill("SIGSTOP");
  expect(await codes(process, { type: "daemon" })).toEqual({ chess: "PAUSED", education: "RUNNING" });
  expect([...chess.controller.children].map((child) => child.status.reflection.code)).toEqual(["PAUSED", "PAUSED"]);
  await chess.controller.kill("SIGCONT");
  expect(await codes(process, { type: "daemon" })).toEqual({ chess: "RUNNING", education: "RUNNING" });
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
});

Deno.test("a daemon refuses at boot: FAILED, exit 1", loose, async () => {
  const { die, execution, exits } = await boot({ education: { fails: "boot" } });
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
  expect(die.controller.status.reflection.code).toBe("FAILED");
  expect(exits).toEqual([1]);
});

Deno.test("a mode refuses at boot: fails up two levels", loose, async () => {
  const { die, execution, exits } = await boot({ chess: { kernel: [{ manifest: { type: "game", slug: "board" }, mount: { absolute: "/mode/game/board" }, fails: "boot" }] } });
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
  expect(die.controller.status.reflection.code).toBe("FAILED");
  expect(exits).toEqual([1]);
});

Deno.test("a process is executed once", loose, async () => {
  const { die, execution, exits } = await boot();
  const { process } = die.runtime.entities;
  const chess = await process.findOne({ type: "daemon", slug: "chess" });
  let refused = "no throw";
  try {
    await die.runtime.datamap.shard.scope(() => process.controlled({ id: chess.id, execution: chess.execution }));
  } catch (error) {
    refused = error.message;
  }
  expect(refused).toBe(`ProcessEntity ${chess.id} is executed`);
  await die.controller.kill("SIGTERM");
  expect(await within(execution.then(() => "DONE"), 1000)).toBe("DONE");
});
