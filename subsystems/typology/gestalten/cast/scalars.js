import * as is from "../is/scalars.js";

export function array(thing) {
  return (is.array(thing) ? thing : [thing]).filter(Boolean)
}
