// wrong.
import { prototypes } from "@vivalence/typology";

import * as is from "../is/index.js";

export function pattern(from) {
  return is.Pattern(from) ? from : new prototypes.Pattern(from);
}

export function path(from) {
  return is.Path(from) ? from : new prototypes.Path(from);
}
