import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(mode) {
  return monad.kleisli([
    (clientDie) => ({ mode, client: clientDie, controller: clientDie.controller }),
    shape.monad.execute(execution),
  ]);
}
