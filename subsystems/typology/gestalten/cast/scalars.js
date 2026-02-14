import { is } from "@vivalence/typology";

export function array(thing) {
  return (is.array(thing) ? thing : [thing]).filter(Boolean)
}
