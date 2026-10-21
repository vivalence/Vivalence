import { Argv, Controller, Span, fromm, steer } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import * as shell from "./subjects/shell/index.js";

const die = {
  controller: paladin.control(new Controller({ stdout: new Span("ghost") })),
  signal: new Argv(Deno.args),
};

try {
  await steer.dispatch.execute(shell.lifecycle.execution, die, die.signal);
} catch (error) {
  die.controller.fault(error);
}

if (die.controller.status.is("FAILED")) {
  const { error } = die.controller.status.reflection;
  console.error(
    `[ERROR] ${die.signal.pathname}: ${die.signal.flags.verbose === true ? error.stack : error.message}`,
  );
}

Deno.exit(fromm.controller(die.controller).exit);
