import { middleware } from "@vivalence/typology";
import { scope } from "./match.js";

export const shotgun = (vector, signals) =>
  signals
    .flatMap((signal) => scope(vector, signal))
    .filter(([match]) => match)
    .map(([match, trajectory, effect]) => ({
      effect,
      carry: middleware.compose([vector.carry, trajectory?.carry].flat().filter(Boolean)),
      steps: [match],
      match,
    }));
