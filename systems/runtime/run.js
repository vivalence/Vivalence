import paladin, { lifecycle } from "@vivalence/paladin";
import { Aperture, Controller, Path, Span, steer } from "@vivalence/typology";
import { Runtime } from "./prototypes/index.js";
import { execution } from "./lifecycle/runtime/execution.js";

if (import.meta.main) {
  await lifecycle.mount(paladin.instance);

  const die = {
    mask: paladin.instance.runtime,
    aperture: new Aperture(),
    controller: new Controller({
      stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`),
    }),
    runtime: new Runtime({
      instance: paladin.instance,
      slug: paladin.instance.runtime.manifest.slug,
      reference: new Path(paladin.instance.runtime.reference),
    }),
  };

  die.controller.stdout.to((record) =>
    console.log(`[${record.path}] ${record.verb}`, record.data ?? record.message ?? ""),
  );
  die.controller.stdout.to(
    (record) =>
      record.verb === "open" &&
      record.span === die.controller.stdout.id &&
      console.log(die.controller.status),
  );
  for (const signal of ["SIGTERM", "SIGINT", "SIGQUIT"])
    Deno.addSignalListener(signal, () => die.controller.kill("SIGTERM", signal));

  await steer.dispatch.execute(execution, die);
  Deno.exit(die.controller.status.is("STOPPED") ? 0 : 1);
}
