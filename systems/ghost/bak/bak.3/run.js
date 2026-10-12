import { Controller, Span, fromm, steer } from "@vivalence/typology";
import { Argv } from "./prototypes/argv.js";
import { execution as shell } from "./lifecycle/shell.js";

const NUMBERS = { SIGINT: 2, SIGQUIT: 3, SIGTERM: 15 };

const signal = new Argv(Deno.args);

const die = {
  controller: new Controller({ stdout: new Span("shell") }),
  shell,
  signal,
  input: signal.body,
  output: undefined,
};

for (const name of Object.keys(NUMBERS))
  Deno.addSignalListener(name, () => die.controller.kill("SIGTERM", name));

const $stopped = die.controller.stdout.pipe.reactive(null, (held, record) =>
  record.span === die.controller.stdout.id && record.verb === "stop" ? record.data.reason : held,
);

const exit = (status) => {
  if (status.is("DONE")) return 0;
  if (status.is("STOPPED"))
    return Object.hasOwn(NUMBERS, $stopped.get()) ? 128 + NUMBERS[$stopped.get()] : 0;
  if (status.is("FAILED") && status.reflection.error.record.data.code === "NOT_FOUND") return 127;
  const { error } = status.reflection;
  console.error(
    `viva ${signal.pathname}: ${error === undefined || error === null ? status.code : signal.flags.verbose === true ? error.stack : error.message}`,
  );
  return 1;
};

Deno.exit(
  await steer.dispatch.invoke(shell, signal, (carry, effect, steps) => async () => {
    Object.assign(die, { steps, params: fromm.match(steps).parameters });
    await carry(die, steer.strategy.resolve(effect));
    return exit(die.controller.status);
  })(),
);
