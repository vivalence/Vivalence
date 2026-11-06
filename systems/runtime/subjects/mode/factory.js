import { contexts, monad, shape, shard } from "@vivalence/typology";
import { execution } from "./lifecycle/index.js";

export function factory(mode, traits) {
  return monad.kleisli([
    (context) => ({
      ...shard.context.lift(contexts.modeDie, context),
      mode,
      traits,
    }),
    shape.monad.execute(execution),
  ]);
}
