import paladin, { factories } from "@vivalence/paladin";
import { Controller, Span, trace } from "@vivalence/typology";
import { factory as runtimeFactory } from "./subjects/runtime/factory.js";

if (import.meta.main) {
  await factories.instance(paladin.instance); //@beef still ugly

  const controller = new Controller({
    stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`),
  });

  controller.stdout.pipe //
    .tap((record) => console.log(`[${trace.pathname(record.path)}] ${record.track}`, record.data || ""));

  for (const signal of ["SIGTERM", "SIGINT", "SIGQUIT"])
    Deno.addSignalListener(signal, () => controller.kill("SIGTERM", signal));

  await runtimeFactory(paladin.instance)({ controller }); // @beef confusing

  Deno.exit(controller.status.is("STOPPED") ? 0 : 1);
}
