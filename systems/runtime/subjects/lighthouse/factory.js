import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(lighthouse) {
  return monad.kleisli([
    (runtimeDie) => ({ lighthouse, runtime: runtimeDie.runtime, aperture: runtimeDie.aperture, controller: runtimeDie.controller }),
    shape.monad.execute(execution),
  ]);
}
