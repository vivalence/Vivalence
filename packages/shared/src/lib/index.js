import deepClone from "./deepClone.js";
import deepMerge from "./deepMerge.js";
import deepEquals from "./deepEquals.js";

import uniqueBySlug from "./uniqueBySlug.js";

import id from "./id.js";
import strings from "./strings.js";
import time from "./time.js";
import once from "./once.js";

import sleep from "./sleep.js";
import random from "./random.js";
import promise from "./promise.js";
import array from "./array.js";

const fn = {
  once,
};

const obj = { deepMerge, deepEquals, deepClone };

const std = { id, fn, time, strings, obj, array, promise };
export {
  fn,
  random,
  promise,
  sleep,
  std,
  array,
  obj,
  strings,
  id,
  time,

  //api depracated
  uniqueBySlug,
  deepMerge,
  deepEquals,
  deepClone,
};
export default std;
