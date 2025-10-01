import secure from "./secure/index.js";
import hash from "./hash/index.ts";

import validators from "./validators/index.js";
import std, {
  fn,
  is,
  random,
  promise,
  obj,
  array,
  strings,
  time,
  id,
  sleep,
  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
} from "./lib/index.js";

array.hash = hash.array;
obj.hash = hash.object;

export {
  secure,
  is,
  fn,
  promise,
  std,
  obj,
  array,
  strings,
  time,
  id,
  validators,
  random,
  hash,
  sleep,

  //api depracated
  uniqueBySlug,
  deepClone,
  deepMerge,
  deepEquals,
};

// export default {monads, strings, time, deepMerge, deepClone, deepEquals, id, shuffle, blacklist, bundler, validators, services, registry,};
