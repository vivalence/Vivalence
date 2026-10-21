import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(mode) {
  return monad.kleisli([
    (parentDie) => ({ mask: mode.module, mode, context: parentDie.context, traits: parentDie.traits }),
    shape.monad.execute(execution),
  ]);
}
