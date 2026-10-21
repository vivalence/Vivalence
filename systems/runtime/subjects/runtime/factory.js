import { Aperture, Path, monad, shape } from "@vivalence/typology";
import { Runtime } from "./prototype.js";
import { execution } from "./lifecycle/index.js";

export function factory(instance) {
  return monad.kleisli([
    (runtimeDie) => ({
      mask: instance.runtime,
      aperture: new Aperture(),
      controller: runtimeDie.controller,
      runtime: new Runtime({
        instance,
        slug: instance.runtime.manifest.slug,
        reference: new Path(instance.runtime.reference),
      }),
    }),
    shape.monad.execute(execution),
  ]);
}
