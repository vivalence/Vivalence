import { middleware, object, Signal } from "@vivalence/typology"

const SIGNATURE_KEYS = ["keyed", "valence", "directed", "input", "output"]

export function pojo(vector, execute) {
  return (function walk(position, carry, steps, signal) {
    carry = middleware.chain(carry, middleware.compose(position.carry))

    const effects = [...position.effects.entries()].map(([signature, effect]) => {
      const path = [...steps, signature]
      return {
        nature: signature.nature,
        signature: object.pluck(signature, SIGNATURE_KEYS),
        ...(execute ? { invoke: execute(carry, effect, path, signal.branch(signature.nature)) } : {}),
      }
    })

    const trajectories = [...position.trajectories.entries()].map(([signature, descendant]) => {
      const path = [...steps, signature]
      return {
        nature: signature.nature,
        signature: object.pluck(signature, SIGNATURE_KEYS),
        children: walk(descendant, carry, path, signal.branch(signature.nature)),
      }
    })

    return { effects, trajectories }
  })(vector, middleware.forward, [], new Signal())
}
