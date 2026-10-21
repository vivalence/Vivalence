import { Argv, Controller, Span, fromm, steer } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import * as shell from "./subjects/shell/index.js";

const ghost = async () => {
  const die = {
    controller: new Controller({ stdout: new Span("ghost") }),
    signal: new Argv(Deno.args),
  };

  Deno.addSignalListener("SIGINT", () => die.controller.kill("SIGTERM", "SIGINT"));
  Deno.addSignalListener("SIGQUIT", () => die.controller.kill("SIGTERM", "SIGQUIT"));
  Deno.addSignalListener("SIGTERM", () => die.controller.kill("SIGTERM", "SIGTERM"));

  try {
    await steer.dispatch.execute(shell.lifecycle.execution, die, die.signal);
  } catch (error) {
    die.controller.fault(error);
  }

  if (die.controller.status.is("FAILED")) {
    const { error } = die.controller.status.reflection;
    console.error(`viva ${die.signal.pathname}: ${die.signal.flags.verbose === true ? error.stack : error.message}`);
  }

  Deno.exit(fromm.controller(die.controller).exit);
};

const piped = async () => {
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--config", `${import.meta.dirname}/../../deno.jsonc`, import.meta.filename, ...Deno.args],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "piped",
  }).spawn();

  for (const signal of ["SIGINT", "SIGQUIT", "SIGTERM"]) Deno.addSignalListener(signal, () => child.kill(signal));

  const [status, said] = await Promise.all([child.status, new Response(child.stderr).text()]);
  await Deno.stderr.write(new TextEncoder().encode(said));
  Deno.exit(status.code);
};

const ROLES = [
  [() => paladin.is.tty && paladin.is.stderrTerminal, piped],
  [() => true, ghost],
];

await ROLES.find(([test]) => test())[1]();
