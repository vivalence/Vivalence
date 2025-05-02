import std, {
  fn,
  random,
  promise,
  obj,
  array,
  strings,
  time,
  id,
  hash,
  sleep,
  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
  shuffle,
} from "./src/lib/index.js";
// import hash from "./src/lib/hash.ts";

import Path from "./src/Path.ts";
import monads from "./src/monads/index.js";
import Blacklist from "./src/blacklist/index.js";
import Scope from "./src/scope/index.js";

import bundler from "./src/bundler/index.js";
import validators from "./src/validators/index.js";
// import services from "./src/services/index.js";

export {
  fn,
  promise,
  Path,
  std,
  obj,
  array,
  monads,
  strings,
  time,
  id,
  Scope,
  Blacklist,
  bundler,
  validators,
  random,
  // services,
  hash,
  sleep,

  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
  shuffle,
};

// export default {monads, strings, time, deepMerge, deepClone, deepEquals, id, shuffle, blacklist, bundler, validators, services, registry,};
