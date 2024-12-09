import deepClone from "./deepClone.js";
import deepMerge from "./deepMerge.js";
import deepEquals from "./deepEquals.js";
import id from "./id.js";
import strings from "./strings.js";
import time from "./time.js";

import chunk from "./chunk.js";
import shuffle from "./shuffle.js";

const array = {
  shuffle,
  chunk,
};

export { deepMerge, id, time, strings, shuffle, deepEquals, deepClone, array };
