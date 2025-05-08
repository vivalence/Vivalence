import std, {
  fn,
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
} from "./src/lib/index.js";
import hash from "./src/lib/hash.ts";

import Path from "./src/Path.ts";
import monads from "./src/monads/index.js";
import Scope from "./src/scope/index.js";

import bundler from "./src/bundler/index.js";
import validators from "./src/validators/index.js";

export { Blacklist } from "./src/blacklist/index.js";
export { Remedy } from "./src/remedy/index.ts";
// export {
//   Trajectory,
//   TrajectoryWalker,
//   TrajectoryDeferred,
//   TrajectoryParsers,
// } from "./src/trajectory/index.ts";
export {
  Classifier,
  ClassifierSignal,
  ClassifierFeature,
  ClassifierParser,
} from "./src/classifier/index.ts";

array.hash = hash.array;
obj.hash = hash.object;

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
  bundler,
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
