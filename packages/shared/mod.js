import std, {
  obj,
  array,
  strings,
  time,
  id,
  hash,
  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
  shuffle,
} from "./src/lib/index.js";

import monads from "./src/monads/index.js";
import blacklist from "./src/blacklist/index.js";

import bundler from "./src/bundler/index.js";
import validators from "./src/validators/index.js";
import services from "./src/services/index.js";

export {
  std,
  obj,
  array,
  monads,
  strings,
  time,
  id,
  blacklist,
  bundler,
  validators,
  services,
  hash,

  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
  shuffle,
};

// export default {monads, strings, time, deepMerge, deepClone, deepEquals, id, shuffle, blacklist, bundler, validators, services, registry,};
