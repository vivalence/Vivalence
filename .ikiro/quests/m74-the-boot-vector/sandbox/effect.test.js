import { expect } from "@std/expect";
import { Controller, Span, Vector, control, steer } from "@vivalence/typology";

const settle = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};

const keepalive = async (die) => {
  die.controller.stdout.open();
  await control.hold(die.controller);
};

Deno.test("one run: built, held by keepalive, owed back on SIGTERM", async () => {
  const run = new Vector()
    .use(settle)
    .use(async (die, next) => {
      die.controller.stdout.note("built");
      try {
        await next();
      } finally {
        die.controller.stdout.note("owed back");
      }
    });
  run.affect(keepalive);
  const die = { controller: new Controller({ stdout: new Span("demo") }) };
  const execution = steer.dispatch.execute(run, die);
  await control.controlled(die.controller);
  const running = die.controller.status.reflection.code;
  await die.controller.kill("SIGTERM");
  await execution;
  const told = die.controller.stdout.records.map((record) => [record.verb, typeof record.data === "string" && record.data].filter(Boolean).join(" "));
  console.log("TOLD", JSON.stringify(told), JSON.stringify(die.controller.stdout.records[0]));
  expect([running, die.controller.status.reflection.code]).toEqual(["RUNNING", "STOPPED"]);
  expect(told).toEqual(["note built", "open", "stop", "note owed back", "close"]);
});
