import { expect } from "@std/expect";
import { Controller, Span, Vector, control, steer } from "@vivalence/typology";

const seal = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};

const effect = async (die) => {
  die.controller.stdout.open();
  await control.hold(die.controller);
};

Deno.test("one run: built, held open by its effect, owed back on SIGTERM", async () => {
  const run = new Vector()
    .use(seal)
    .use(async (die, next) => {
      die.log.push("built");
      try {
        await next();
      } finally {
        die.log.push("owed back");
      }
    });
  run.affect(effect);
  const die = { controller: new Controller({ stdout: new Span("demo") }), log: [] };
  const execution = steer.dispatch.execute(run, die);
  await control.controlled(die.controller);
  const running = die.controller.status.reflection.code;
  await die.controller.kill("SIGTERM");
  await execution;
  expect([running, die.log, die.controller.status.reflection.code]).toEqual(["RUNNING", ["built", "owed back"], "STOPPED"]);
});
