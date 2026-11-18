import paladin, { factories } from "@vivalence/paladin";
import { Controller, Span } from "@vivalence/typology";
import { factory as runtimeFactory } from "./subjects/runtime/factory.js";

if (import.meta.main) {
  await factories.instance(paladin); //@beef still ugly

  const controller = paladin.control(
    new Controller({ stdout: new Span(`runtime/${paladin.instance.runtime.manifest.slug}`) }),
  );

  await runtimeFactory(paladin.instance.runtime)({ controller }); // -- // @beef confusing

  Deno.exit(controller.status.is("STOPPED") ? 0 : 1);
}
