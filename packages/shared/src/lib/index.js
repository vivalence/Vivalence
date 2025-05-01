import deepClone from "./deepClone.js";
import deepMerge from "./deepMerge.js";
import deepEquals from "./deepEquals.js";

import uniqueBySlug from "./uniqueBySlug.js";

import id from "./id.js";
import strings from "./strings.js";
import time from "./time.js";

import hash from "./hash.ts";
import chunk from "./chunk.js";
import shuffle from "./shuffle.js";
import sleep from "./sleep.js";
import promise from "./promise.js";
import { merge as mergeArray } from "./array.js";

const array = {
  shuffle,
  merge: mergeArray,
  chunk,
  hash: hash.array,
};

const obj = { hash: hash.object, deepMerge, deepEquals, deepClone };

const std = { id, hash, time, strings, obj, array, promise };
export {
  promise,
  sleep,
  std,
  array,
  obj,
  strings,
  id,
  time,
  hash,

  //api depracated
  uniqueBySlug,
  deepMerge,
  shuffle,
  deepEquals,
  deepClone,
};
export default std;
