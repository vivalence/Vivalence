import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(daemon) {
  return monad.kleisli([
    (clientDie) => ({ client: clientDie, daemon, controller: clientDie.controller.branch(daemon.reference.absolute) }),
    ...shape.monad.ready(execution),
  ]);
}
