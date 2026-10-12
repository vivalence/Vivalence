import { Argv, Controller, Span, fromm, steer } from "@vivalence/typology";
import paladin, { factories } from "@vivalence/paladin";
import { shell } from "./shell/lifecycle.js";

const instance = await factories.instance(paladin.instance);
await paladin.ledger.registry.supply();

const die = {
  controller: new Controller({ stdout: new Span("ghost") }),
  signal: new Argv(Deno.args),
  instance,
  mask: instance.clients.find((client) => client.manifest.slug === "ghost"),
};
die.register = await paladin.ledger.registry.wire(die.mask);

Deno.addSignalListener("SIGINT", () => die.controller.kill("SIGTERM", "SIGINT"));
Deno.addSignalListener("SIGQUIT", () => die.controller.kill("SIGTERM", "SIGQUIT"));
Deno.addSignalListener("SIGTERM", () => die.controller.kill("SIGTERM", "SIGTERM"));

try {
  await steer.dispatch.execute(shell, die, die.signal);
} catch (error) {
  die.controller.stdout.fault(error);
}

if (die.controller.status.is("FAILED")) {
  const { error } = die.controller.status.reflection;
  console.error(`viva ${die.signal.pathname}: ${die.signal.flags.verbose === true ? error.stack : error.message}`);
}

Deno.exit(fromm.controller(die.controller).exit);
