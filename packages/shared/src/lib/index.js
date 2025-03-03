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

const array = {
  shuffle,
  chunk,
};

const obj = { deepMerge, deepEquals, deepClone };
const std = { hash, id, time, strings, obj, array };
export {
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
