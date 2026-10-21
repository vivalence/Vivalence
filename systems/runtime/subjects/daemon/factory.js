import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(daemon) {
  return monad.kleisli([
    (runtimeDie) => ({ runtime: runtimeDie.runtime, controller: daemon.controller, mask: daemon.mask, daemon }),
    ...shape.monad.ready(execution),
  ]);
}
