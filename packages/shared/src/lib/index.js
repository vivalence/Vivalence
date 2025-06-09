import deepClone from "./deepClone.js";
import deepMerge from "./deepMerge.js";
import deepEquals from "./deepEquals.js";

import uniqueBySlug from "./uniqueBySlug.js";
import stripOfNulls from "./stripOfNulls.js";

import is from "./is.js";
import id from "./id.js";
import strings from "./strings.js";
import time from "./time.js";
import fn from "./fn.js";

import sleep from "./sleep.js";
import random from "./random.js";
import promise from "./promise.js";
import array from "./array.js";

const obj = { deepMerge, deepEquals, deepClone, stripOfNulls };

const std = { id, fn, is, time, strings, obj, array, promise };
export {
  is,
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
