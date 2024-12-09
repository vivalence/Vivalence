import {
  array,
  strings,
  time,
  deepClone,
  deepMerge,
  deepEquals,
  id,
  shuffle,
} from "./src/lib/index.js";
import monads from "./src/monads/index.js";
import blacklist from "./src/blacklist/index.js";

import bundler from "./src/bundler/index.js";
import validators from "./src/validators/index.js";
import services from "./src/services/index.js";

export {
  array,
  monads,
  strings,
  time,
  deepClone,
  deepMerge,
  deepEquals,
  id,
  shuffle,
  blacklist,
  bundler,
  validators,
  services,
};

// export default {monads, strings, time, deepMerge, deepClone, deepEquals, id, shuffle, blacklist, bundler, validators, services, registry,};
