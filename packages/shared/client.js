import blacklist from "./src/blacklist/index.js";
import validator from "./src/validator/index.js";
import { deepClone, strings, time, deepMerge, deepEquals, id, shuffle } from "./src/lib/index.js";
import monads from "./src/monads/index.js";

export {
  deepClone,
  monads,
  strings,
  time,
  deepEquals,
  deepMerge,
  id,
  shuffle,
  blacklist,
  validator,
};
export default {
  monads,

  deepClone,
  strings,
  time,
  deepEquals,
  deepMerge,
  id,
  shuffle,
  blacklist,
  validator,
};
