import { expect } from "@std/expect";
import { boot } from "./world.js";

const loose = { sanitizeOps: false, sanitizeResources: false };

const life = async () => {
  const world = await boot();
  const checkpoints = { booted: { ledger: await world.ledger(), census: world.census().length } };
  await world.kill("chess", "SIGSTOP");
  checkpoints.paused = await world.ledger();
  await world.kill("chess", "SIGCONT");
  await world.kill("education", "SIGTERM");
  await (await world.die.runtime.processes.daemon.findOne({ slug: "education" })).execution;
  checkpoints.shrunk = { ledger: await world.ledger(), status: (await world.connection.call("/daemon/chess/status")).code };
  await world.stop();
  checkpoints.chronicle = world.chronicle();
  checkpoints.settled = world.die.controller.status.reflection.code;
  checkpoints.faults = world.die.controller.stdout.records.filter((record) => record.verb === "fault").map((record) => `${record.path} ${record.data?.message}`);
  return checkpoints;
};

Deno.test("one cycle, told twice: the checkpoints are equal", loose, async () => {
  const first = await life();
  const second = await life();
  console.log(JSON.stringify(first, null, 1));
  expect(second).toEqual(first);
  expect(first.faults).toEqual([]);
});
