import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(runtime) {
  return monad.kleisli([
    (clientDie) => ({ client: clientDie, runtime, controller: clientDie.controller.branch(runtime.reference.absolute) }),
    ...shape.monad.ready(execution),
  ]);
}
