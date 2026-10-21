import { monad, shape } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(service) {
  return monad.kleisli([
    () => ({ controller: service.controller, mask: service.mask, service }),
    ...shape.monad.ready(execution),
  ]);
}
