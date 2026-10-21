import paladin, { factories } from "@vivalence/paladin";
import { Controller, Span, trace } from "@vivalence/typology";
import { factory as runtimeFactory } from "./subjects/runtime/factory.js";

if (import.meta.main) {
  await factories.instance(paladin.instance); //@beef still ugly

  const controller = paladin.control(
    new Controller({ stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`) }),
  );

  controller.stdout.pipe //
    .tap((record) => console.log(`[${trace.pathname(record.path)}] ${record.track}`, record.data || ""));

  await runtimeFactory(paladin.instance)({ controller }); // @beef confusing

  Deno.exit(controller.status.is("STOPPED") ? 0 : 1);
}
