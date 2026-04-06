import { steer, object } from "@vivalence/typology"

const SIGNATURE_KEYS = ["keyed", "valence", "directed", "input", "output"]

export const press = (vector) =>
  steer.survey(vector, ({ signature, effect, effects, trajectories }) => ({
    nature: signature.nature,
    signature: object.pluck(signature, SIGNATURE_KEYS),
    ...(effects ? { children: [...effects, ...trajectories] } : {}),
  }))
