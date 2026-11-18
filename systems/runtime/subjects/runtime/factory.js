import { Aperture, monad, shape } from "@vivalence/typology";
import { Runtime } from "./prototype.js";
import { execution } from "./lifecycle/index.js";

export function factory(mask) {
  return monad.kleisli([
    (runtimeDie) => ({
      mask,
      aperture: new Aperture(),
      controller: runtimeDie.controller,
      runtime: new Runtime({ mask }),
    }),
    shape.monad.execute(execution),
  ]);
}
