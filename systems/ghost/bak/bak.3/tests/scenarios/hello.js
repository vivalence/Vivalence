import paladin, { lifecycle } from "@vivalence/paladin";
import { Argv } from "@vivalence/ghost";
import { hello } from "@vivalence/runtime/scenarios";
import { Controller, Span, fromm, steer } from "@vivalence/typology";
import { execution as shell } from "../../lifecycle/shell.js";

export const MEMO = await paladin.read.json(
  paladin.scope.repository.branch("commons/fixtures/memo/instance/instance.viva.json"),
);

export const RECIPE = {
  ...hello.RECIPE,
  hallucinators: [{ module: "@commons/hallucinator/stub" }],
  daemons: [...hello.RECIPE.daemons, ...MEMO.daemons],
};

export const DEMO = {
  ...RECIPE,
  lighthouse: { ...RECIPE.lighthouse, traits: ["JOINABLE", "AUTOLOGIN"] },
  clients: [
    {
      manifest: { type: "client", slug: "ghost" },
      traits: ["HOME"],
      trait: { HOME: { reference: "/daemon/memo/mode/srs/memo" } },
    },
  ],
};

export const boot = (options = {}) => hello.boot({ prefix: "viva-ghost-", recipe: RECIPE, ...options });

if (import.meta.main) {
  const world = await boot({ recipe: DEMO, watch: true });

  globalThis.addEventListener("unload", () => {
    world.child.kill("SIGKILL");
    Deno.removeSync(world.root, { recursive: true });
  });

  paladin.assign(world.env, "flag");

  const signal = new Argv(Deno.args);

  const die = {
    controller: new Controller({ stdout: new Span("shell") }),
    instance: await lifecycle.mount(paladin.instance),
    shell,
    signal,
    input: signal.body,
    output: undefined,
  };

  for (const name of ["SIGINT", "SIGTERM"]) Deno.addSignalListener(name, () => die.controller.kill("SIGTERM", name));

  await steer.dispatch.invoke(shell, signal, (carry, effect, steps) => async () => {
    Object.assign(die, { steps, params: fromm.match(steps).parameters });
    await carry(die, steer.strategy.resolve(effect));
  })();

  const { error } = die.controller.status.reflection;
  if (die.controller.status.is("FAILED")) console.error(`viva ${signal.pathname}: ${error ? error.message : die.controller.status.code}`);
  Deno.exit(die.controller.status.is("FAILED") ? 1 : 0);
}
